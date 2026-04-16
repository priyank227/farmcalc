'use client';

import { FarmSelector } from '@/components/FarmSelector';
import useFarmStore from '@/store/useFarmStore';
import { resetFarmData } from '@/lib/actions';
import { useState } from 'react';
import { Input } from '@/components/ui/Input';
import toast from 'react-hot-toast';
import { Wallet, Bug, IndianRupee, Users, Calculator, AlertTriangle, ChevronRight, Sprout, LogOut } from 'lucide-react';
import Link from 'next/link';
import { logout } from '@/lib/auth';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const { selectedFarmId } = useFarmStore();
  const [resetModal, setResetModal] = useState(false);
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

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

  const handleLogout = async () => {
    await logout();
    router.push('/login');
    router.refresh();
  };

  const menuItems = [
    { 
      title: 'Worker Upad', 
      desc: 'Add worker advances', 
      icon: Wallet, 
      href: '/expenses/upad', 
      gradient: 'from-blue-500 to-indigo-600',
      glow: 'shadow-blue-500/30',
      light: 'bg-blue-50',
      text: 'text-blue-600'
    },
    { 
      title: 'Farm Expenses', 
      desc: 'Pesticide & materials', 
      icon: Bug, 
      href: '/expenses/pesticide', 
      gradient: 'from-orange-500 to-amber-600',
      glow: 'shadow-orange-500/30',
      light: 'bg-orange-50',
      text: 'text-orange-600'
    },
    { 
      title: 'Crop Income', 
      desc: 'Money from crops', 
      icon: IndianRupee, 
      href: '/income', 
      gradient: 'from-emerald-500 to-teal-600',
      glow: 'shadow-emerald-500/30',
      light: 'bg-emerald-50',
      text: 'text-emerald-600'
    },
    { 
      title: 'Workers', 
      desc: 'Manage & set shares', 
      icon: Users, 
      href: '/workers', 
      gradient: 'from-purple-500 to-violet-600',
      glow: 'shadow-purple-500/30',
      light: 'bg-purple-50',
      text: 'text-purple-600'
    },
    { 
      title: 'Settlement', 
      desc: 'Final Hisab & calculation', 
      icon: Calculator, 
      href: '/settlement', 
      gradient: 'from-rose-500 to-pink-600',
      glow: 'shadow-rose-500/30',
      light: 'bg-rose-50',
      text: 'text-rose-600'
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-950">
      {/* Header */}
      <div className="bg-gray-950 border-b border-white/5 px-5 pt-12 pb-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-600 rounded-xl flex items-center justify-center">
              <Sprout className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-black text-xl">FarmCalc</span>
          </div>
          <button onClick={handleLogout} className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/20 transition-all active:scale-95">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
        {/* Farm selector */}
        <FarmSelector />
      </div>

      {/* Body */}
      {!selectedFarmId ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <div className="w-20 h-20 bg-yellow-500/10 rounded-3xl flex items-center justify-center mb-5">
            <AlertTriangle className="w-10 h-10 text-yellow-400 opacity-80" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">No Farm Selected</h2>
          <p className="text-gray-500 text-sm leading-relaxed">Create or select a farm using the dropdown above to begin tracking.</p>
        </div>
      ) : (
        <main className="flex-1 p-4 pt-5 pb-10">
          {/* 2-col grid for first 4 items */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            {menuItems.slice(0, 4).map((item, i) => (
              <Link key={i} href={item.href}>
                <div className={`bg-gradient-to-br ${item.gradient} rounded-3xl p-5 text-white shadow-xl ${item.glow} active:scale-[0.96] transition-transform h-36 flex flex-col justify-between`}>
                  <div className="w-11 h-11 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                    <item.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base leading-tight">{item.title}</h3>
                    <p className="text-white/70 text-xs mt-0.5">{item.desc}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Full width settlement card */}
          <Link href={menuItems[4].href}>
            <div className={`bg-gradient-to-r ${menuItems[4].gradient} rounded-3xl p-5 text-white shadow-xl ${menuItems[4].glow} active:scale-[0.98] transition-transform flex items-center justify-between mb-4`}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <Calculator className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{menuItems[4].title}</h3>
                  <p className="text-white/70 text-sm">{menuItems[4].desc}</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-white/50" />
            </div>
          </Link>

          {/* Reset button */}
          <button
            onClick={() => setResetModal(true)}
            className="w-full py-4 bg-white/5 border border-red-500/20 rounded-3xl text-red-400 font-semibold flex items-center justify-center gap-2 active:bg-red-500/10 transition-colors"
          >
            <AlertTriangle className="w-4 h-4" />
            Reset Season Data
          </button>
        </main>
      )}

      {/* Reset Modal */}
      {resetModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end justify-center z-50 p-4 pb-6">
          <div className="bg-gray-900 border border-white/10 rounded-3xl p-6 w-full max-w-sm shadow-2xl">
            <div className="w-12 h-12 bg-red-500/20 text-red-400 rounded-2xl flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Reset All Data?</h2>
            <p className="text-gray-400 text-sm mb-6">This will wipe all expenses, income, and workers for this farm. This cannot be undone.</p>
            <form onSubmit={handleReset}>
              <input
                type="password"
                placeholder="Enter 4-digit PIN"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/30 outline-none focus:border-red-400/60 mb-4 text-center text-xl tracking-widest"
                required
                autoFocus
              />
              <div className="flex gap-3">
                <button type="button" onClick={() => { setResetModal(false); setPin(''); }} className="flex-1 py-3.5 rounded-2xl bg-white/10 text-white font-semibold">Cancel</button>
                <button type="submit" disabled={loading} className="flex-1 py-3.5 rounded-2xl bg-red-500 text-white font-bold disabled:opacity-50">
                  {loading ? 'Resetting...' : 'Reset'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
