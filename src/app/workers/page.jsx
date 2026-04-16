'use client';

import { useEffect, useState, useCallback } from 'react';
import useAppStore from '@/store/useFarmStore';
import { getWorkers, createWorker, updateWorker, deleteWorker } from '@/lib/actions';
import toast from 'react-hot-toast';
import { Users, Trash2, Plus, Pencil, UserCheck } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';

const CACHE_KEY = 'workers';

export default function WorkersPage() {
  const { selectedFarmId, getCached, setCache, invalidateCache } = useAppStore();
  const [workers, setWorkers] = useState(() => getCached(selectedFarmId, CACHE_KEY) || []);
  const [loading, setLoading] = useState(workers.length === 0);
  const [name, setName] = useState('');
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
    if (!force && cached) {
      setWorkers(cached);
      return;
    }
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
    setSubmitting(true);
    try {
      await createWorker(selectedFarmId, name, Number(share));
      toast.success('Worker added!');
      setName(''); setShare('25');
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
      <PageHeader title="Manage Workers" icon={Users} iconBg="bg-purple-500/30" iconColor="text-purple-400" />

      <div className="p-4 space-y-4">
        <div className="bg-white/5 border border-white/10 rounded-3xl p-5">
          <h2 className="text-white font-bold mb-4 flex items-center gap-2"><Plus className="w-4 h-4 text-purple-400" /> Add Worker</h2>
          <form onSubmit={handleAdd} className="space-y-3">
            <input placeholder="Worker name e.g. Rameshbhai" value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/30 outline-none focus:border-purple-400/60" required />
            <div className="flex items-center gap-3">
              <input type="number" min="1" max="100" placeholder="Share %" value={share} onChange={e => setShare(e.target.value)} className="w-32 px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/30 outline-none focus:border-purple-400/60" required />
              <span className="text-gray-400 text-sm">% of total income</span>
            </div>
            <button type="submit" disabled={submitting} className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-500 to-violet-600 text-white font-bold shadow-lg shadow-purple-500/25 disabled:opacity-50 active:scale-[0.98] transition-all">
              {submitting ? 'Adding...' : 'Add Worker'}
            </button>
          </form>
        </div>

        <h3 className="text-gray-400 font-semibold px-1 text-sm uppercase tracking-wider">Workers ({workers.length})</h3>

        {loading ? (
          <div className="space-y-3">{[1,2].map(i => <div key={i} className="h-20 bg-white/5 rounded-3xl animate-pulse" />)}</div>
        ) : workers.length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-3xl p-10 text-center"><UserCheck className="w-10 h-10 text-gray-600 mx-auto mb-3" /><p className="text-gray-500">No workers added yet</p></div>
        ) : (
          <div className="space-y-3">
            {workers.map((w, i) => (
              <div key={w.id} className="bg-white/5 border border-white/10 rounded-3xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 bg-gradient-to-br ${colors[i % colors.length]} rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg`}>{w.name.charAt(0).toUpperCase()}</div>
                  <div><h4 className="font-bold text-white text-base">{w.name}</h4><span className="text-sm text-gray-400">{w.share_percentage}% share</span></div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => openEdit(w)} className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center hover:bg-purple-500/20 active:scale-95 transition-all"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => setDeleteModal(w)} className="w-10 h-10 rounded-2xl bg-red-500/10 text-red-400 flex items-center justify-center hover:bg-red-500/20 active:scale-95 transition-all"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {editModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end justify-center z-50 p-4 pb-6">
          <div className="bg-gray-900 border border-white/10 rounded-3xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex items-center gap-2 mb-1"><Pencil className="w-4 h-4 text-purple-400" /><h2 className="text-xl font-bold text-white">Edit Worker</h2></div>
            <p className="text-gray-400 text-sm mb-5">Update name or share %</p>
            <form onSubmit={handleEdit} className="space-y-3">
              <input placeholder="Worker name" value={editName} onChange={e => setEditName(e.target.value)} className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/30 outline-none focus:border-purple-400/60" required autoFocus />
              <input type="number" min="1" max="100" placeholder="Share %" value={editShare} onChange={e => setEditShare(e.target.value)} className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/30 outline-none focus:border-purple-400/60" required />
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setEditModal(null)} className="flex-1 py-3.5 rounded-2xl bg-white/10 text-white font-semibold">Cancel</button>
                <button type="submit" disabled={editing} className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-purple-500 to-violet-600 text-white font-bold disabled:opacity-50">{editing ? 'Saving...' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end justify-center z-50 p-4 pb-6">
          <div className="bg-gray-900 border border-white/10 rounded-3xl p-6 w-full max-w-sm shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-2">Delete {deleteModal.name}?</h2>
            <p className="text-gray-400 text-sm mb-5">Enter PIN to confirm.</p>
            <form onSubmit={handleDelete}>
              <input type="password" placeholder="4-digit PIN" value={pin} onChange={e => setPin(e.target.value.replace(/\D/g,'').slice(0,4))} className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/30 outline-none focus:border-red-400/60 mb-4 text-center text-xl tracking-widest" required autoFocus />
              <div className="flex gap-3">
                <button type="button" onClick={() => { setDeleteModal(null); setPin(''); }} className="flex-1 py-3.5 rounded-2xl bg-white/10 text-white font-semibold">Cancel</button>
                <button type="submit" disabled={deleting} className="flex-1 py-3.5 rounded-2xl bg-red-500 text-white font-bold disabled:opacity-50">{deleting ? '...' : 'Delete'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
