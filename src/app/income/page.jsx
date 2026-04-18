'use client';

import { useEffect, useState, useCallback } from 'react';
import useAppStore from '@/store/useFarmStore';
import useLanguageStore from '@/store/useLanguageStore';
import { getIncome, createIncome, updateIncome, deleteIncome } from '@/lib/actions';
import toast from 'react-hot-toast';
import { IndianRupee, Trash2, Plus, Pencil } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';

const CACHE_KEY = 'income';

export default function IncomePage() {
  const { selectedFarmId, getCached, setCache, invalidateCache, farms } = useAppStore();
  const { t } = useLanguageStore();
  const role = farms.find(f => f.id === selectedFarmId)?.role || 'owner';
  const [incomes, setIncomes] = useState(() => getCached(selectedFarmId, CACHE_KEY) || []);
  const [loading, setLoading] = useState(incomes.length === 0);
  const [cropName, setCropName] = useState('');
  const [amount, setAmount] = useState('');
  const [price, setPrice] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [editModal, setEditModal] = useState(null);
  const [editCropName, setEditCropName] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editComment, setEditComment] = useState('');
  const [editing, setEditing] = useState(false);
  const [deleteModal, setDeleteModal] = useState(null);
  const [pin, setPin] = useState('');
  const [deleting, setDeleting] = useState(false);

  const loadData = useCallback(async (force = false) => {
    if (!selectedFarmId) return;
    const cached = getCached(selectedFarmId, CACHE_KEY);
    if (!force && cached) { setIncomes(cached); setLoading(false); return; }
    setLoading(true);
    try {
      const data = await getIncome(selectedFarmId);
      setIncomes(data);
      setCache(selectedFarmId, CACHE_KEY, data);
    } catch { toast.error('Failed to load data'); }
    finally { setLoading(false); }
  }, [selectedFarmId, getCached, setCache]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleAdd = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createIncome({ farmId: selectedFarmId, crop_name: cropName, amount: Number(amount), price: price ? Number(price) : null, date, comment });
      toast.success('Income added!');
      setCropName(''); setAmount(''); setPrice(''); setComment('');
      invalidateCache(selectedFarmId, CACHE_KEY);
      loadData(true);
    } catch { toast.error('Failed to add income'); }
    finally { setSubmitting(false); }
  };

  const openEdit = (inc) => { setEditModal(inc); setEditCropName(inc.crop_name); setEditAmount(String(inc.amount)); setEditPrice(inc.price ? String(inc.price) : ''); setEditDate(inc.date); setEditComment(inc.comment || ''); };

  const handleEdit = async (e) => {
    e.preventDefault();
    setEditing(true);
    try {
      await updateIncome(editModal.id, { crop_name: editCropName, amount: Number(editAmount), price: editPrice ? Number(editPrice) : null, date: editDate, comment: editComment });
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
    const res = await deleteIncome(deleteModal.id, pin);
    setDeleting(false);
    if (res.success) {
      toast.success('Deleted'); setDeleteModal(null); setPin('');
      invalidateCache(selectedFarmId, CACHE_KEY);
      loadData(true);
    } else { toast.error(res.message); }
  };

  const total = incomes.reduce((a, e) => a + Number(e.amount), 0);

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col pb-10">
      <PageHeader title={t('cropIncome')} icon={IndianRupee} iconBg="bg-emerald-500/30" iconColor="text-emerald-400" />
      <div className="p-4 space-y-4">
        {incomes.length > 0 && (
          <div className="bg-gradient-to-br from-emerald-500/20 to-teal-600/20 border border-emerald-500/20 rounded-3xl p-5">
            <p className="text-emerald-300 text-sm font-medium mb-1">{t('totalIncomeReceived')}</p>
            <p className="text-3xl font-black text-white">₹{total.toLocaleString('en-IN')}</p>
          </div>
        )}
        {role === 'worker' ? (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-3xl p-5 text-center">
            <p className="text-emerald-300 text-sm font-medium">Read-Only Mode: You cannot add or edit income.</p>
          </div>
        ) : (
          <div className="bg-white/5 border border-white/10 rounded-3xl p-5">
            <h2 className="text-white font-bold mb-4 flex items-center gap-2"><Plus className="w-4 h-4 text-emerald-400" />{t('addIncome')}</h2>
            <form onSubmit={handleAdd} className="space-y-3">
              <input placeholder={t('cropNamePlaceholder')} value={cropName} onChange={e => setCropName(e.target.value)} className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/30 outline-none focus:border-emerald-400/60" required />
              <input type="number" placeholder={t('totalAmountReceived')} min="1" value={amount} onChange={e => setAmount(e.target.value)} className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/30 outline-none focus:border-emerald-400/60" required />
              <input type="number" placeholder={t('pricePerUnit')} value={price} onChange={e => setPrice(e.target.value)} className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/30 outline-none focus:border-emerald-400/60" />
              <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white outline-none focus:border-emerald-400/60" required />
              <input placeholder={t('note')} value={comment} onChange={e => setComment(e.target.value)} className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/30 outline-none focus:border-emerald-400/60" />
              <button type="submit" disabled={submitting} className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold shadow-lg shadow-emerald-500/25 disabled:opacity-50 active:scale-[0.98] transition-all">{submitting ? t('saving') : t('addIncome')}</button>
            </form>
          </div>
        )}
        <h3 className="text-gray-400 font-semibold px-1 text-sm uppercase tracking-wider">{t('allIncome')}</h3>
        {loading ? (
          <div className="space-y-3">{[1,2].map(i => <div key={i} className="h-20 bg-white/5 rounded-3xl animate-pulse" />)}</div>
        ) : incomes.length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-3xl p-10 text-center text-gray-500">{t('noIncomeYet')}</div>
        ) : (
          <div className="space-y-3">
            {incomes.map(inc => (
              <div key={inc.id} className="bg-white/5 border border-white/10 rounded-3xl p-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-black text-emerald-400 text-xl">+₹{Number(inc.amount).toLocaleString('en-IN')}</span>
                    <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-full font-semibold">{inc.crop_name}</span>
                  </div>
                  <p className="text-xs text-gray-500">
                    {new Date(inc.date).toLocaleDateString('en-IN', {day:'numeric',month:'short',year:'numeric'})}
                    {inc.price && ` · ₹${inc.price}/unit`}
                    {inc.comment && ` · ${inc.comment}`}
                  </p>
                </div>
                {role === 'owner' && (
                  <div className="flex items-center gap-2">
                    <button onClick={() => openEdit(inc)} className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center hover:bg-emerald-500/20 active:scale-95 transition-all"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => setDeleteModal(inc)} className="w-10 h-10 rounded-2xl bg-red-500/10 text-red-400 flex items-center justify-center hover:bg-red-500/20 active:scale-95 transition-all"><Trash2 className="w-4 h-4" /></button>
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
            <div className="flex items-center gap-2 mb-1"><Pencil className="w-4 h-4 text-emerald-400" /><h2 className="text-xl font-bold text-white">{t('editIncome')}</h2></div>
            <p className="text-gray-400 text-sm mb-5">{t('updateIncomeEntry')}</p>
            <form onSubmit={handleEdit} className="space-y-3">
              <input placeholder={t('cropNameEdit')} value={editCropName} onChange={e => setEditCropName(e.target.value)} className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/30 outline-none focus:border-emerald-400/60" required autoFocus />
              <input type="number" placeholder={t('amount')} min="1" value={editAmount} onChange={e => setEditAmount(e.target.value)} className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/30 outline-none focus:border-emerald-400/60" required />
              <input type="number" placeholder={t('pricePerUnit')} value={editPrice} onChange={e => setEditPrice(e.target.value)} className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/30 outline-none focus:border-emerald-400/60" />
              <input type="date" value={editDate} onChange={e => setEditDate(e.target.value)} className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white outline-none focus:border-emerald-400/60" required />
              <input placeholder={t('note')} value={editComment} onChange={e => setEditComment(e.target.value)} className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/30 outline-none focus:border-emerald-400/60" />
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setEditModal(null)} className="flex-1 py-3.5 rounded-2xl bg-white/10 text-white font-semibold">{t('cancel')}</button>
                <button type="submit" disabled={editing} className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold disabled:opacity-50">{editing ? t('saving') : t('save')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end justify-center z-50 p-4 pb-6">
          <div className="bg-gray-900 border border-white/10 rounded-3xl p-6 w-full max-w-sm shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-2">{t('deleteIncome')}</h2>
            <p className="text-gray-400 text-sm mb-5">₹{deleteModal.amount} · {deleteModal.crop_name}. {t('deleteEntryDesc')}</p>
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
