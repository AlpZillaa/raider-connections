-- Add performance optimizations for realtime chat

-- 1. Add indexes for faster message queries
CREATE INDEX IF NOT EXISTS messages_match_id_created_at_idx 
  ON public.messages(match_id, created_at);

CREATE INDEX IF NOT EXISTS messages_sender_id_idx 
  ON public.messages(sender_id);

-- 2. Add indexes for match queries
CREATE INDEX IF NOT EXISTS matches_user1_id_idx 
  ON public.matches(user1_id);

CREATE INDEX IF NOT EXISTS matches_user2_id_idx 
  ON public.matches(user2_id);

-- 3. Add indexes for swipes queries
CREATE INDEX IF NOT EXISTS swipes_swiper_id_idx 
  ON public.swipes(swiper_id);

CREATE INDEX IF NOT EXISTS swipes_swiped_id_idx 
  ON public.swipes(swiped_id);

-- 4. Ensure profiles table has performance indexes
CREATE INDEX IF NOT EXISTS profiles_user_id_idx 
  ON public.profiles(user_id);

-- 5. Add modified_at column for messages to track edits (future feature)
ALTER TABLE public.messages
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Create trigger to update messages updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_messages_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_messages_updated_at ON public.messages;

CREATE TRIGGER update_messages_updated_at
  BEFORE UPDATE ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_messages_updated_at_column();
