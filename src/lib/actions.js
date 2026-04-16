'use server';

import { createClient } from './supabase-server';
import { getSession } from './auth';

async function getUser() {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');
  return session.userId;
}

// -- FARMS --

export async function getFarms() {
  const userId = await getUser();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('farms')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function createFarm(name, note) {
  const userId = await getUser();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('farms')
    .insert([{ user_id: userId, name, note }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

// -- WORKERS --

export async function getWorkers(farmId) {
  await getUser(); // Auth check
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('workers')
    .select('*')
    .eq('farm_id', farmId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function createWorker(farmId, name, share_percentage) {
  await getUser();
  const supabase = await createClient();
  const { error } = await supabase
    .from('workers')
    .insert([{ farm_id: farmId, name, share_percentage }]);
  if (error) throw error;
}

export async function updateWorker(workerId, name, share_percentage) {
  await getUser();
  const supabase = await createClient();
  const { error } = await supabase
    .from('workers')
    .update({ name, share_percentage })
    .eq('id', workerId);
  if (error) throw error;
}

export async function deleteWorker(workerId, pin) {
  return verifyPinAndDelete('workers', workerId, pin);
}

// -- EXPENSES --

export async function getExpenses(farmId, type) {
  await getUser();
  const supabase = await createClient();
  let query = supabase.from('expenses').select('*, workers(name)').eq('farm_id', farmId);
  if (type) query = query.eq('type', type);
  query = query.order('date', { ascending: false });
  
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function createExpense({ farmId, workerId, type, name, amount, date, comment }) {
  await getUser();
  const supabase = await createClient();
  const { error } = await supabase
    .from('expenses')
    .insert([{ farm_id: farmId, worker_id: workerId || null, type, name, amount, date, comment }]);
  if (error) throw error;
}

export async function updateExpense(expenseId, { workerId, name, amount, date, comment }) {
  await getUser();
  const supabase = await createClient();
  const { error } = await supabase
    .from('expenses')
    .update({ worker_id: workerId || null, name, amount, date, comment })
    .eq('id', expenseId);
  if (error) throw error;
}

export async function deleteExpense(expenseId, pin) {
  return verifyPinAndDelete('expenses', expenseId, pin);
}

// -- INCOME --

export async function getIncome(farmId) {
  await getUser();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('income')
    .select('*')
    .eq('farm_id', farmId)
    .order('date', { ascending: false });
  if (error) throw error;
  return data;
}

export async function createIncome({ farmId, crop_name, amount, price, date, comment }) {
  await getUser();
  const supabase = await createClient();
  const { error } = await supabase
    .from('income')
    .insert([{ farm_id: farmId, crop_name, amount, price: price || null, date, comment }]);
  if (error) throw error;
}

export async function updateIncome(incomeId, { crop_name, amount, price, date, comment }) {
  await getUser();
  const supabase = await createClient();
  const { error } = await supabase
    .from('income')
    .update({ crop_name, amount, price: price || null, date, comment })
    .eq('id', incomeId);
  if (error) throw error;
}

export async function deleteIncome(incomeId, pin) {
  return verifyPinAndDelete('income', incomeId, pin);
}

// -- SETTLEMENT & UTILS --

export async function resetFarmData(farmId, pin) {
  const userId = await getUser();
  const isMatch = await verifyPin(userId, pin);
  if (!isMatch) return { success: false, message: 'Invalid PIN' };

  const supabase = await createClient();
  const tables = ['expenses', 'income', 'workers'];
  for (const table of tables) {
    const { error } = await supabase.from(table).delete().eq('farm_id', farmId);
    if (error) return { success: false, message: error.message };
  }
  return { success: true };
}

// Internals

async function verifyPin(userId, pin) {
  const supabase = await createClient();
  const { data: user } = await supabase.from('users').select('pin').eq('id', userId).single();
  if (!user) return false;
  return pin === user.pin;
}

async function verifyPinAndDelete(table, id, pin) {
  const userId = await getUser();
  const isMatch = await verifyPin(userId, pin);
  if (!isMatch) return { success: false, message: 'Invalid PIN' };

  const supabase = await createClient();
  const { error } = await supabase.from(table).delete().eq('id', id);
  if (error) return { success: false, message: error.message };
  return { success: true };
}
