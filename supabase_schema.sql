-- Run this in your Supabase SQL editor to set up all tables.

-- ============================================================
-- USERS (extends auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.users (
  id              uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username        text UNIQUE NOT NULL,
  display_name    text NOT NULL,
  avatar_url      text,
  is_profile_public  boolean DEFAULT false,
  matching_opt_in    boolean DEFAULT false,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

-- Auto-create a user row on sign-up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.users (id, username, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'preferred_username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ============================================================
-- QUIZ ATTEMPTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid REFERENCES public.users(id) ON DELETE CASCADE,
  taken_at         timestamptz DEFAULT now(),
  is_current       boolean DEFAULT true,
  economic_score   numeric(5,2),
  social_score     numeric(5,2),
  government_score numeric(5,2),
  environment_score numeric(5,2),
  foreign_score    numeric(5,2),
  overall_score    numeric(5,2),
  orientation_label text,
  summary          text
);

-- ============================================================
-- QUIZ ANSWERS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.quiz_answers (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id    uuid REFERENCES public.quiz_attempts(id) ON DELETE CASCADE,
  question_key  text NOT NULL,
  answer_value  integer NOT NULL CHECK (answer_value >= 0 AND answer_value <= 100)
);

-- ============================================================
-- MATCHES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.matches (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_a_id      uuid REFERENCES public.users(id) ON DELETE CASCADE,
  user_b_id      uuid REFERENCES public.users(id) ON DELETE CASCADE,
  initiator_id   uuid REFERENCES public.users(id),
  created_at     timestamptz DEFAULT now(),
  status         text DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'declined_by_a', 'declined_by_b', 'blocked')),
  avg_score_diff numeric(5,2),
  agreeing_axes  text[],
  UNIQUE (user_a_id, user_b_id)
);

-- ============================================================
-- MESSAGES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.messages (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id    uuid REFERENCES public.matches(id) ON DELETE CASCADE,
  sender_id   uuid REFERENCES public.users(id) ON DELETE CASCADE,
  content     text NOT NULL,
  sent_at     timestamptz DEFAULT now(),
  is_deleted  boolean DEFAULT false
);

-- Index for efficient message loading per match
CREATE INDEX IF NOT EXISTS messages_match_id_sent_at ON public.messages (match_id, sent_at DESC);

-- ============================================================
-- REPORTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.reports (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id       uuid REFERENCES public.users(id) ON DELETE CASCADE,
  reported_user_id  uuid REFERENCES public.users(id) ON DELETE CASCADE,
  match_id          uuid REFERENCES public.matches(id),
  message_id        uuid REFERENCES public.messages(id),
  reason            text NOT NULL,
  created_at        timestamptz DEFAULT now(),
  status            text DEFAULT 'open' CHECK (status IN ('open', 'reviewed', 'actioned'))
);

-- ============================================================
-- CONVERSATION STARTERS (seed data)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.conversation_starters (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_text text NOT NULL,
  category    text
);

INSERT INTO public.conversation_starters (prompt_text, category) VALUES
  ('What life experience most shaped this view for you?', NULL),
  ('Is there any part of the other side''s argument you find compelling?', NULL),
  ('What would change your mind on this?', NULL),
  ('What do you think we actually agree on?', NULL),
  ('Which issue matters most to you personally, and why?', NULL)
ON CONFLICT DO NOTHING;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- users: read own row or public profiles; write own row only
CREATE POLICY "users_read_own" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "users_read_public" ON public.users FOR SELECT USING (is_profile_public = true);
CREATE POLICY "users_update_own" ON public.users FOR UPDATE USING (auth.uid() = id);

-- quiz_attempts: users access only their own
CREATE POLICY "quiz_attempts_own" ON public.quiz_attempts FOR ALL USING (auth.uid() = user_id);

-- quiz_answers: users access only their own (via attempt)
CREATE POLICY "quiz_answers_own" ON public.quiz_answers FOR ALL
  USING (attempt_id IN (SELECT id FROM public.quiz_attempts WHERE user_id = auth.uid()));

-- matches: users see their own matches
CREATE POLICY "matches_own" ON public.matches FOR SELECT
  USING (auth.uid() = user_a_id OR auth.uid() = user_b_id);

-- messages: users in the match can read/write
CREATE POLICY "messages_participants" ON public.messages FOR ALL
  USING (
    match_id IN (
      SELECT id FROM public.matches
      WHERE user_a_id = auth.uid() OR user_b_id = auth.uid()
    )
  );

-- reports: reporter can insert; cannot read others' reports
CREATE POLICY "reports_insert" ON public.reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "reports_read_own" ON public.reports FOR SELECT USING (auth.uid() = reporter_id);

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
