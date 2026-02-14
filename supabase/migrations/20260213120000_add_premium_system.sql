-- Premium subscription tier system
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  tier VARCHAR(50) NOT NULL DEFAULT 'free', -- 'free', 'premium', 'premium_plus'
  stripe_customer_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255),
  status VARCHAR(50) NOT NULL DEFAULT 'active', -- 'active', 'canceled', 'past_due'
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(profile_id)
);

-- Premium feature usage tracking
CREATE TABLE premium_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  feature_type VARCHAR(50) NOT NULL, -- 'super_like', 'rewind', 'see_who_liked'
  usage_count INT DEFAULT 0,
  monthly_reset_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(profile_id, feature_type)
);

-- Super likes tracking
CREATE TABLE super_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(sender_id, recipient_id)
);

-- Rewind tracking (undo last swipe)
CREATE TABLE rewinds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  original_swipe_id UUID NOT NULL REFERENCES swipes(id) ON DELETE CASCADE,
  rewind_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_subscriptions_profile_id ON subscriptions(profile_id);
CREATE INDEX idx_subscriptions_tier ON subscriptions(tier);
CREATE INDEX idx_premium_features_profile_id ON premium_features(profile_id);
CREATE INDEX idx_super_likes_sender_id ON super_likes(sender_id);
CREATE INDEX idx_super_likes_recipient_id ON super_likes(recipient_id);
CREATE INDEX idx_rewinds_profile_id ON rewinds(profile_id);

-- RLS policies
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE premium_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE super_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE rewinds ENABLE ROW LEVEL SECURITY;

-- Users can only see their own subscription
CREATE POLICY "Users can view own subscription" ON subscriptions
  FOR SELECT USING (auth.uid() = profile_id);

CREATE POLICY "Users can update own subscription" ON subscriptions
  FOR UPDATE USING (auth.uid() = profile_id);

-- Users can only see their own premium features
CREATE POLICY "Users can view own premium features" ON premium_features
  FOR SELECT USING (auth.uid() = profile_id);

CREATE POLICY "Users can update own premium features" ON premium_features
  FOR UPDATE USING (auth.uid() = profile_id);

-- Users can see super likes they sent/received
CREATE POLICY "Users can view super likes" ON super_likes
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can create super likes" ON super_likes
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Users can see their own rewinds
CREATE POLICY "Users can view own rewinds" ON rewinds
  FOR SELECT USING (auth.uid() = profile_id);
