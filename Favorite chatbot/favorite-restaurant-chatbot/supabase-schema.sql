-- ============================================================
-- FAVORITE RESTAURANT CHATBOT — SUPABASE SCHEMA
-- Run this entire file in your Supabase SQL Editor
-- ============================================================

-- 1. KNOWLEDGE BASE TABLE
CREATE TABLE IF NOT EXISTS public.knowledge_base (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category    text NOT NULL,
  content     text NOT NULL,
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- 2. CONVERSATIONS TABLE
CREATE TABLE IF NOT EXISTS public.conversations (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id  text NOT NULL,
  role        text NOT NULL CHECK (role IN ('user', 'assistant')),
  message     text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS conversations_session_idx ON public.conversations(session_id);
CREATE INDEX IF NOT EXISTS conversations_created_idx ON public.conversations(created_at DESC);

-- 3. RESERVATIONS TABLE
CREATE TABLE IF NOT EXISTS public.reservations (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_name        text NOT NULL,
  phone             text NOT NULL,
  party_size        integer NOT NULL,
  reservation_type  text NOT NULL,
  visit_date        text NOT NULL,
  arrival_time      text NOT NULL,
  tables_needed     integer NOT NULL DEFAULT 1,
  food_preorder     text,
  special_requests  text,
  status            text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','confirmed','cancelled')),
  created_at        timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS reservations_created_idx ON public.reservations(created_at DESC);
CREATE INDEX IF NOT EXISTS reservations_status_idx  ON public.reservations(status);

-- 4. CONTACT SUBMISSIONS TABLE (landing page contact form)
CREATE TABLE IF NOT EXISTS public.contact_submissions (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text NOT NULL,
  email         text NOT NULL,
  business_type text,
  message       text NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE public.knowledge_base       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_submissions  ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if re-running
DROP POLICY IF EXISTS "service_role_all_knowledge_base"      ON public.knowledge_base;
DROP POLICY IF EXISTS "service_role_all_conversations"       ON public.conversations;
DROP POLICY IF EXISTS "service_role_all_reservations"        ON public.reservations;
DROP POLICY IF EXISTS "service_role_all_contact_submissions" ON public.contact_submissions;

-- SERVICE ROLE: full access to all tables (used by your API)
CREATE POLICY "service_role_all_knowledge_base"
  ON public.knowledge_base FOR ALL
  TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "service_role_all_conversations"
  ON public.conversations FOR ALL
  TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "service_role_all_reservations"
  ON public.reservations FOR ALL
  TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "service_role_all_contact_submissions"
  ON public.contact_submissions FOR ALL
  TO service_role USING (true) WITH CHECK (true);

-- ANON ROLE: allow inserts only for contact submissions (public form)
DROP POLICY IF EXISTS "anon_insert_contact" ON public.contact_submissions;
CREATE POLICY "anon_insert_contact"
  ON public.contact_submissions FOR INSERT
  TO anon WITH CHECK (true);

-- ============================================================
-- DONE — your tables are ready. Now run the seed script:
--   node scripts/seed.js
-- ============================================================
