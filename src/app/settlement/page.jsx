'use client';

import { useEffect, useState } from 'react';
import useAppStore from '@/store/useFarmStore';
import useLanguageStore from '@/store/useLanguageStore';
import { getExpenses, getIncome, getWorkers } from '@/lib/actions';
import toast from 'react-hot-toast';
import { Calculator, TrendingUp, TrendingDown, Share2 } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';

export default function SettlementPage() {
  const { selectedFarmId, invalidateAllForFarm } = useAppStore();
  const { t } = useLanguageStore();
  const [data, setData] = useState({ workers: [], upad: [], majuri: [], pesticide: [], income: [] });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { if (selectedFarmId) loadData(); }, [selectedFarmId]);

  const loadData = async (force = false) => {
    if (force) setRefreshing(true);
    else setLoading(true);

    try {
      const [workers, upad, majuri, pesticide, income] = await Promise.all([
        getWorkers(selectedFarmId),
        getExpenses(selectedFarmId, 'upad'),
        getExpenses(selectedFarmId, 'majuri'),
        getExpenses(selectedFarmId, 'pesticide'),
        getIncome(selectedFarmId),
      ]);
      setData({ workers, upad, majuri, pesticide, income });
    } catch { toast.error('Failed to load data'); }
    finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    invalidateAllForFarm(selectedFarmId);
    await loadData(true);
    toast.success('Data updated');
  };

  const totalIncome = data.income.reduce((a, c) => a + Number(c.amount), 0);
  const totalPesticide = data.pesticide.reduce((a, c) => a + Number(c.amount), 0);
  const totalUpad = data.upad.reduce((a, c) => a + Number(c.amount), 0);
  const totalMajuri = data.majuri.reduce((a, c) => a + Number(c.amount), 0);
  const netFarm = totalIncome - totalPesticide - totalUpad - totalMajuri;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col ">
      <PageHeader
        title={t('finalSettlement')}
        actionIcon={Share2}
        onRefresh={handleRefresh}
        refreshing={refreshing}
      />

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-green-200 border-t-[#166534] rounded-full animate-spin" />
        </div>
      ) : (
        <div className="p-4 space-y-4 pb-20">
          {/* Total Income */}
          <div className="bg-green-50 border border-green-200 rounded-3xl p-6">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-5 h-5 text-[#166534]" />
              <p className="text-gray-600 text-sm font-medium">{t('totalCropIncome')}</p>
            </div>
            <p className="text-4xl font-black text-gray-900">₹{totalIncome.toLocaleString('en-IN')}</p>
          </div>

          {/* Expense summary — 3 cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white border border-gray-100 rounded-3xl p-4 shadow-sm text-center">
              <p className="text-gray-500 text-xs font-medium mb-1">{t('pesticideOther')}</p>
              <p className="text-lg font-bold text-red-500">₹{totalPesticide.toLocaleString('en-IN')}</p>
            </div>
            <div className="bg-white border border-gray-100 rounded-3xl p-4 shadow-sm text-center">
              <p className="text-gray-500 text-xs font-medium mb-1">{t('totalUpadGivenShort')}</p>
              <p className="text-lg font-bold text-blue-500">₹{totalUpad.toLocaleString('en-IN')}</p>
            </div>
            <div className="bg-white border border-gray-100 rounded-3xl p-4 shadow-sm text-center">
              <p className="text-gray-500 text-xs font-medium mb-1">{t('totalMajuriShort')}</p>
              <p className="text-lg font-bold text-yellow-600">₹{totalMajuri.toLocaleString('en-IN')}</p>
            </div>
          </div>

          {/* Net Balance */}
          <div className={`border rounded-3xl p-6 flex items-center justify-between shadow-sm ${netFarm >= 0 ? 'bg-[#166534] border-[#166534]' : 'bg-red-500 border-red-500'}`}>
            <div className="flex items-center gap-2">
              {netFarm >= 0 ? <TrendingUp className="w-6 h-6 text-yellow-400" /> : <TrendingDown className="w-6 h-6 text-white" />}
              <span className="font-bold text-white text-lg">{t('netBalance')}</span>
            </div>
            <span className="text-3xl font-black text-white">
              {netFarm < 0 ? '-' : ''}₹{Math.abs(netFarm).toLocaleString('en-IN')}
            </span>
          </div>

          {/* Worker Settlements */}
          <h2 className="text-gray-900 font-bold text-lg pt-4">{t('workerSettlements')}</h2>

          {data.workers.length === 0 ? (
            <div className="bg-white border border-gray-100 rounded-3xl p-10 text-center text-gray-500 shadow-sm">
              {t('addWorkersToSee')}
            </div>
          ) : (
            <div className="space-y-4">
              {data.workers.map((worker, i) => {
                const workerUpad = data.upad.filter(u => u.worker_id === worker.id).reduce((a, c) => a + Number(c.amount), 0);
                const workerMajuri = data.majuri.filter(m => m.worker_id === worker.id).reduce((a, c) => a + Number(c.amount), 0);
                const grossShare = totalIncome * (Number(worker.share_percentage) / 100);
                const netPayable = grossShare - workerUpad - workerMajuri;
                const isPositive = netPayable >= 0;

                return (
                  <div key={worker.id} className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
                    {/* Worker Header */}
                    <div className="flex items-center gap-4 p-5 border-b border-gray-50">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-xl ${['bg-blue-500', 'bg-purple-500', 'bg-emerald-500', 'bg-orange-500'][i % 4]
                        }`}>
                        {worker.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg">{worker.name}</h3>
                        <span className="text-sm font-semibold text-gray-500">{worker.share_percentage}{t('% share')}</span>
                      </div>
                    </div>

                    {/* Calculation */}
                    <div className="p-5 space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500 font-medium">{t('shareFromIncome')}</span>
                        <span className="text-gray-900 font-bold">₹{Math.round(grossShare).toLocaleString('en-IN')}</span>
                      </div>
                      {workerUpad > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500 font-medium">{t('upadGiven')}</span>
                          <span className="text-blue-500 font-bold">- ₹{Math.round(workerUpad).toLocaleString('en-IN')}</span>
                        </div>
                      )}
                      {workerMajuri > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500 font-medium">{t('majuriDeducted')}</span>
                          <span className="text-yellow-600 font-bold">- ₹{Math.round(workerMajuri).toLocaleString('en-IN')}</span>
                        </div>
                      )}
                      <div className="h-px bg-gray-100 my-2" />
                      <div className="flex justify-between items-center">
                        <span className="text-gray-900 font-bold text-base">{t('netPayable')}</span>
                        <span className={`text-2xl font-black ${isPositive ? 'text-[#166534]' : 'text-red-500'}`}>
                          {!isPositive && '- '}₹{Math.abs(Math.round(netPayable)).toLocaleString('en-IN')}
                        </span>
                      </div>
                      {!isPositive && (
                        <p className="text-red-500/80 text-xs text-right mt-1 font-medium">{t('upadExceedsShare')}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
