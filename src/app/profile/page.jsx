'use client';

import { useEffect, useState } from 'react';
import useAppStore from '@/store/useFarmStore';
import useLanguageStore from '@/store/useLanguageStore';
import { getUserRecord, getFarms } from '@/lib/actions';
import { logout } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { Shield, User, LogOut, Loader2, Phone } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';

export default function ProfilePage() {
  const { t } = useLanguageStore();
  const { invalidateCache } = useAppStore();
  const router = useRouter();
  
  const [user, setUser] = useState(null);
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [userData, farmsData] = await Promise.all([
          getUserRecord(),
          getFarms()
        ]);
        setUser(userData);
        setFarms(farmsData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleLogout = async () => {
    await logout();
    // Invalidate local farm cache so different user doesn't see it (though it keys by farmid, still good measure)
    invalidateCache('global', 'farms');
    router.push('/login');
    router.refresh();
  };

  const ownerFarms = farms.filter(f => f.role === 'owner').length;
  const workerFarms = farms.filter(f => f.role === 'worker').length;

  return (
    <div className="min-h-screen flex flex-col bg-gray-950 pb-10">
      <PageHeader title={t('profile')} icon={User} iconBg="bg-blue-500/30" iconColor="text-blue-400" />
      
      <div className="p-4 space-y-4">
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
          </div>
        ) : (
          <>
            {/* User Details Box */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
              <div className="flex flex-col items-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-3xl text-white font-black shadow-lg shadow-blue-500/20 mb-3">
                  {user?.name ? (
                    <span className="text-2xl font-black">{user.name.charAt(0).toUpperCase()}</span>
                  ) : (
                    <User size={36} />
                  )}
                </div>
                <h2 className="text-white font-bold text-2xl">{user?.name || t('yourName')}</h2>
                <p className="text-green-400 font-semibold text-sm mt-1">+91 {user?.mobile_number}</p>
                <p className="text-gray-400 text-xs mt-1">{t('joined')} {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}</p>
              </div>

              <div className="space-y-3">
                <div className="bg-gray-900 border border-white/5 rounded-2xl p-4 flex items-center justify-between">
                  <span className="text-gray-400 font-medium flex items-center gap-2">
                    <Shield className="w-4 h-4 text-purple-400" /> {t('owner')}
                  </span>
                  <span className="text-white font-bold">{ownerFarms} {ownerFarms === 1 ? 'Farm' : 'Farms'}</span>
                </div>
                
                <div className="bg-gray-900 border border-white/5 rounded-2xl p-4 flex items-center justify-between">
                  <span className="text-gray-400 font-medium flex items-center gap-2">
                    <User className="w-4 h-4 text-emerald-400" /> {t('worker')}
                  </span>
                  <span className="text-white font-bold">{workerFarms} {workerFarms === 1 ? 'Farm' : 'Farms'}</span>
                </div>
              </div>
            </div>

            {/* Logout Button */}
            <button 
              onClick={handleLogout}
              className="w-full py-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-3xl font-bold flex items-center justify-center gap-2 active:bg-red-500/20 transition-all text-lg shadow-lg shadow-red-500/5 mt-4"
            >
              <LogOut className="w-5 h-5" />
              {t('logout')}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
