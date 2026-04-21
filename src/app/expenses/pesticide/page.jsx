'use client';

import { useEffect, useState, useCallback } from 'react';
import useAppStore from '@/store/useFarmStore';
import useLanguageStore from '@/store/useLanguageStore';
import { getExpenses, createExpense, updateExpense, deleteExpense } from '@/lib/actions';
import toast from 'react-hot-toast';
import { Bug, Trash2, Plus, Pencil } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';

const CACHE_KEY = 'expenses_pesticide';

export default function PesticidePage() {
  const { selectedFarmId, getCached, setCache, invalidateCache, farms } = useAppStore();
  const { t } = useLanguageStore();
  const role = farms.find(f => f.id === selectedFarmId)?.role || 'owner';
  const [expenses, setExpenses] = useState(() => getCached(selectedFarmId, CACHE_KEY) || []);
  const [loading, setLoading] = useState(expenses.length === 0);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [editModal, setEditModal] = useState(null);
  const [editName, setEditName] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editComment, setEditComment] = useState('');
  const [editing, setEditing] = useState(false);
  const [deleteModal, setDeleteModal] = useState(null);
  const [pin, setPin] = useState('');
  const [deleting, setDeleting] = useState(false);

  const loadData = useCallback(async (force = false) => {
    if (!selectedFarmId) return;
    const cached = getCached(selectedFarmId, CACHE_KEY);
    if (!force && cached) { setExpenses(cached); setLoading(false); return; }
    setLoading(true);
    try {
      const data = await getExpenses(selectedFarmId, 'pesticide');
      setExpenses(data);
      setCache(selectedFarmId, CACHE_KEY, data);
    } catch { toast.error('Failed to load data'); }
    finally { setLoading(false); }
  }, [selectedFarmId, getCached, setCache]);

  const handleRefresh = async () => {
    setRefreshing(true);
    invalidateCache(selectedFarmId, CACHE_KEY);
    await loadData(true);
    setRefreshing(false);
    toast.success('Data updated');
  };

  useEffect(() => { loadData(); }, [loadData]);

  const handleAdd = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createExpense({ farmId: selectedFarmId, workerId: null, type: 'pesticide', name, amount: Number(amount), date, comment });
      toast.success('Expense added!');
      setName(''); setAmount(''); setComment('');
      invalidateCache(selectedFarmId, CACHE_KEY);
      loadData(true);
    } catch { toast.error('Failed to add expense'); }
    finally { setSubmitting(false); }
  };

  const openEdit = (exp) => { setEditModal(exp); setEditName(exp.name); setEditAmount(String(exp.amount)); setEditDate(exp.date); setEditComment(exp.comment || ''); };

  const handleEdit = async (e) => {
    e.preventDefault();
    setEditing(true);
    try {
      await updateExpense(editModal.id, { workerId: null, name: editName, amount: Number(editAmount), date: editDate, comment: editComment });
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

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col pb-10">
      <PageHeader 
        title={t('farmExpenses')} 
        icon={Bug} 
        iconBg="bg-orange-500/30" 
        iconColor="text-orange-400" 
        onRefresh={handleRefresh}
        refreshing={refreshing}
      />
      <div className="p-4 space-y-4">
        {expenses.length > 0 && (
          <div className="bg-gradient-to-br from-orange-500/20 to-amber-600/20 border border-orange-500/20 rounded-3xl p-5">
            <p className="text-orange-300 text-sm font-medium mb-1">{t('totalFarmExpenses')}</p>
            <p className="text-3xl font-black text-white">₹{total.toLocaleString('en-IN')}</p>
          </div>
        )}
        {role === 'worker' ? (
          <div className="bg-orange-500/10 border border-orange-500/20 rounded-3xl p-5 text-center">
            <p className="text-orange-300 text-sm font-medium">Read-Only Mode: You cannot add or edit expenses.</p>
          </div>
        ) : (
          <div className="bg-white/5 border border-white/10 rounded-3xl p-5">
            <h2 className="text-white font-bold mb-4 flex items-center gap-2"><Plus className="w-4 h-4 text-orange-400" />{t('addExpense')}</h2>
            <form onSubmit={handleAdd} className="space-y-3">
              <input placeholder={t('expenseNamePlaceholder')} value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/30 outline-none focus:border-orange-400/60" required />
              <input type="number" placeholder={t('amount')} min="1" value={amount} onChange={e => setAmount(e.target.value)} className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/30 outline-none focus:border-orange-400/60" required />
              <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white outline-none focus:border-orange-400/60" required />
              <input placeholder={t('noteOrBill')} value={comment} onChange={e => setComment(e.target.value)} className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/30 outline-none focus:border-orange-400/60" />
              <button type="submit" disabled={submitting} className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-600 text-white font-bold shadow-lg shadow-orange-500/25 disabled:opacity-50 active:scale-[0.98] transition-all">{submitting ? t('saving') : t('addExpense')}</button>
            </form>
          </div>
        )}
        <h3 className="text-gray-400 font-semibold px-1 text-sm uppercase tracking-wider">{t('allExpenses')}</h3>
        {loading ? (
          <div className="space-y-3">{[1,2].map(i => <div key={i} className="h-20 bg-white/5 rounded-3xl animate-pulse" />)}</div>
        ) : expenses.length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-3xl p-10 text-center text-gray-500">{t('noExpensesYet')}</div>
        ) : (
          <div className="space-y-3">
            {expenses.map(exp => (
              <div key={exp.id} className="bg-white/5 border border-white/10 rounded-3xl p-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-black text-white text-xl">₹{Number(exp.amount).toLocaleString('en-IN')}</span>
                    <span className="text-xs bg-orange-500/20 text-orange-400 px-2.5 py-1 rounded-full font-semibold">{exp.name}</span>
                  </div>
                  <p className="text-xs text-gray-500">{new Date(exp.date).toLocaleDateString('en-IN', {day:'numeric',month:'short',year:'numeric'})}{exp.comment && ` · ${exp.comment}`}</p>
                </div>
                {role === 'owner' && (
                  <div className="flex items-center gap-2">
                    <button onClick={() => openEdit(exp)} className="w-10 h-10 rounded-2xl bg-orange-500/10 text-orange-400 flex items-center justify-center hover:bg-orange-500/20 active:scale-95 transition-all"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => setDeleteModal(exp)} className="w-10 h-10 rounded-2xl bg-red-500/10 text-red-400 flex items-center justify-center hover:bg-red-500/20 active:scale-95 transition-all"><Trash2 className="w-4 h-4" /></button>
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
            <div className="flex items-center gap-2 mb-1"><Pencil className="w-4 h-4 text-orange-400" /><h2 className="text-xl font-bold text-white">{t('editExpense')}</h2></div>
            <p className="text-gray-400 text-sm mb-5">{t('updateExpenseDetails')}</p>
            <form onSubmit={handleEdit} className="space-y-3">
              <input placeholder={t('expenseNameEdit')} value={editName} onChange={e => setEditName(e.target.value)} className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/30 outline-none focus:border-orange-400/60" required autoFocus />
              <input type="number" placeholder={t('amount')} min="1" value={editAmount} onChange={e => setEditAmount(e.target.value)} className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/30 outline-none focus:border-orange-400/60" required />
              <input type="date" value={editDate} onChange={e => setEditDate(e.target.value)} className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white outline-none focus:border-orange-400/60" required />
              <input placeholder={t('note')} value={editComment} onChange={e => setEditComment(e.target.value)} className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/30 outline-none focus:border-orange-400/60" />
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setEditModal(null)} className="flex-1 py-3.5 rounded-2xl bg-white/10 text-white font-semibold">{t('cancel')}</button>
                <button type="submit" disabled={editing} className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-600 text-white font-bold disabled:opacity-50">{editing ? t('saving') : t('save')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end justify-center z-50 p-4 pb-6">
          <div className="bg-gray-900 border border-white/10 rounded-3xl p-6 w-full max-w-sm shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-2">{t('deleteExpense')}</h2>
            <p className="text-gray-400 text-sm mb-5">₹{deleteModal.amount} · {deleteModal.name}. {t('deleteEntryDesc')}</p>
            <form onSubmit={handleDelete}>
              <input type="password" placeholder={t('pin4digit')} value={pin} onChange={e => setPin(e.target.value.replace(/\D/g,'').slice(0,4))} className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/30 outline-none focus:border-red-400/60 mb-4 text-center text-xl tracking-widest" required autoFocus />
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
