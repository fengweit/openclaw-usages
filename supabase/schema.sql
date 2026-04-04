-- ============================================
-- OpenClaw Usage Analyzer — Supabase Schema
-- Run this in your Supabase SQL Editor
-- ============================================

-- 1. User profiles (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'premium')),
  stripe_customer_id TEXT,
  notification_prefs JSONB DEFAULT '{"email": true, "product_updates": true, "weekly_digest": false}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: create profile after signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. Waitlist (email collection for upcoming features)
CREATE TABLE IF NOT EXISTS public.waitlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  source TEXT DEFAULT 'landing', -- landing, cli, calculator
  features TEXT[] DEFAULT '{}', -- which features they're interested in
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Usage snapshots (when users upload/sync their data)
CREATE TABLE IF NOT EXISTS public.usage_snapshots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  period_start DATE,
  period_end DATE,
  total_cost DECIMAL(10,4),
  total_messages INTEGER,
  total_input_tokens BIGINT,
  total_output_tokens BIGINT,
  total_cache_read_tokens BIGINT,
  total_cache_write_tokens BIGINT,
  model_breakdown JSONB, -- { "claude-opus-4-6": { cost, messages, tokens } }
  daily_costs JSONB,     -- [{ date, cost, messages }]
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Row Level Security (RLS)
-- ============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_snapshots ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read/update their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Waitlist: anyone can insert (anon access for landing page)
CREATE POLICY "Anyone can join waitlist"
  ON public.waitlist FOR INSERT
  WITH CHECK (true);

-- Usage snapshots: users can CRUD their own
CREATE POLICY "Users can view own snapshots"
  ON public.usage_snapshots FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own snapshots"
  ON public.usage_snapshots FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own snapshots"
  ON public.usage_snapshots FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- Indexes
-- ============================================

CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_plan ON public.profiles(plan);
CREATE INDEX IF NOT EXISTS idx_waitlist_email ON public.waitlist(email);
CREATE INDEX IF NOT EXISTS idx_usage_snapshots_user ON public.usage_snapshots(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_snapshots_period ON public.usage_snapshots(period_start, period_end);
