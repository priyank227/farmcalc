'use client';

import { FarmSelector } from '@/components/FarmSelector';
import useFarmStore from '@/store/useFarmStore';
import useLanguageStore from '@/store/useLanguageStore';
import { resetFarmData } from '@/lib/actions';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { Wallet, Bug, IndianRupee, Users, Calculator, AlertTriangle, ChevronRight, LogOut, HardHat, User, Shield } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';

export default function Dashboard() {
  const { selectedFarmId, user } = useFarmStore();
  const { t } = useLanguageStore();
  const [resetModal, setResetModal] = useState(false);
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const handleReset = async (e) => {
    e.preventDefault();
    if (pin.length !== 4) return toast.error('PIN must be 4 digits');
    setLoading(true);
    const res = await resetFarmData(selectedFarmId, pin);
    setLoading(false);
    if (res.success) {
      toast.success('Farm data reset successfully');
      setResetModal(false);
      setPin('');
    } else {
      toast.error(res.message || 'Reset failed');
    }
  };

  // First 4 items — displayed in 2×2 grid
  const gridItems = [
    { titleKey: 'workers', descKey: 'workersDesc', icon: Users, href: '/workers', gradient: 'from-purple-500 to-violet-600', glow: 'shadow-purple-500/30' },
    { titleKey: 'workerMajuri', descKey: 'workerMajuriDesc', icon: HardHat, href: '/expenses/majuri', gradient: 'from-yellow-500 to-amber-600', glow: 'shadow-yellow-500/30' },
    { titleKey: 'workerUpad', descKey: 'workerUpadDesc', icon: Wallet, href: '/expenses/upad', gradient: 'from-blue-500 to-indigo-600', glow: 'shadow-blue-500/30' },
    { titleKey: 'cropIncome', descKey: 'cropIncomeDesc', icon: IndianRupee, href: '/income', gradient: 'from-emerald-500 to-teal-600', glow: 'shadow-emerald-500/30' },
  ];

  // Full-width action cards below the grid
  const wideItems = [
    { titleKey: 'farmExpenses', descKey: 'farmExpensesDesc', icon: Bug, href: '/expenses/pesticide', gradient: 'from-orange-500 to-amber-600', glow: 'shadow-orange-500/30' },
    { titleKey: 'settlement', descKey: 'settlementDesc', icon: Calculator, href: '/settlement', gradient: 'from-rose-500 to-pink-600', glow: 'shadow-rose-500/30' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-950">
      {/* Header */}
      <div className="bg-gray-950 border-b border-white/5 px-5 pt-12 pb-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl overflow-hidden shadow-lg shadow-green-500/20">
              <Image src="/icon.jpg" alt="FarmCalc" width={36} height={36} className="w-full h-full object-cover" priority />
            </div>
            <span className="text-white font-black text-xl">FarmCalc</span>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <Link href="/profile" className="w-9 h-9 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-lg shadow-green-500/20 active:scale-95 transition-all">
              {user?.name ? user.name.charAt(0).toUpperCase() : <User className="w-5 h-5" />}
            </Link>
          </div>
        </div>
        <FarmSelector />
      </div>

      {/* Body */}
      {!selectedFarmId ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <div className="w-20 h-20 bg-yellow-500/10 rounded-3xl flex items-center justify-center mb-5">
            <AlertTriangle className="w-10 h-10 text-yellow-400 opacity-80" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">{t('noFarmSelected')}</h2>
          <p className="text-gray-500 text-sm leading-relaxed">{t('noFarmDesc')}</p>
        </div>
      ) : (
        <main className="flex-1 p-4 pt-5 pb-10">
          {/* 2×2 grid */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            {gridItems.map((item, i) => (
              <Link key={i} href={item.href}>
                <div className={`bg-gradient-to-br ${item.gradient} rounded-3xl p-5 text-white shadow-xl ${item.glow} active:scale-[0.96] transition-transform h-36 flex flex-col justify-between`}>
                  <div className="w-11 h-11 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                    <item.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base leading-tight">{t(item.titleKey)}</h3>
                    <p className="text-white/70 text-xs mt-0.5">{t(item.descKey)}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Full-width cards (Majuri + Settlement) */}
          {wideItems.map((item, i) => (
            <Link key={i} href={item.href}>
              <div className={`bg-gradient-to-r ${item.gradient} rounded-3xl p-5 text-white shadow-xl ${item.glow} active:scale-[0.98] transition-transform flex items-center justify-between mb-3`}>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                    <item.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{t(item.titleKey)}</h3>
                    <p className="text-white/70 text-sm">{t(item.descKey)}</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-white/50" />
              </div>
            </Link>
          ))}

          {/* Reset button */}
          {/* <button
            onClick={() => setResetModal(true)}
            className="w-full py-4 bg-white/5 border border-red-500/20 rounded-3xl text-red-400 font-semibold flex items-center justify-center gap-2 active:bg-red-500/10 transition-colors mt-1"
          >
            <AlertTriangle className="w-4 h-4" />
            {t('resetSeasonData')}
          </button> */}
        </main>
      )}

      {/* Reset Modal */}
      {resetModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end justify-center z-50 p-4 pb-6">
          <div className="bg-gray-900 border border-white/10 rounded-3xl p-6 w-full max-w-sm shadow-2xl">
            <div className="w-12 h-12 bg-red-500/20 text-red-400 rounded-2xl flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">{t('resetAllData')}</h2>
            <p className="text-gray-400 text-sm mb-6">{t('resetAllDataDesc')}</p>
            <form onSubmit={handleReset}>
              <input
                type="password"
                placeholder={t('enterPin')}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/30 outline-none focus:border-red-400/60 mb-4 text-center text-xl tracking-widest"
                required
                autoFocus
              />
              <div className="flex gap-3">
                <button type="button" onClick={() => { setResetModal(false); setPin(''); }} className="flex-1 py-3.5 rounded-2xl bg-white/10 text-white font-semibold">{t('cancel')}</button>
                <button type="submit" disabled={loading} className="flex-1 py-3.5 rounded-2xl bg-red-500 text-white font-bold disabled:opacity-50">
                  {loading ? t('resetting') : t('resetBtn')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
