'use client';

import { useEffect, useState } from 'react';
import useFarmStore from '@/store/useFarmStore';
import useLanguageStore from '@/store/useLanguageStore';
import { getFarms, createFarm, getUserRecord } from '@/lib/actions';
import toast from 'react-hot-toast';
import { ChevronDown, Plus, Tractor } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function FarmSelector() {
  const { selectedFarmId, setSelectedFarmId, farms, setFarms, setUser } = useFarmStore();
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
      if (userRec) setUser(userRec);
      if (data.length > 0) {
        if (!selectedFarmId || !data.find(f => f.id === selectedFarmId)) {
          setSelectedFarmId(data[0].id);
        }
      } else {
        setSelectedFarmId(null);
      }
    } catch (error) {
      if (error.message === 'Unauthorized') {
        useFarmStore.getState().clearStore();
        router.push('/login');
      } else {
        toast.error('Failed to load farms');
      }
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
          <div className="h-12 bg-gray-200 rounded-2xl animate-pulse" />
        ) : farms.length === 0 ? (
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full flex items-center gap-3 bg-green-50 border border-green-200 rounded-2xl px-4 py-3 text-green-700 font-semibold active:scale-[0.98] transition-all"
          >
            <Plus className="w-5 h-5" />
            {t('createFirstFarm')}
          </button>
        ) : (
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full flex items-center justify-between bg-white border border-gray-200 rounded-2xl px-4 py-3 text-gray-900 active:bg-gray-50 transition-all shadow-sm"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 bg-[#166534]/10 rounded-xl flex items-center justify-center">
                <Tractor className="w-3.5 h-3.5 text-[#166534]" />
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
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xl z-40">
              {farms.map(f => (
                <button
                  key={f.id}
                  onClick={() => { setSelectedFarmId(f.id); setIsDropdownOpen(false); }}
                  className={`w-full px-4 py-3.5 text-left flex items-center gap-3 hover:bg-gray-50 transition-colors ${f.id === selectedFarmId ? 'text-[#166534]' : 'text-gray-700'}`}
                >
                  <div className={`w-2 h-2 rounded-full ${f.id === selectedFarmId ? 'bg-[#166534]' : 'bg-gray-300'}`} />
                  <span className="font-medium">{f.name}</span>
                </button>
              ))}
              <div className="border-t border-gray-100">
                <button
                  onClick={() => { setIsDropdownOpen(false); setIsModalOpen(true); }}
                  className="w-full px-4 py-3.5 text-left flex items-center gap-3 text-[#166534] hover:bg-green-50 transition-colors"
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
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-end justify-center p-4 pb-6 z-50">
          <div className="bg-white border border-gray-100 rounded-3xl p-6 w-full max-w-sm shadow-2xl">
            <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center mb-4">
              <Tractor className="w-6 h-6 text-[#166534]" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">{t('newFarm')}</h2>
            <p className="text-gray-500 text-sm mb-5">{t('newFarmDesc')}</p>
            <form onSubmit={handleCreateFarm}>
              <input
                type="text"
                placeholder={t('farmNamePlaceholder')}
                value={newFarmName}
                onChange={e => setNewFarmName(e.target.value)}
                className="w-full px-4 py-3.5 rounded-2xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 outline-none focus:border-[#166534] mb-4"
                autoFocus
                required
              />
              <div className="flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3.5 rounded-2xl bg-gray-100 text-gray-700 font-semibold">{t('cancel')}</button>
                <button type="submit" className="flex-1 py-3.5 rounded-2xl bg-[#166534] text-white font-bold shadow-lg shadow-green-900/20">
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
