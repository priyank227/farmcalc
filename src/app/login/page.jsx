'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login, register, checkUserExists } from '@/lib/auth';
import toast from 'react-hot-toast';
import { Delete } from 'lucide-react';
import Image from 'next/image';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import useLanguageStore from '@/store/useLanguageStore';

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [mobile, setMobile] = useState('');
  const [pin, setPin] = useState('');
  const [name, setName] = useState('');
  const [step, setStep] = useState('mobile'); // 'mobile' | 'pin'
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { t } = useLanguageStore();

  const handleMobileNext = async (e) => {
    e.preventDefault();
    if (mobile.length < 10) return toast.error('Enter a valid 10-digit mobile number');
    
    setLoading(true);
    const result = await checkUserExists(mobile);
    setLoading(false);
    
    setIsRegister(!result.exists);
    // Auto-fill name from worker record if they are a known worker
    if (result.workerName) setName(result.workerName);
    setStep('pin');
  };

  const handlePinDelete = () => setPin(prev => prev.slice(0, -1));

  const handleDigit = async (digit) => {
    const newPin = pin + digit;
    if (pin.length < 4) {
      setPin(newPin);
      if (newPin.length === 4) {
        setLoading(true);
        const res = isRegister ? await register(mobile, newPin, name) : await login(mobile, newPin);
        if (res?.success) {
          import('@/store/useFarmStore').then((module) => {
             module.default.getState().clearStore();
          });
          toast.success(isRegister ? 'Account created!' : 'Welcome back!');
          router.push('/');
          router.refresh();
        } else {
          toast.error(res?.message || 'Authentication failed');
          setPin('');
          setLoading(false);
        }
      }
    }
  };

  const numpad = ['1','2','3','4','5','6','7','8','9','','0','⌫'];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-950 via-green-950 to-gray-950 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-green-600/5 rounded-full blur-3xl" />
      </div>

      {/* Language Switcher top-right */}
      <div className="absolute top-12 right-5 z-20">
        <LanguageSwitcher />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 relative z-10">
        
        {/* Logo */}
        <div className="flex flex-col items-center mb-10 slide-up">
          <div className="w-24 h-24 rounded-3xl overflow-hidden mb-5 shadow-2xl shadow-green-500/30">
            <Image src="/icon.jpg" alt="FarmCalc Logo" width={96} height={96} className="w-full h-full object-cover" priority />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">FarmCalc</h1>
          <p className="text-green-400/80 text-sm mt-1 font-medium">{t('loginTagline')}</p>
        </div>

        {/* Card */}
        <div className="w-full max-w-sm slide-up slide-up-delay-1">
          {step === 'mobile' ? (
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-7 shadow-2xl">
              <h2 className="text-xl font-bold text-white mb-1">
                {t('welcomeBack')}
              </h2>
              <p className="text-gray-400 text-sm mb-7">
                {t('loginSubtitle')}
              </p>

              <form onSubmit={handleMobileNext}>
                <div className="mb-5">
                  <label className="text-xs font-semibold text-green-400 uppercase tracking-wider block mb-2">{t('mobileNumber')}</label>
                  <div className="flex items-center gap-3 bg-white/10 border border-white/20 rounded-2xl px-4 py-4 focus-within:border-green-400/60 focus-within:bg-white/15 transition-all">
                    <span className="text-gray-400 font-semibold text-lg">+91</span>
                    <div className="w-px h-6 bg-white/20" />
                    <input
                      type="tel"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      className="flex-1 bg-transparent text-white text-lg font-semibold outline-none placeholder-white/30"
                      placeholder="9876543210"
                      autoFocus
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-2xl shadow-lg shadow-green-500/25 disabled:opacity-50 active:scale-[0.98] transition-all text-lg"
                >
                  {loading ? '...' : t('continueBtn')}
                </button>
              </form>
            </div>
          ) : (
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-7 shadow-2xl">
              <button onClick={() => { setStep('mobile'); setPin(''); setName(''); }} className="text-green-400 text-sm mb-5 flex items-center gap-1 hover:text-green-300">
                {t('changeNumber')}
              </button>
              <h2 className="text-xl font-bold text-white mb-1">{isRegister ? t('setPinTitle') : t('enterPinTitle')}</h2>
              <p className="text-gray-400 text-sm mb-2">
                {isRegister ? t('setPinSubtitle') : t('enterPinSubtitle')}
              </p>
              <p className="text-green-400 font-semibold text-sm mb-5">+91 {mobile}</p>

              {/* Name field — only show for new sign-ups and only if not auto-filled as a worker */}
              {isRegister && (
                <div className="mb-5">
                  <label className="text-xs font-semibold text-green-400 uppercase tracking-wider block mb-2">{t('yourName')}</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ramesh Patel"
                    className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/30 outline-none focus:border-green-400/60"
                    required
                  />
                  {!!name && <p className="text-xs text-green-400/70 mt-1.5">✓ Name pre-filled from your worker profile</p>}
                </div>
              )}

              {/* PIN dots */}
              <div className="flex justify-center gap-5 mb-8">
                {[0, 1, 2, 3].map(i => (
                  <div key={i} className={`w-5 h-5 rounded-full border-2 transition-all duration-200 ${i < pin.length ? 'bg-green-400 border-green-400 scale-110' : 'bg-transparent border-white/30'}`} />
                ))}
              </div>

              {/* Numpad */}
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  {numpad.map((key, i) => {
                    if (key === '') return <div key={i} />;
                    if (key === '⌫') return (
                      <button
                        key={i}
                        onClick={handlePinDelete}
                        className="h-16 rounded-2xl bg-white/10 text-white flex items-center justify-center active:bg-white/20 transition-all active:scale-95"
                      >
                        <Delete className="w-5 h-5" />
                      </button>
                    );
                    return (
                      <button
                        key={i}
                        onClick={() => handleDigit(key)}
                        className="h-16 rounded-2xl bg-white/10 text-white text-xl font-bold flex items-center justify-center active:bg-green-500/30 active:scale-95 transition-all border border-white/5"
                      >
                        {key}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
