'use client';

import { useEffect, useState, useCallback } from 'react';
import useAppStore from '@/store/useFarmStore';
import { getExpenses, getWorkers, createExpense, updateExpense, deleteExpense } from '@/lib/actions';
import toast from 'react-hot-toast';
import { Wallet, Trash2, Plus, Pencil, ChevronDown } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';

const CACHE_KEY = 'expenses_upad';

export default function UpadPage() {
  const { selectedFarmId, getCached, setCache, invalidateCache } = useAppStore();
  const [expenses, setExpenses] = useState(() => getCached(selectedFarmId, CACHE_KEY) || []);
  const [workers, setWorkers] = useState(() => getCached(selectedFarmId, 'workers') || []);
  const [loading, setLoading] = useState(expenses.length === 0);
  const [workerId, setWorkerId] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [editModal, setEditModal] = useState(null);
  const [editWorkerId, setEditWorkerId] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editComment, setEditComment] = useState('');
  const [editing, setEditing] = useState(false);
  const [deleteModal, setDeleteModal] = useState(null);
  const [pin, setPin] = useState('');
  const [deleting, setDeleting] = useState(false);

  const loadData = useCallback(async (force = false) => {
    if (!selectedFarmId) return;
    const cachedExp = getCached(selectedFarmId, CACHE_KEY);
    const cachedWorkers = getCached(selectedFarmId, 'workers');

    if (!force && cachedExp && cachedWorkers) {
      setExpenses(cachedExp);
      setWorkers(cachedWorkers);
      if (cachedWorkers.length > 0) setWorkerId(prev => prev || cachedWorkers[0].id);
      return;
    }
    setLoading(true);
    try {
      const [expData, wData] = await Promise.all([
        cachedExp && !force ? Promise.resolve(cachedExp) : getExpenses(selectedFarmId, 'upad'),
        cachedWorkers && !force ? Promise.resolve(cachedWorkers) : getWorkers(selectedFarmId),
      ]);
      setExpenses(expData); setWorkers(wData);
      setCache(selectedFarmId, CACHE_KEY, expData);
      setCache(selectedFarmId, 'workers', wData);
      if (wData.length > 0) setWorkerId(prev => prev || wData[0].id);
    } catch { toast.error('Failed to load data'); }
    finally { setLoading(false); }
  }, [selectedFarmId, getCached, setCache]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!workerId) return toast.error('Select a worker first');
    setSubmitting(true);
    try {
      await createExpense({ farmId: selectedFarmId, workerId, type: 'upad', name: 'Upad', amount: Number(amount), date, comment });
      toast.success('Upad added!');
      setAmount(''); setComment('');
      invalidateCache(selectedFarmId, CACHE_KEY);
      loadData(true);
    } catch { toast.error('Failed to add Upad'); }
    finally { setSubmitting(false); }
  };

  const openEdit = (exp) => { setEditModal(exp); setEditWorkerId(exp.worker_id || ''); setEditAmount(String(exp.amount)); setEditDate(exp.date); setEditComment(exp.comment || ''); };

  const handleEdit = async (e) => {
    e.preventDefault();
    setEditing(true);
    try {
      await updateExpense(editModal.id, { workerId: editWorkerId, name: 'Upad', amount: Number(editAmount), date: editDate, comment: editComment });
      toast.success('Updated!');
      setEditModal(null);
      invalidateCache(selectedFarmId, CACHE_KEY);
      loadData(true);
    } catch { toast.error('Failed to update'); }
    finally { setEditing(false); }
  };

  const handleDelete = async (e) => {
    e.preventDefault();
    if (pin.length !== 4) return toast.error('PIN must be 4 digits');
    setDeleting(true);
    const res = await deleteExpense(deleteModal.id, pin);
    setDeleting(false);
    if (res.success) {
      toast.success('Deleted'); setDeleteModal(null); setPin('');
      invalidateCache(selectedFarmId, CACHE_KEY);
      loadData(true);
    } else { toast.error(res.message); }
  };

  const total = expenses.reduce((a, e) => a + Number(e.amount), 0);

  const SelectField = ({ value, onChange }) => (
    <div className="relative">
      <select value={value} onChange={onChange} className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white outline-none focus:border-blue-400/60 appearance-none">
        {workers.map(w => <option key={w.id} value={w.id} className="bg-gray-800">{w.name}</option>)}
      </select>
      <ChevronDown className="w-4 h-4 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col pb-10">
      <PageHeader title="Worker Upad" icon={Wallet} iconBg="bg-blue-500/30" iconColor="text-blue-400" />
      <div className="p-4 space-y-4">
        {expenses.length > 0 && (
          <div className="bg-gradient-to-br from-blue-500/20 to-indigo-600/20 border border-blue-500/20 rounded-3xl p-5">
            <p className="text-blue-300 text-sm font-medium mb-1">Total Upad Given</p>
            <p className="text-3xl font-black text-white">₹{total.toLocaleString('en-IN')}</p>
          </div>
        )}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-5">
          <h2 className="text-white font-bold mb-4 flex items-center gap-2"><Plus className="w-4 h-4 text-blue-400" /> Add Upad</h2>
          {workers.length === 0 ? (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-4 text-center"><p className="text-yellow-400 text-sm font-medium">Add workers first from the Workers page</p></div>
          ) : (
            <form onSubmit={handleAdd} className="space-y-3">
              <SelectField value={workerId} onChange={e => setWorkerId(e.target.value)} />
              <input type="number" placeholder="Amount (₹)" min="1" value={amount} onChange={e => setAmount(e.target.value)} className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/30 outline-none focus:border-blue-400/60" required />
              <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white outline-none focus:border-blue-400/60" required />
              <input placeholder="Note (optional)" value={comment} onChange={e => setComment(e.target.value)} className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/30 outline-none focus:border-blue-400/60" />
              <button type="submit" disabled={submitting} className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold shadow-lg shadow-blue-500/25 disabled:opacity-50 active:scale-[0.98] transition-all">{submitting ? 'Saving...' : 'Add Upad'}</button>
            </form>
          )}
        </div>
        <h3 className="text-gray-400 font-semibold px-1 text-sm uppercase tracking-wider">All Entries</h3>
        {loading ? (
          <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 bg-white/5 rounded-3xl animate-pulse" />)}</div>
        ) : expenses.length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-3xl p-10 text-center text-gray-500">No upad recorded yet</div>
        ) : (
          <div className="space-y-3">
            {expenses.map(exp => (
              <div key={exp.id} className="bg-white/5 border border-white/10 rounded-3xl p-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-black text-white text-xl">₹{Number(exp.amount).toLocaleString('en-IN')}</span>
                    <span className="text-xs bg-blue-500/20 text-blue-400 px-2.5 py-1 rounded-full font-semibold">{exp.workers?.name}</span>
                  </div>
                  <p className="text-xs text-gray-500">{new Date(exp.date).toLocaleDateString('en-IN', {day:'numeric',month:'short',year:'numeric'})}{exp.comment && ` · ${exp.comment}`}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => openEdit(exp)} className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center hover:bg-blue-500/20 active:scale-95 transition-all"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => setDeleteModal(exp)} className="w-10 h-10 rounded-2xl bg-red-500/10 text-red-400 flex items-center justify-center hover:bg-red-500/20 active:scale-95 transition-all"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {editModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end justify-center z-50 p-4 pb-6">
          <div className="bg-gray-900 border border-white/10 rounded-3xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex items-center gap-2 mb-1"><Pencil className="w-4 h-4 text-blue-400" /><h2 className="text-xl font-bold text-white">Edit Upad</h2></div>
            <p className="text-gray-400 text-sm mb-5">Update entry details</p>
            <form onSubmit={handleEdit} className="space-y-3">
              <SelectField value={editWorkerId} onChange={e => setEditWorkerId(e.target.value)} />
              <input type="number" placeholder="Amount (₹)" min="1" value={editAmount} onChange={e => setEditAmount(e.target.value)} className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/30 outline-none focus:border-blue-400/60" required />
              <input type="date" value={editDate} onChange={e => setEditDate(e.target.value)} className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white outline-none focus:border-blue-400/60" required />
              <input placeholder="Note (optional)" value={editComment} onChange={e => setEditComment(e.target.value)} className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/30 outline-none focus:border-blue-400/60" />
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setEditModal(null)} className="flex-1 py-3.5 rounded-2xl bg-white/10 text-white font-semibold">Cancel</button>
                <button type="submit" disabled={editing} className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold disabled:opacity-50">{editing ? 'Saving...' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end justify-center z-50 p-4 pb-6">
          <div className="bg-gray-900 border border-white/10 rounded-3xl p-6 w-full max-w-sm shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-2">Delete Entry?</h2>
            <p className="text-gray-400 text-sm mb-5">₹{deleteModal.amount} · Enter PIN.</p>
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
