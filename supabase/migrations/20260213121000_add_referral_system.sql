-- Referral system for user acquisition
CREATE TABLE referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  referred_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  referral_code VARCHAR(20) UNIQUE NOT NULL,
  reward_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'completed', 'expired'
  reward_type VARCHAR(50) DEFAULT 'premium_week', -- 'premium_week', 'super_likes', 'discount'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + INTERVAL '30 days'),
  UNIQUE(referrer_id, referred_id)
);

-- Referral rewards ledger
CREATE TABLE referral_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  referral_id UUID NOT NULL REFERENCES referrals(id) ON DELETE CASCADE,
  reward_type VARCHAR(50) NOT NULL,
  reward_value INT, -- days of premium, number of super likes, etc
  claimed BOOLEAN DEFAULT FALSE,
  claimed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Referral statistics for dashboard
CREATE TABLE referral_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  total_referrals INT DEFAULT 0,
  successful_referrals INT DEFAULT 0,
  total_rewards_claimed INT DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Indexes
CREATE INDEX idx_referrals_referrer_id ON referrals(referrer_id);
CREATE INDEX idx_referrals_referred_id ON referrals(referred_id);
CREATE INDEX idx_referrals_code ON referrals(referral_code);
CREATE INDEX idx_referral_rewards_user_id ON referral_rewards(user_id);
CREATE INDEX idx_referral_stats_user_id ON referral_stats(user_id);

-- RLS policies
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view referrals they created" ON referrals
  FOR SELECT USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

CREATE POLICY "Users can create referrals" ON referrals
  FOR INSERT WITH CHECK (auth.uid() = referrer_id);

CREATE POLICY "Users can view their own rewards" ON referral_rewards
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view their referral stats" ON referral_stats
  FOR SELECT USING (auth.uid() = user_id);

-- Generate referral code function
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS VARCHAR(20) AS $$
BEGIN
  RETURN SUBSTR(MD5(RANDOM()::TEXT || CLOCK_TIMESTAMP()::TEXT), 1, 8);
END;
$$ LANGUAGE plpgsql;
