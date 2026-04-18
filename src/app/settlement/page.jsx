'use client';

import { useEffect, useState } from 'react';
import useFarmStore from '@/store/useFarmStore';
import useLanguageStore from '@/store/useLanguageStore';
import { getExpenses, getIncome, getWorkers } from '@/lib/actions';
import toast from 'react-hot-toast';
import { Calculator, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';

export default function SettlementPage() {
  const { selectedFarmId } = useFarmStore();
  const { t } = useLanguageStore();
  const [data, setData] = useState({ workers: [], upad: [], majuri: [], pesticide: [], income: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (selectedFarmId) loadData(); }, [selectedFarmId]);

  const loadData = async () => {
    setLoading(true);
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
    finally { setLoading(false); }
  };

  const totalIncome    = data.income.reduce((a, c) => a + Number(c.amount), 0);
  const totalPesticide = data.pesticide.reduce((a, c) => a + Number(c.amount), 0);
  const totalUpad      = data.upad.reduce((a, c) => a + Number(c.amount), 0);
  const totalMajuri    = data.majuri.reduce((a, c) => a + Number(c.amount), 0);
  const netFarm        = totalIncome - totalPesticide - totalUpad - totalMajuri;

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col pb-10">
      <PageHeader title={t('finalSettlement')} icon={Calculator} iconBg="bg-rose-500/30" iconColor="text-rose-400" />

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="p-4 space-y-4">
          {/* Refresh */}
          <button onClick={loadData} className="ml-auto flex items-center gap-1.5 text-gray-400 text-sm hover:text-white transition-colors">
            <RefreshCw className="w-3.5 h-3.5" /> {t('refresh')}
          </button>

          {/* Total Income */}
          <div className="bg-gradient-to-br from-emerald-500/20 to-teal-600/10 border border-emerald-500/20 rounded-3xl p-6">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <p className="text-emerald-300 text-sm font-medium">{t('totalCropIncome')}</p>
            </div>
            <p className="text-4xl font-black text-white">₹{totalIncome.toLocaleString('en-IN')}</p>
          </div>

          {/* Expense summary — 3 cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white/5 border border-white/10 rounded-3xl p-4">
              <p className="text-gray-500 text-xs font-medium mb-1">{t('pesticideOther')}</p>
              <p className="text-lg font-black text-orange-400">₹{totalPesticide.toLocaleString('en-IN')}</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-3xl p-4">
              <p className="text-gray-500 text-xs font-medium mb-1">{t('totalUpadGivenShort')}</p>
              <p className="text-lg font-black text-blue-400">₹{totalUpad.toLocaleString('en-IN')}</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-3xl p-4">
              <p className="text-gray-500 text-xs font-medium mb-1">{t('totalMajuriShort')}</p>
              <p className="text-lg font-black text-yellow-400">₹{totalMajuri.toLocaleString('en-IN')}</p>
            </div>
          </div>

          {/* Net Balance */}
          <div className={`border rounded-3xl p-5 flex items-center justify-between ${netFarm >= 0 ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
            <div className="flex items-center gap-2">
              {netFarm >= 0 ? <TrendingUp className="w-5 h-5 text-emerald-400" /> : <TrendingDown className="w-5 h-5 text-red-400" />}
              <span className={`font-bold ${netFarm >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{t('netBalance')}</span>
            </div>
            <span className={`text-2xl font-black ${netFarm >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {netFarm < 0 ? '-' : ''}₹{Math.abs(netFarm).toLocaleString('en-IN')}
            </span>
          </div>

          {/* Worker Settlements */}
          <h2 className="text-white font-bold text-lg pt-2">{t('workerSettlements')}</h2>

          {data.workers.length === 0 ? (
            <div className="bg-white/5 border border-white/10 rounded-3xl p-10 text-center text-gray-500">
              {t('addWorkersToSee')}
            </div>
          ) : (
            <div className="space-y-4">
              {data.workers.map((worker, i) => {
                const workerUpad   = data.upad.filter(u => u.worker_id === worker.id).reduce((a, c) => a + Number(c.amount), 0);
                const workerMajuri = data.majuri.filter(m => m.worker_id === worker.id).reduce((a, c) => a + Number(c.amount), 0);
                const grossShare   = totalIncome * (Number(worker.share_percentage) / 100);
                const netPayable   = grossShare - workerUpad - workerMajuri;
                const isPositive   = netPayable >= 0;

                return (
                  <div key={worker.id} className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
                    {/* Worker Header */}
                    <div className="flex items-center gap-4 p-5 border-b border-white/5">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-lg ${
                        ['bg-blue-500','bg-purple-500','bg-emerald-500','bg-orange-500'][i % 4]
                      }`}>
                        {worker.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-base">{worker.name}</h3>
                        <span className="text-sm text-gray-400">{worker.share_percentage}{t('share')}</span>
                      </div>
                    </div>

                    {/* Calculation */}
                    <div className="p-5 space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">{t('shareFromIncome')}</span>
                        <span className="text-white font-semibold">₹{Math.round(grossShare).toLocaleString('en-IN')}</span>
                      </div>
                      {workerUpad > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">{t('upadGiven')}</span>
                          <span className="text-blue-400 font-semibold">- ₹{Math.round(workerUpad).toLocaleString('en-IN')}</span>
                        </div>
                      )}
                      {workerMajuri > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">{t('majuriDeducted')}</span>
                          <span className="text-yellow-400 font-semibold">- ₹{Math.round(workerMajuri).toLocaleString('en-IN')}</span>
                        </div>
                      )}
                      <div className="h-px bg-white/10 my-2" />
                      <div className="flex justify-between items-center">
                        <span className="text-white font-bold text-sm">{t('netPayable')}</span>
                        <span className={`text-2xl font-black ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                          {!isPositive && '- '}₹{Math.abs(Math.round(netPayable)).toLocaleString('en-IN')}
                        </span>
                      </div>
                      {!isPositive && (
                        <p className="text-red-400/70 text-xs text-right">{t('upadExceedsShare')}</p>
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
