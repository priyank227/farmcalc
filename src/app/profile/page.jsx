'use client';

import { useEffect, useState } from 'react';
import useAppStore from '@/store/useFarmStore';
import useLanguageStore from '@/store/useLanguageStore';
import { getUserRecord, getFarms } from '@/lib/actions';
import { logout } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { Shield, User, LogOut, Loader2, History, ChevronRight } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function ProfilePage() {
  const { t } = useLanguageStore();
  const { invalidateCache, user, farms, setUser, setFarms } = useAppStore();
  const router = useRouter();

  const [loading, setLoading] = useState(!user || farms.length === 0);
  const [refreshing, setRefreshing] = useState(false);

  const load = async (force = false) => {
    if (force) setRefreshing(true);
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
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load();
  }, [setUser, setFarms]);

  const handleRefresh = async () => {
    await load(true);
    toast.success('Profile updated');
  };

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
    <div className="min-h-screen flex flex-col bg-gray-50 ">
      <PageHeader
        title={t('profile')}
        onRefresh={handleRefresh}
        refreshing={refreshing}
      />

      <div className="p-4 space-y-4 pb-20 pb-20">
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-8 h-8 text-[#166534] animate-spin" />
          </div>
        ) : (
          <>
            {/* User Details Box */}
            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
              <div className="flex flex-col items-center mb-6">
                <div className="w-20 h-20 bg-green-50 border border-green-100 rounded-full flex items-center justify-center text-3xl text-[#166534] font-black shadow-inner mb-3">
                  {user?.name ? (
                    <span className="text-2xl font-black">{user.name.charAt(0).toUpperCase()}</span>
                  ) : (
                    <User size={36} />
                  )}
                </div>
                <h2 className="text-gray-900 font-bold text-2xl">{user?.name || t('yourName')}</h2>
                <p className="text-[#166534] font-semibold text-sm mt-1">+91 {user?.mobile_number}</p>
                <p className="text-gray-400 font-medium text-xs mt-1">{t('joined')} {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}</p>
              </div>

              <div className="space-y-3">
                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 flex items-center justify-between">
                  <span className="text-gray-600 font-medium flex items-center gap-2">
                    <Shield className="w-4 h-4 text-purple-500" /> {t('owner')}
                  </span>
                  <span className="text-gray-900 font-bold">{ownerFarms} {ownerFarms === 1 ? 'Farm' : 'Farms'}</span>
                </div>

                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 flex items-center justify-between">
                  <span className="text-gray-600 font-medium flex items-center gap-2">
                    <User className="w-4 h-4 text-[#166534]" /> {t('worker')}
                  </span>
                  <span className="text-gray-900 font-bold">{workerFarms} {workerFarms === 1 ? 'Farm' : 'Farms'}</span>
                </div>
              </div>
            </div>

            {/* Action List */}
            <div className="space-y-2">
              <Link
                href="/profile/logs"
                className="block w-full bg-white border border-gray-100 rounded-3xl p-4 hover:bg-gray-50 transition-colors group shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500">
                      <History size={20} />
                    </div>
                    <div className="text-left">
                      <p className="text-gray-900 font-bold">{t('activityLogs') || 'Activity Logs'}</p>
                      <p className="text-gray-500 font-medium text-xs">View all your transitions & changes</p>
                    </div>
                  </div>
                  <ChevronRight className="text-gray-300 group-hover:text-gray-500 transition-colors" size={20} />
                </div>
              </Link>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="w-full py-4 bg-red-50 border border-red-100 text-red-600 rounded-3xl font-bold flex items-center justify-center gap-2 active:bg-red-100 transition-all text-lg mt-4 shadow-sm"
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
