-- Add photo verification system to profiles

-- 1. Add verification columns to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS photo_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS profile_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS verification_attempts INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_verification_attempt TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS profile_photo_url TEXT;

-- 2. Add constraint for verification attempts (max 5 per day)
ALTER TABLE public.profiles
ADD CONSTRAINT verification_attempts_limit CHECK (verification_attempts <= 5);

-- 3. Create RLS policy for profiles - only show verified profiles in discovery
CREATE OR REPLACE FUNCTION public.can_view_profile(target_profile_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  viewer_id UUID;
BEGIN
  -- Get current user's profile ID
  SELECT id INTO viewer_id FROM public.profiles 
  WHERE user_id = auth.uid() LIMIT 1;

  -- Allow viewing:
  -- 1. Your own profile
  -- 2. Profiles you've already swiped on
  -- 3. Profiles you've matched with
  -- 4. Verified profiles in discovery (photo_verified = true)
  
  RETURN (
    target_profile_id = viewer_id OR
    EXISTS (
      SELECT 1 FROM public.swipes
      WHERE (swiper_id = viewer_id AND swiped_id = target_profile_id)
         OR (swiper_id = target_profile_id AND swiped_id = viewer_id)
    ) OR
    EXISTS (
      SELECT 1 FROM public.matches
      WHERE (user1_id = viewer_id AND user2_id = target_profile_id)
         OR (user1_id = target_profile_id AND user2_id = viewer_id)
    ) OR
    (
      -- For discovery: only show verified profiles
      (SELECT photo_verified FROM public.profiles WHERE id = target_profile_id) = true
    )
  );
END;
$$;

-- 4. Update discovery RLS policy to use verification function
DROP POLICY IF EXISTS "Users can view unswipeable profiles" ON public.profiles;

CREATE POLICY "Users view non-swiped verified profiles"
  ON public.profiles FOR SELECT
  USING (
    auth.uid() IS NOT NULL AND
    public.can_view_profile(id)
  );

-- 5. Add created index for verification queries
CREATE INDEX IF NOT EXISTS profiles_photo_verified_idx 
  ON public.profiles(photo_verified, created_at DESC);

CREATE INDEX IF NOT EXISTS profiles_profile_verified_idx 
  ON public.profiles(profile_verified, created_at DESC);

-- 6. Function to reset verification attempts daily
CREATE OR REPLACE FUNCTION public.reset_verification_attempts()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Reset attempts if last attempt was more than 24 hours ago
  IF NEW.last_verification_attempt IS NULL OR
     NOW() - NEW.last_verification_attempt > INTERVAL '1 day' THEN
    NEW.verification_attempts = 0;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS reset_verification_attempts_before_update ON public.profiles;

CREATE TRIGGER reset_verification_attempts_before_update
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.reset_verification_attempts();

-- 7. Create audit table for verification attempts
CREATE TABLE IF NOT EXISTS public.verification_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  attempted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')),
  rejection_reason TEXT,
  reviewer_notes TEXT
);

-- Enable RLS on verification_attempts
ALTER TABLE public.verification_attempts ENABLE ROW LEVEL SECURITY;

-- Only allow users to view their own verification attempts
CREATE POLICY "Users can view own verification attempts"
  ON public.verification_attempts FOR SELECT
  USING (
    profile_id IN (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
  );

-- Add index for verification queries
CREATE INDEX IF NOT EXISTS verification_attempts_profile_id_idx 
  ON public.verification_attempts(profile_id, attempted_at DESC);
