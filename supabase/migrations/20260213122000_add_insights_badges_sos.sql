-- User insights and analytics
CREATE TABLE user_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  month INT NOT NULL, -- 1-12
  year INT NOT NULL,
  total_swipes INT DEFAULT 0,
  total_likes INT DEFAULT 0,
  total_matches INT DEFAULT 0,
  profile_views INT DEFAULT 0,
  messages_sent INT DEFAULT 0,
  messages_received INT DEFAULT 0,
  match_rate FLOAT DEFAULT 0.0, -- likes / swipes
  response_rate FLOAT DEFAULT 0.0, -- messages received / matches
  avg_match_response_time_hours FLOAT,
  most_active_day VARCHAR(20),
  most_active_hour INT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(profile_id, month, year)
);

-- Badge verification (Instagram, Spotify, etc)
CREATE TABLE badge_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  badge_type VARCHAR(50) NOT NULL, -- 'instagram', 'spotify', 'college_email', 'facebook'
  external_username VARCHAR(255),
  external_id VARCHAR(255),
  verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(profile_id, badge_type)
);

-- Emergency SOS contacts
CREATE TABLE sos_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  contact_name VARCHAR(255) NOT NULL,
  contact_phone VARCHAR(20) NOT NULL,
  contact_relationship VARCHAR(100),
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- SOS event log (track when users triggered SOS)
CREATE TABLE sos_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  triggered_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  location_lat FLOAT,
  location_lng FLOAT,
  match_id UUID REFERENCES matches(id),
  resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  notes TEXT
);

-- Indexes
CREATE INDEX idx_user_insights_profile_id ON user_insights(profile_id);
CREATE INDEX idx_badge_verifications_profile_id ON badge_verifications(profile_id);
CREATE INDEX idx_badge_verifications_badge_type ON badge_verifications(badge_type);
CREATE INDEX idx_sos_contacts_profile_id ON sos_contacts(profile_id);
CREATE INDEX idx_sos_events_profile_id ON sos_events(profile_id);
CREATE INDEX idx_sos_events_triggered_at ON sos_events(triggered_at DESC);

-- RLS policies
ALTER TABLE user_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE badge_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE sos_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE sos_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own insights" ON user_insights
  FOR SELECT USING (auth.uid() = profile_id);

CREATE POLICY "Users can view own badges" ON badge_verifications
  FOR SELECT USING (auth.uid() = profile_id);

CREATE POLICY "Users can manage own badges" ON badge_verifications
  FOR INSERT WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can manage own SOS contacts" ON sos_contacts
  FOR SELECT USING (auth.uid() = profile_id);

CREATE POLICY "Users can insert SOS contacts" ON sos_contacts
  FOR INSERT WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can view own SOS events" ON sos_events
  FOR SELECT USING (auth.uid() = profile_id);

CREATE POLICY "Users can create SOS events" ON sos_events
  FOR INSERT WITH CHECK (auth.uid() = profile_id);
