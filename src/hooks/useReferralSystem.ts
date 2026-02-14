import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface ReferralData {
  referral_code: string;
  total_referrals: number;
  successful_referrals: number;
  total_rewards_claimed: number;
}

export const useReferralSystem = (userId?: string) => {
  const [referralData, setReferralData] = useState<ReferralData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!userId) return;

    const fetchReferralData = async () => {
      try {
        setLoading(true);

        // Fetch or create referral stats
        const { data: stats, error: statsError } = await supabase
          .from("referral_stats")
          .select("*")
          .eq("user_id", userId)
          .single();

        if (statsError && statsError.code !== "PGRST116") throw statsError;

        if (!stats) {
          // Create new referral record
          const code = `RAI_${Date.now().toString(36).toUpperCase()}`;
          const { data: newStats } = await supabase
            .from("referral_stats")
            .insert([
              {
                user_id: userId,
                total_referrals: 0,
                successful_referrals: 0,
                total_rewards_claimed: 0,
              },
            ])
            .select()
            .single();

          setReferralData({
            referral_code: code,
            total_referrals: 0,
            successful_referrals: 0,
            total_rewards_claimed: 0,
          });
        } else {
          // Generate code based on user ID
          const code = `RAI_${userId.slice(0, 8).toUpperCase()}`;
          setReferralData({
            referral_code: code,
            total_referrals: stats.total_referrals,
            successful_referrals: stats.successful_referrals,
            total_rewards_claimed: stats.total_rewards_claimed,
          });
        }
      } catch (err) {
        console.error("Error fetching referral data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchReferralData();
  }, [userId]);

  const shareReferralCode = async () => {
    if (!referralData) return;

    const shareText = `Join me on RaiderRash! Use code ${referralData.referral_code} to get 1 week of premium free. https://raiderrash.com?ref=${referralData.referral_code}`;

    if (navigator.share) {
      navigator.share({
        title: "RaiderRash Referral",
        text: shareText,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareText);
      toast({ title: "Referral code copied!" });
    }
  };

  const redeemReferralCode = async (code: string) => {
    try {
      // Find referral by code
      const { data: referral, error: lookupError } = await supabase
        .from("referrals")
        .select("*")
        .eq("referral_code", code)
        .single();

      if (lookupError) {
        toast({ title: "Invalid referral code", variant: "destructive" });
        return false;
      }

      // Check if already redeemed
      if (referral.reward_status === "completed") {
        toast({ title: "This referral has already been used", variant: "destructive" });
        return false;
      }

      // Update referral to completed
      const { error: updateError } = await supabase
        .from("referrals")
        .update({
          reward_status: "completed",
          completed_at: new Date().toISOString(),
        })
        .eq("id", referral.id);

      if (updateError) throw updateError;

      // Award referrer
      await supabase.from("referral_rewards").insert([
        {
          user_id: referral.referrer_id,
          referral_id: referral.id,
          reward_type: "premium_week",
          reward_value: 7,
          claimed: false,
        },
      ]);

      // Award referred user
      await supabase.from("referral_rewards").insert([
        {
          user_id: userId,
          referral_id: referral.id,
          reward_type: "premium_week",
          reward_value: 7,
          claimed: false,
        },
      ]);

      toast({ title: "Code redeemed! Get 1 week of premium" });
      return true;
    } catch (err) {
      console.error("Redemption error:", err);
      toast({ title: "Failed to redeem code", variant: "destructive" });
      return false;
    }
  };

  const claimRewards = async () => {
    try {
      // Get unclaimed rewards
      const { data: rewards, error: fetchError } = await supabase
        .from("referral_rewards")
        .select("*")
        .eq("user_id", userId)
        .eq("claimed", false);

      if (fetchError) throw fetchError;

      if (!rewards || rewards.length === 0) {
        toast({ title: "No unclaimed rewards" });
        return false;
      }

      // Mark as claimed
      const rewardIds = rewards.map((r) => r.id);
      const { error: claimError } = await supabase
        .from("referral_rewards")
        .update({ claimed: true, claimed_at: new Date().toISOString() })
        .in("id", rewardIds);

      if (claimError) throw claimError;

      toast({
        title: "Rewards claimed!",
        description: `You've unlocked ${rewards.length} rewards`,
      });

      return true;
    } catch (err) {
      console.error("Claim error:", err);
      toast({ title: "Failed to claim rewards", variant: "destructive" });
      return false;
    }
  };

  return {
    referralData,
    loading,
    shareReferralCode,
    redeemReferralCode,
    claimRewards,
  };
};
