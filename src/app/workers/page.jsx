'use client';

import { useEffect, useState, useCallback } from 'react';
import useAppStore from '@/store/useFarmStore';
import useLanguageStore from '@/store/useLanguageStore';
import { getWorkers, createWorker, updateWorker, deleteWorker } from '@/lib/actions';
import toast from 'react-hot-toast';
import { Users, Trash2, Plus, Pencil, UserCheck } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';

const CACHE_KEY = 'workers';

export default function WorkersPage() {
  const { selectedFarmId, getCached, setCache, invalidateCache, farms } = useAppStore();
  const { t } = useLanguageStore();
  const role = farms.find(f => f.id === selectedFarmId)?.role || 'owner';
  const [workers, setWorkers] = useState(() => getCached(selectedFarmId, CACHE_KEY) || []);
  const [loading, setLoading] = useState(workers.length === 0);
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [share, setShare] = useState('25');
  const [submitting, setSubmitting] = useState(false);

  const [editModal, setEditModal] = useState(null);
  const [editName, setEditName] = useState('');
  const [editShare, setEditShare] = useState('');
  const [editing, setEditing] = useState(false);

  const [deleteModal, setDeleteModal] = useState(null);
  const [pin, setPin] = useState('');
  const [deleting, setDeleting] = useState(false);

  const loadWorkers = useCallback(async (force = false) => {
    if (!selectedFarmId) return;
    const cached = getCached(selectedFarmId, CACHE_KEY);
    if (!force && cached) { setWorkers(cached); setLoading(false); return; }
    setLoading(true);
    try {
      const data = await getWorkers(selectedFarmId);
      setWorkers(data);
      setCache(selectedFarmId, CACHE_KEY, data);
    } catch { toast.error('Failed to load workers'); }
    finally { setLoading(false); }
  }, [selectedFarmId, getCached, setCache]);

  useEffect(() => { loadWorkers(); }, [loadWorkers]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (workers.length >= 1) return toast.error('Only one worker is allowed per farm.');
    setSubmitting(true);
    try {
      await createWorker(selectedFarmId, name, Number(share), mobile);
      toast.success('Worker added!');

      const url = window.location.origin;
      const text = encodeURIComponent(`Hello ${name}, you've been added as a worker on FarmCalc. Login using your number ${mobile} here: ${url}`);
      window.open(`https://wa.me/91${mobile}?text=${text}`, '_blank');

      setName(''); setShare('25'); setMobile('');
      invalidateCache(selectedFarmId, CACHE_KEY);
      loadWorkers(true);
    } catch { toast.error('Failed to add worker'); }
    finally { setSubmitting(false); }
  };

  const openEdit = (w) => { setEditModal(w); setEditName(w.name); setEditShare(String(w.share_percentage)); };

  const handleEdit = async (e) => {
    e.preventDefault();
    setEditing(true);
    try {
      await updateWorker(editModal.id, editName, Number(editShare));
      toast.success('Worker updated!');
      setEditModal(null);
      invalidateCache(selectedFarmId, CACHE_KEY);
      loadWorkers(true);
    } catch { toast.error('Failed to update'); }
    finally { setEditing(false); }
  };

  const handleDelete = async (e) => {
    e.preventDefault();
    if (pin.length !== 4) return toast.error('PIN must be 4 digits');
    setDeleting(true);
    const res = await deleteWorker(deleteModal.id, pin);
    setDeleting(false);
    if (res.success) {
      toast.success('Worker deleted');
      setDeleteModal(null); setPin('');
      invalidateCache(selectedFarmId, CACHE_KEY);
      loadWorkers(true);
    } else { toast.error(res.message); }
  };

  const colors = ['from-blue-500 to-indigo-600', 'from-purple-500 to-violet-600', 'from-emerald-500 to-teal-600', 'from-orange-500 to-amber-600', 'from-rose-500 to-pink-600'];

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col pb-10">
      <PageHeader title={t('manageWorkers')} icon={Users} iconBg="bg-purple-500/30" iconColor="text-purple-400" />

      <div className="p-4 space-y-4">
        {role === 'worker' ? (
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-3xl p-5 flex items-center gap-3">
            <UserCheck className="w-6 h-6 text-purple-400 flex-shrink-0" />
            <p className="text-purple-300 text-sm font-medium">You are viewing this farm as a worker (Read-Only Mode).</p>
          </div>
        ) : workers.length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-3xl p-5">
            <h2 className="text-white font-bold mb-4 flex items-center gap-2"><Plus className="w-4 h-4 text-purple-400" /> {t('addWorker')}</h2>
            <form onSubmit={handleAdd} className="space-y-3">
              <input placeholder={t('workerNamePlaceholder')} value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/30 outline-none focus:border-purple-400/60" required />
              <input type="tel" placeholder="Mobile Number (e.g. 9876543210)" value={mobile} onChange={e => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))} className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/30 outline-none focus:border-purple-400/60" required />
              <div className="flex items-center gap-3">
                <input type="number" min="1" max="100" placeholder={t('sharePlaceholder')} value={share} onChange={e => setShare(e.target.value)} className="w-32 px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/30 outline-none focus:border-purple-400/60" required />
                <span className="text-gray-400 text-sm">{t('sharePercent')}</span>
              </div>
              <button type="submit" disabled={submitting || mobile.length < 10} className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold shadow-lg shadow-green-500/25 disabled:opacity-50 active:scale-[0.98] transition-all">
                {submitting ? 'Generating...' : 'Generate & Send Link'}
              </button>
            </form>
          </div>
        ) : (
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-3xl p-5 flex items-center gap-3">
            <UserCheck className="w-6 h-6 text-purple-400 flex-shrink-0" />
            <p className="text-purple-300 text-sm font-medium">Only one worker is allowed per farm. Delete the current worker to add a new one.</p>
          </div>
        )}

        <h3 className="text-gray-400 font-semibold px-1 text-sm uppercase tracking-wider">{t('workersCount')} ({workers.length})</h3>

        {loading ? (
          <div className="space-y-3">{[1, 2].map(i => <div key={i} className="h-20 bg-white/5 rounded-3xl animate-pulse" />)}</div>
        ) : workers.length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-3xl p-10 text-center"><UserCheck className="w-10 h-10 text-gray-600 mx-auto mb-3" /><p className="text-gray-500">{t('noWorkersYet')}</p></div>
        ) : (
          <div className="space-y-3">
            {workers.map((w, i) => (
              <div key={w.id} className="bg-white/5 border border-white/10 rounded-3xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 bg-gradient-to-br ${colors[i % colors.length]} rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg`}>{w.name.charAt(0).toUpperCase()}</div>
                  <div><h4 className="font-bold text-white text-base">{w.name}</h4><span className="text-sm text-gray-400">{w.share_percentage}{t('share')}</span></div>
                </div>
                {role === 'owner' && (
                  <div className="flex items-center gap-2">
                    <button onClick={() => openEdit(w)} className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center hover:bg-purple-500/20 active:scale-95 transition-all"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => setDeleteModal(w)} className="w-10 h-10 rounded-2xl bg-red-500/10 text-red-400 flex items-center justify-center hover:bg-red-500/20 active:scale-95 transition-all"><Trash2 className="w-4 h-4" /></button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {editModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end justify-center z-50 p-4 pb-6">
          <div className="bg-gray-900 border border-white/10 rounded-3xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex items-center gap-2 mb-1"><Pencil className="w-4 h-4 text-purple-400" /><h2 className="text-xl font-bold text-white">{t('editWorker')}</h2></div>
            <p className="text-gray-400 text-sm mb-5">{t('updateNameShare')}</p>
            <form onSubmit={handleEdit} className="space-y-3">
              <input placeholder={t('workerNameEdit')} value={editName} onChange={e => setEditName(e.target.value)} className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/30 outline-none focus:border-purple-400/60" required autoFocus />
              <input type="number" min="1" max="100" placeholder={t('sharePlaceholder')} value={editShare} onChange={e => setEditShare(e.target.value)} className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/30 outline-none focus:border-purple-400/60" required />
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setEditModal(null)} className="flex-1 py-3.5 rounded-2xl bg-white/10 text-white font-semibold">{t('cancel')}</button>
                <button type="submit" disabled={editing} className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-purple-500 to-violet-600 text-white font-bold disabled:opacity-50">{editing ? t('saving') : t('save')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end justify-center z-50 p-4 pb-6">
          <div className="bg-gray-900 border border-white/10 rounded-3xl p-6 w-full max-w-sm shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-2">{t('deleteWorker')} {deleteModal.name}?</h2>
            <p className="text-gray-400 text-sm mb-5">{t('enterPinConfirm')}</p>
            <form onSubmit={handleDelete}>
              <input type="password" placeholder={t('pin4digit')} value={pin} onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))} className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/30 outline-none focus:border-red-400/60 mb-4 text-center text-xl tracking-widest" required autoFocus />
              <div className="flex gap-3">
                <button type="button" onClick={() => { setDeleteModal(null); setPin(''); }} className="flex-1 py-3.5 rounded-2xl bg-white/10 text-white font-semibold">{t('cancel')}</button>
                <button type="submit" disabled={deleting} className="flex-1 py-3.5 rounded-2xl bg-red-500 text-white font-bold disabled:opacity-50">{deleting ? '...' : t('delete')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
