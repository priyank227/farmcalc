-- Run this script in the Supabase SQL Editor

-- 1. Create Users Table
CREATE TABLE public.users (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  mobile_number text UNIQUE NOT NULL,
  pin text NOT NULL,
  name text,
  created_at timestamp with time zone DEFAULT now()
);

-- 2. Create Farms Table
CREATE TABLE public.farms (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  note text,
  created_at timestamp with time zone DEFAULT now()
);

-- 3. Create Workers Table
CREATE TABLE public.workers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  farm_id uuid REFERENCES public.farms(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  mobile_number text, -- NEW
  share_percentage numeric DEFAULT 25 NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- 4. Create Expenses Table
CREATE TABLE public.expenses (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  farm_id uuid REFERENCES public.farms(id) ON DELETE CASCADE NOT NULL,
  worker_id uuid REFERENCES public.workers(id) ON DELETE SET NULL, -- Nullable for general pesticide expenses
  type text NOT NULL CHECK (type IN ('upad', 'pesticide')),
  name text NOT NULL,
  amount numeric NOT NULL,
  date date NOT NULL,
  comment text,
  created_at timestamp with time zone DEFAULT now()
);

-- 5. Create Income Table
CREATE TABLE public.income (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  farm_id uuid REFERENCES public.farms(id) ON DELETE CASCADE NOT NULL,
  crop_name text NOT NULL,
  amount numeric NOT NULL,
  price numeric, -- optional per unit
  date date NOT NULL,
  comment text,
  created_at timestamp with time zone DEFAULT now()
);

-- Setup Row Level Security (RLS) - Basic disable for custom auth wrapper
-- Since we are using Custom Auth logic and direct pg queries via the anon key but effectively as a service
-- For MVP we'll disable RLS, assuming standard backend queries will protect data by manual checks.
-- ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
-- (RLS is disabled by default on new tables in public schema until you ENABLE it)

-- Add indexes for better query performance
CREATE INDEX idx_users_mobile on public.users(mobile_number);
CREATE INDEX idx_farms_user on public.farms(user_id);
CREATE INDEX idx_workers_farm on public.workers(farm_id);
CREATE INDEX idx_expenses_farm on public.expenses(farm_id);
CREATE INDEX idx_income_farm on public.income(farm_id);
