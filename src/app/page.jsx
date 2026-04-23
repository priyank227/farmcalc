'use client';

import { FarmSelector } from '@/components/FarmSelector';
import useFarmStore from '@/store/useFarmStore';
import useLanguageStore from '@/store/useLanguageStore';
import { getExpenses, getIncome } from '@/lib/actions';
import { useState, useEffect } from 'react';
import { Wallet, Bug, IndianRupee, Users, Calculator, Bell, ChevronRight, Home, FileText, Settings, Tractor, TrendingUp, HardHat, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';

export default function Dashboard() {
  const { selectedFarmId, user, farms, cache, setCache, invalidateCache } = useFarmStore();
  const { t } = useLanguageStore();

  const [netBalance, setNetBalance] = useState(null);
  const [stats, setStats] = useState({ workersShare: 0, farmersShare: 0, workersCount: 0 });
  const [loadingBalance, setLoadingBalance] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadBalance = async (force = false) => {
    if (!selectedFarmId) {
      setLoadingBalance(false);
      return;
    }

    // Stale-while-revalidate pattern
    const farmCache = cache[selectedFarmId] || {};
    const cachedStats = farmCache['dashboardStats'];

    if (cachedStats && !force) {
      setNetBalance(cachedStats.netBalance);
      setStats(cachedStats.stats);
      setLoadingBalance(false); // Show UI instantly
      // Continue fetching silently in background
    } else {
      setLoadingBalance(true);
    }

    try {
      const { getWorkers } = await import('@/lib/actions');
      const [upad, majuri, pesticide, income, workers] = await Promise.all([
        getExpenses(selectedFarmId, 'upad'),
        getExpenses(selectedFarmId, 'majuri'),
        getExpenses(selectedFarmId, 'pesticide'),
        getIncome(selectedFarmId),
        getWorkers(selectedFarmId),
      ]);

      const totalIncome = income.reduce((a, c) => a + Number(c.amount), 0);
      const totalPesticide = pesticide.reduce((a, c) => a + Number(c.amount), 0);
      const totalUpad = upad.reduce((a, c) => a + Number(c.amount), 0);
      const totalMajuri = majuri.reduce((a, c) => a + Number(c.amount), 0);

      const netCash = totalIncome - totalPesticide - totalUpad - totalMajuri;
      setNetBalance(netCash);

      let workersGrossShare = 0;
      let workersNetPayable = 0;
      
      workers.forEach(w => {
        const grossShare = totalIncome * (Number(w.share_percentage) / 100);
        workersGrossShare += grossShare;
        
        const workerUpad = upad.filter(e => e.worker_id === w.id).reduce((a, c) => a + Number(c.amount), 0);
        const workerMajuri = majuri.filter(e => e.worker_id === w.id).reduce((a, c) => a + Number(c.amount), 0);
        
        workersNetPayable += (grossShare - workerUpad - workerMajuri);
      });
      
      const farmersShare = totalIncome - totalPesticide - workersGrossShare;

      const newStats = {
        workersShare: workersNetPayable,
        farmersShare,
        workersCount: workers.length
      };

      setStats(newStats);
      
      // Save to cache for instant loading next time
      setCache(selectedFarmId, 'dashboardStats', { netBalance: netCash, stats: newStats });
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingBalance(false);
    }
  };

  useEffect(() => {
    loadBalance();
  }, [selectedFarmId]);

  const handleRefresh = async () => {
    if (!selectedFarmId) return;
    setRefreshing(true);
    invalidateCache(selectedFarmId, 'expenses_upad');
    invalidateCache(selectedFarmId, 'expenses_majuri');
    invalidateCache(selectedFarmId, 'expenses_pesticide');
    invalidateCache(selectedFarmId, 'income');
    await loadBalance(true);
    setRefreshing(false);
  };

  const listItems = [
    { titleKey: 'workers', descKey: 'workersDesc', icon: Users, href: '/workers', iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600' },
    { titleKey: 'workerMajuri', descKey: 'workerMajuriDesc', icon: HardHat, href: '/expenses/majuri', iconBg: 'bg-yellow-50', iconColor: 'text-yellow-600' },
    { titleKey: 'workerUpad', descKey: 'workerUpadDesc', icon: Wallet, href: '/expenses/upad', iconBg: 'bg-orange-50', iconColor: 'text-orange-500' },
    { titleKey: 'farmExpenses', descKey: 'farmExpensesDesc', icon: Bug, href: '/expenses/pesticide', iconBg: 'bg-rose-50', iconColor: 'text-rose-500' },
    { titleKey: 'cropIncome', descKey: 'cropIncomeDesc', icon: IndianRupee, href: '/income', iconBg: 'bg-green-50', iconColor: 'text-green-600' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white px-5 pt-12 pb-4 flex items-center justify-between border-b border-gray-100">
        <div className="flex items-center gap-2">
          <img src="/icon.jpg" alt="FarmCalc Logo" className="w-10 h-10 rounded-xl object-cover shadow-sm" />
          <span className="text-[#166534] font-black text-xl">FarmCalc</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleRefresh} className="p-2 text-gray-500 active:scale-95 transition-transform" disabled={loadingBalance || refreshing}>
            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          <LanguageSwitcher />
        </div>
      </div>

      <div className="p-4">
        {/* Farm Selector */}
        <div className="mb-4">
          <FarmSelector />
        </div>

        {!selectedFarmId ? (
          <div className="flex flex-col items-center justify-center p-10 text-center bg-white border border-gray-100 rounded-3xl mt-4">
            <Tractor className="w-12 h-12 text-gray-300 mb-3" />
            <h2 className="text-lg font-bold text-gray-900 mb-1">{t('noFarmSelected')}</h2>
            <p className="text-gray-500 text-sm">{t('noFarmDesc')}</p>
          </div>
        ) : (
          <main className="space-y-4">
            {/* Net Balance Card */}
            <div className="bg-[#166534] rounded-3xl p-6 text-white relative overflow-hidden shadow-xl shadow-green-900/20">
              <div className="relative z-10">
                <p className="text-green-100 font-medium mb-1">{t('netBalance')}</p>
                {loadingBalance ? (
                  <div className="h-10 w-32 bg-white/20 rounded animate-pulse my-1" />
                ) : (
                  <>
                    <p className="text-4xl font-black mb-1">
                      {netBalance < 0 ? '-' : ''}₹{Math.abs(netBalance || 0).toLocaleString('en-IN')}
                    </p>
                    <p className="text-green-200 text-sm mb-4">{t('finalAmount')}</p>

                    <div className="flex items-center gap-4 border-t border-white/20 pt-4 mt-2">
                      <div className="flex-1">
                        <p className="text-white/60 text-xs font-medium uppercase tracking-wider">{t('farmersMoney') || "Farmer's Total"}</p>
                        <p className="text-lg font-bold">₹{Math.round(stats.farmersShare).toLocaleString('en-IN')}</p>
                      </div>
                      <div className="w-px h-8 bg-white/20" />
                      <div className="flex-1">
                        <p className="text-white/60 text-xs font-medium uppercase tracking-wider">{t('workersMoney') || "Worker's Total"} ({stats.workersCount})</p>
                        <p className="text-lg font-bold">₹{Math.round(stats.workersShare).toLocaleString('en-IN')}</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
              <TrendingUp className="absolute top-6 right-6 w-8 h-8 text-yellow-400 opacity-80" />
              {/* Decorative circle */}
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-2xl pointer-events-none" />
            </div>

            {/* List Items */}
            <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
              {listItems.map((item, i) => (
                <Link key={i} href={item.href}>
                  <div className={`flex items-center justify-between p-4 ${i !== listItems.length - 1 ? 'border-b border-gray-50' : ''} active:bg-gray-50 transition-colors`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 ${item.iconBg} rounded-2xl flex items-center justify-center`}>
                        <item.icon className={`w-6 h-6 ${item.iconColor}`} />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-base">{t(item.titleKey)}</h3>
                        <p className="text-gray-500 text-xs">{t(item.descKey)}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-300" />
                  </div>
                </Link>
              ))}
            </div>

            {/* Final Settlement Button Card */}
            <Link href="/settlement" className="block">
              <div className="bg-[#166534] rounded-3xl p-5 flex items-center gap-4 text-white active:scale-[0.98] transition-all shadow-lg shadow-green-900/20">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                  <Calculator className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{t('settlement')}</h3>
                  <p className="text-green-100 text-sm">{t('settlementDesc')}</p>
                </div>
              </div>
            </Link>
          </main>
        )}
      </div>
    </div>
  );
}
