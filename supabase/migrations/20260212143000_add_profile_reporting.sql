-- Add profile reporting system

-- 1. Create profile_reports table
CREATE TABLE IF NOT EXISTS public.profile_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reported_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'open', -- open, in_review, resolved
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(reporter_id, reported_id, category) -- avoid duplicate same-category reports
);

-- 2. Indexes
CREATE INDEX IF NOT EXISTS idx_profile_reports_reported_id ON public.profile_reports(reported_id);
CREATE INDEX IF NOT EXISTS idx_profile_reports_created_at ON public.profile_reports(created_at);

-- 3. Enable RLS
ALTER TABLE public.profile_reports ENABLE ROW LEVEL SECURITY;

-- 4. RLS policy: reporters can insert and view their reports
CREATE POLICY "Reporters can manage their reports"
  ON public.profile_reports
  FOR ALL
  USING (reporter_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid() LIMIT 1))
  WITH CHECK (reporter_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid() LIMIT 1));

-- 5. Grant execute/select/insert to authenticated
GRANT SELECT, INSERT, UPDATE ON public.profile_reports TO authenticated;

-- 6. Trigger to update updated_at
CREATE OR REPLACE FUNCTION public.profile_reports_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_profile_reports_updated_at
BEFORE UPDATE ON public.profile_reports
FOR EACH ROW
EXECUTE PROCEDURE public.profile_reports_updated_at();

-- 7. Grant function execute
GRANT EXECUTE ON FUNCTION public.profile_reports_updated_at TO authenticated;
