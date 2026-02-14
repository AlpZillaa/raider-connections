-- Icebreaker prompts system
CREATE TABLE icebreaker_prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_text VARCHAR(500) NOT NULL,
  category VARCHAR(100), -- 'would_you_rather', 'fun_fact', 'question', 'challenge'
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- User icebreaker answers
CREATE TABLE icebreaker_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  prompt_id UUID NOT NULL REFERENCES icebreaker_prompts(id) ON DELETE CASCADE,
  answer TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(profile_id, prompt_id)
);

-- Icebreaker usage in chats
CREATE TABLE icebreaker_chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  prompt_id UUID NOT NULL REFERENCES icebreaker_prompts(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id),
  recipient_response TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indexes
CREATE INDEX idx_icebreaker_prompts_active ON icebreaker_prompts(is_active);
CREATE INDEX idx_icebreaker_answers_profile_id ON icebreaker_answers(profile_id);
CREATE INDEX idx_icebreaker_chats_match_id ON icebreaker_chats(match_id);

-- RLS policies
ALTER TABLE icebreaker_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE icebreaker_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE icebreaker_chats ENABLE ROW LEVEL SECURITY;

-- Everyone can see prompts
CREATE POLICY "Everyone can view active prompts" ON icebreaker_prompts
  FOR SELECT USING (is_active = TRUE);

-- Users can only see/manage their own answers
CREATE POLICY "Users can view own answers" ON icebreaker_answers
  FOR SELECT USING (auth.uid() = profile_id);

CREATE POLICY "Users can insert own answers" ON icebreaker_answers
  FOR INSERT WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can update own answers" ON icebreaker_answers
  FOR UPDATE USING (auth.uid() = profile_id);

-- Users can see icebreaker chats they're part of
CREATE POLICY "Users can view icebreaker chats" ON icebreaker_chats
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() IN (
    SELECT profile_id FROM matches WHERE id = match_id AND matched_profile_id = auth.uid()
  ));

-- Seed some icebreaker prompts
INSERT INTO icebreaker_prompts (prompt_text, category) VALUES
  ('Dream vacation destination?', 'question'),
  ('What''s a skill you want to learn?', 'question'),
  ('Karaoke song choice?', 'fun_fact'),
  ('Would you rather: Always be late or always be early?', 'would_you_rather'),
  ('Hidden talent?', 'fun_fact'),
  ('Most used emoji?', 'fun_fact'),
  ('Favorite study spot on campus?', 'question'),
  ('What makes you laugh?', 'question'),
  ('Dream dinner date location?', 'question'),
  ('Would you rather: Speak all languages or play all instruments?', 'would_you_rather')
ON CONFLICT DO NOTHING;
