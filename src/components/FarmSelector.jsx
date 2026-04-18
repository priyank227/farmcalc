'use client';

import { useEffect, useState } from 'react';
import useFarmStore from '@/store/useFarmStore';
import useLanguageStore from '@/store/useLanguageStore';
import { getFarms, createFarm, getUserRecord } from '@/lib/actions';
import toast from 'react-hot-toast';
import { ChevronDown, Plus, Tractor } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function FarmSelector() {
  const { selectedFarmId, setSelectedFarmId, farms, setFarms, setUserName } = useFarmStore();
  const { t } = useLanguageStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [newFarmName, setNewFarmName] = useState('');
  const [loading, setLoading] = useState(farms.length === 0);
  const router = useRouter();

  useEffect(() => { loadFarms(); }, []);

  const loadFarms = async () => {
    try {
      const [data, userRec] = await Promise.all([getFarms(), getUserRecord()]);
      setFarms(data);
      if (userRec?.name) setUserName(userRec.name);
      if (data.length > 0 && (!selectedFarmId || !data.find(f => f.id === selectedFarmId))) {
        setSelectedFarmId(data[0].id);
      }
    } catch (error) {
      if (error.message === 'Unauthorized') router.push('/login');
      else toast.error('Failed to load farms');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFarm = async (e) => {
    e.preventDefault();
    if (!newFarmName.trim()) return;
    try {
      const farm = await createFarm(newFarmName, '');
      setFarms([farm, ...farms]);
      setSelectedFarmId(farm.id);
      setIsModalOpen(false);
      setNewFarmName('');
      toast.success('Farm created!');
    } catch {
      toast.error('Error creating farm');
    }
  };

  const selectedFarm = farms.find(f => f.id === selectedFarmId);

  return (
    <>
      {/* Farm Selector Button */}
      <div className="relative">
        {loading ? (
          <div className="h-12 bg-white/10 rounded-2xl animate-pulse" />
        ) : farms.length === 0 ? (
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full flex items-center gap-3 bg-green-500/20 border border-green-500/30 rounded-2xl px-4 py-3 text-green-400 font-semibold active:scale-[0.98] transition-all"
          >
            <Plus className="w-5 h-5" />
            {t('createFirstFarm')}
          </button>
        ) : (
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full flex items-center justify-between bg-white/10 border border-white/15 rounded-2xl px-4 py-3 text-white active:bg-white/15 transition-all"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 bg-green-500/30 rounded-xl flex items-center justify-center">
                <Tractor className="w-3.5 h-3.5 text-green-400" />
              </div>
              <span className="font-bold text-base">{selectedFarm?.name || t('selectFarm')}</span>
            </div>
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>
        )}

        {/* Dropdown */}
        {isDropdownOpen && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setIsDropdownOpen(false)} />
            <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800 border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-40">
              {farms.map(f => (
                <button
                  key={f.id}
                  onClick={() => { setSelectedFarmId(f.id); setIsDropdownOpen(false); }}
                  className={`w-full px-4 py-3.5 text-left flex items-center gap-3 hover:bg-white/10 transition-colors ${f.id === selectedFarmId ? 'text-green-400' : 'text-white'}`}
                >
                  <div className={`w-2 h-2 rounded-full ${f.id === selectedFarmId ? 'bg-green-400' : 'bg-white/20'}`} />
                  <span className="font-medium">{f.name}</span>
                </button>
              ))}
              <div className="border-t border-white/10">
                <button
                  onClick={() => { setIsDropdownOpen(false); setIsModalOpen(true); }}
                  className="w-full px-4 py-3.5 text-left flex items-center gap-3 text-green-400 hover:bg-green-500/10 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span className="font-semibold">{t('addNewFarm')}</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Create Farm Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end justify-center p-4 pb-6 z-50">
          <div className="bg-gray-900 border border-white/10 rounded-3xl p-6 w-full max-w-sm shadow-2xl">
            <div className="w-12 h-12 bg-green-500/20 rounded-2xl flex items-center justify-center mb-4">
              <Tractor className="w-6 h-6 text-green-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-1">{t('newFarm')}</h2>
            <p className="text-gray-400 text-sm mb-5">{t('newFarmDesc')}</p>
            <form onSubmit={handleCreateFarm}>
              <input
                type="text"
                placeholder={t('farmNamePlaceholder')}
                value={newFarmName}
                onChange={e => setNewFarmName(e.target.value)}
                className="w-full px-4 py-3.5 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/30 outline-none focus:border-green-400/60 mb-4"
                autoFocus
                required
              />
              <div className="flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3.5 rounded-2xl bg-white/10 text-white font-semibold">{t('cancel')}</button>
                <button type="submit" className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold shadow-lg shadow-green-500/25">
                  {t('create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
