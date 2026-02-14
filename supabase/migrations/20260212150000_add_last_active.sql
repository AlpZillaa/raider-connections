-- Add last_active column to profiles to track activity timestamps

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS last_active TIMESTAMP WITH TIME ZONE;

-- Index for quick queries
CREATE INDEX IF NOT EXISTS idx_profiles_last_active ON public.profiles(last_active);

-- Grant select/update to authenticated users (RLS still applies)
GRANT SELECT, UPDATE ON public.profiles TO authenticated;
