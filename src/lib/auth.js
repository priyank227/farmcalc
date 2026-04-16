'use server';

import { cookies } from 'next/headers';
import { createClient } from './supabase-server';

export async function login(mobile_number, pin) {
  const supabase = await createClient();
  
  // Query custom users table
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('mobile_number', mobile_number)
    .single();

  if (error) return { success: false, message: `Database Error: ${error.message}` };
  if (!user) return { success: false, message: 'Invalid mobile number or PIN' };

  // Check PIN directly (no hashing)
  if (user.pin !== pin) {
    return { success: false, message: 'Invalid mobile number or PIN' };
  }

  // Create simple session using standard cookie
  const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
  const cookieStore = await cookies();
  cookieStore.set('session', user.id, { expires, httpOnly: true, secure: process.env.NODE_ENV === 'production' });

  return { success: true };
}

export async function register(mobile_number, pin) {
  const supabase = await createClient();
  
  const { data: user, error } = await supabase
    .from('users')
    .insert([{ mobile_number, pin }]) // Store PIN in plaintext
    .select()
    .single();

  if (error) {
    if (error.code === '23505') return { success: false, message: 'Mobile number already registered' };
    return { success: false, message: error.message };
  }

  // Create session
  const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  const cookieStore = await cookies();
  cookieStore.set('session', user.id, { expires, httpOnly: true, secure: process.env.NODE_ENV === 'production' });

  return { success: true };
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.set('session', '', { expires: new Date(0) });
}

export async function getSession() {
  const cookieStore = await cookies();
  const session = cookieStore.get('session');
  if (!session?.value) return null;
  return { userId: session.value };
}
