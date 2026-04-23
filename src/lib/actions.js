'use server';

import { createClient } from './supabase-server';
import { getSession } from './auth';

async function getUser() {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');
  return session.userId;
}

export async function getUserRecord() {
  const userId = await getUser();
  const supabase = await createClient();
  const { data, error } = await supabase.from('users').select('*').eq('id', userId).single();
  if (error) throw error;
  return data;
}

// -- FARMS --

export async function getFarms() {
  const user = await getUserRecord();
  const supabase = await createClient();
  
  // 1. Farms as Owner
  const { data: ownerFarms, error: err1 } = await supabase
    .from('farms')
    .select('*')
    .eq('user_id', user.id);
  if (err1) throw err1;

  // 2. Farms as Worker
  const { data: workerRows, error: err2 } = await supabase
    .from('workers')
    .select('farms(*)')
    .eq('mobile_number', user.mobile_number);
  if (err2) throw err2;

  const workerFarms = (workerRows || [])
    .map(w => w.farms)
    .filter(Boolean);

  const allFarms = [
    ...(ownerFarms || []).map(f => ({ ...f, role: 'owner' })),
    ...workerFarms.map(f => ({ ...f, role: 'worker' }))
  ];

  allFarms.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  
  return allFarms;
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

export async function createWorker(farmId, name, share_percentage, mobile_number) {
  await getUser();
  const supabase = await createClient();
  const { error } = await supabase
    .from('workers')
    .insert([{ farm_id: farmId, name, share_percentage, mobile_number: mobile_number || null }]);
  if (error) throw error;
}

export async function updateWorker(workerId, name, share_percentage, mobile_number) {
  await getUser();
  const supabase = await createClient();
  const { error } = await supabase
    .from('workers')
    .update({ name, share_percentage, mobile_number: mobile_number || null })
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
  const userId = await getUser();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('expenses')
    .insert([{ farm_id: farmId, worker_id: workerId || null, type, name, amount, date, comment }])
    .select('*, workers(name)')
    .single();

  if (error) throw error;

  await createLog({
    userId,
    farmId,
    action: 'CREATE',
    category: type,
    itemName: data.workers?.name || name,
    amount,
    details: { comment, date }
  });
}

export async function updateExpense(expenseId, { workerId, name, amount, date, comment }) {
  const userId = await getUser();
  const supabase = await createClient();

  // Check 2-minute rule for worker expenses
  const { data: existing, error: fetchError } = await supabase
    .from('expenses')
    .select('created_at, type, farm_id, name, amount, workers(name)')
    .eq('id', expenseId)
    .single();
  
  if (!fetchError && (existing.type === 'upad' || existing.type === 'majuri')) {
    const created = new Date(existing.created_at).getTime();
    const now = Date.now();
    if (now - created > 2 * 60 * 1000) {
      throw new Error('Edit window expired (2 minutes)');
    }
  }

  const { error } = await supabase
    .from('expenses')
    .update({ worker_id: workerId || null, name, amount, date, comment })
    .eq('id', expenseId);
  if (error) throw error;

  await createLog({
    userId,
    farmId: existing.farm_id,
    action: 'UPDATE',
    category: existing.type,
    itemName: existing.workers?.name || existing.name,
    amount,
    details: { 
      old: { name: existing.name, amount: existing.amount },
      new: { name, amount, comment }
    }
  });
}

export async function deleteExpense(expenseId, pin) {
  const userId = await getUser();
  const supabase = await createClient();
  const { data: existing, error: fetchError } = await supabase
    .from('expenses')
    .select('created_at, type, farm_id, name, amount, workers(name)')
    .eq('id', expenseId)
    .single();
  
  if (!fetchError && (existing.type === 'upad' || existing.type === 'majuri')) {
    const created = new Date(existing.created_at).getTime();
    const now = Date.now();
    if (now - created > 2 * 60 * 1000) {
      return { success: false, message: 'Delete window expired (2 minutes)' };
    }
  }

  const res = await verifyPinAndDelete('expenses', expenseId, pin);
  if (res.success && !fetchError) {
    await createLog({
      userId,
      farmId: existing.farm_id,
      action: 'DELETE',
      category: existing.type,
      itemName: existing.workers?.name || existing.name,
      amount: existing.amount,
      details: { name: existing.name }
    });
  }
  return res;
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

// -- LOGS --

export async function getLogs(farmId) {
  try {
    const user = await getUserRecord();
    const supabase = await createClient();
    
    let query = supabase.from('logs').select('*, farms(name)');
    
    if (farmId) {
      query = query.eq('farm_id', farmId);
    } else {
      const allFarms = await getFarms();
      const farmIds = allFarms.map(f => f.id);
      if (farmIds.length === 0) return [];
      query = query.in('farm_id', farmIds);
    }
    
    const { data, error } = await query
      .order('created_at', { ascending: false })
      .limit(100);
      
    if (error) {
      console.error('Supabase error in getLogs:', error);
      throw new Error(error.message || 'Database error occurred');
    }
    
    return data;
  } catch (err) {
    console.error('getLogs action failed:', err);
    throw err;
  }
}

// Internals

async function createLog({ userId, farmId, action, category, itemName, amount, details }) {
  try {
    const supabase = await createClient();
    await supabase.from('logs').insert([{
      user_id: userId,
      farm_id: farmId,
      action,
      category,
      item_name: itemName,
      amount,
      details
    }]);
  } catch (err) {
    console.error('Failed to create log:', err);
    // Don't throw, we don't want to break the main action if logging fails
  }
}

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
