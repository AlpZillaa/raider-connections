-- User Blocking System

-- 1. Create blocked_users table
CREATE TABLE IF NOT EXISTS public.blocked_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  blocked_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  reason TEXT,
  
  -- Prevent duplicate blocks
  UNIQUE(blocker_id, blocked_id),
  -- Prevent self-blocking
  CHECK(blocker_id != blocked_id)
);

-- 2. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_blocked_users_blocker_id ON public.blocked_users(blocker_id);
CREATE INDEX IF NOT EXISTS idx_blocked_users_blocked_id ON public.blocked_users(blocked_id);
CREATE INDEX IF NOT EXISTS idx_blocked_users_created_at ON public.blocked_users(created_at);

-- 3. Enable RLS on blocked_users table
ALTER TABLE public.blocked_users ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policy: Users can view blocks they've created
CREATE POLICY "Users can view their own blocks"
  ON public.blocked_users
  FOR SELECT
  USING (blocker_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid() LIMIT 1));

-- 5. RLS Policy: Users can create blocks
CREATE POLICY "Users can create blocks"
  ON public.blocked_users
  FOR INSERT
  WITH CHECK (blocker_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid() LIMIT 1));

-- 6. RLS Policy: Users can delete their own blocks
CREATE POLICY "Users can delete their own blocks"
  ON public.blocked_users
  FOR DELETE
  USING (blocker_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid() LIMIT 1));

-- 7. Function to check if a profile is blocked
CREATE OR REPLACE FUNCTION public.is_profile_blocked(target_profile_id UUID)
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

  -- Check if target profile has been blocked by viewer
  RETURN EXISTS (
    SELECT 1 FROM public.blocked_users
    WHERE blocker_id = viewer_id AND blocked_id = target_profile_id
  );
END;
$$;

-- 8. Update discovery filter - modify photo verification function to also exclude blocked users
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

  -- Block if target has blocked viewer (mutual visibility issue)
  IF EXISTS (
    SELECT 1 FROM public.blocked_users
    WHERE blocker_id = target_profile_id AND blocked_id = viewer_id
  ) THEN
    RETURN FALSE;
  END IF;

  -- Allow viewing:
  -- 1. Your own profile
  -- 2. Profiles you've already swiped on
  -- 3. Profiles you've matched with
  -- 4. Verified profiles in discovery (photo_verified = true) and not blocked
  
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
      -- For discovery: only show verified profiles and not blocked
      (SELECT photo_verified FROM public.profiles WHERE id = target_profile_id) = true
      AND NOT EXISTS (
        SELECT 1 FROM public.blocked_users
        WHERE blocker_id = viewer_id AND blocked_id = target_profile_id
      )
    )
  );
END;
$$;

-- 9. Grant necessary permissions
GRANT ALL ON public.blocked_users TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_profile_blocked TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_view_profile TO authenticated;
