import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Subscription {
  id: string;
  profile_id: string;
  tier: "free" | "premium" | "premium_plus";
  status: "active" | "canceled" | "past_due";
  current_period_end: string;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
}

export const useSubscription = (userId?: string) => {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!userId) return;

    const fetchSubscription = async () => {
      try {
        setLoading(true);
        const { data, error: fetchError } = await supabase
          .from("subscriptions")
          .select("*")
          .eq("profile_id", userId)
          .single();

        if (fetchError && fetchError.code !== "PGRST116") {
          throw fetchError;
        }

        // If no subscription, create a free one
        if (!data) {
          const { data: newSub } = await supabase
            .from("subscriptions")
            .insert([{ profile_id: userId, tier: "free" }])
            .select()
            .single();
          setSubscription(newSub);
        } else {
          setSubscription(data);
        }
      } catch (err) {
        console.error("Error fetching subscription:", err);
        setError("Failed to load subscription");
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, [userId]);

  const isPremium = subscription?.tier === "premium" || subscription?.tier === "premium_plus";
  const isPremiumPlus = subscription?.tier === "premium_plus";

  const upgradeToPremium = async (tier: "premium" | "premium_plus") => {
    try {
      // In production, this would create Stripe checkout session
      // For now, update locally
      const { data, error: updateError } = await supabase
        .from("subscriptions")
        .update({
          tier,
          status: "active",
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        })
        .eq("profile_id", userId)
        .select()
        .single();

      if (updateError) throw updateError;
      setSubscription(data);
      toast({ title: "Upgrade complete!", description: `You're now a ${tier} member!` });
      return true;
    } catch (err) {
      console.error("Upgrade error:", err);
      toast({ title: "Upgrade failed", variant: "destructive" });
      return false;
    }
  };

  const cancelSubscription = async () => {
    try {
      const { data, error: updateError } = await supabase
        .from("subscriptions")
        .update({ tier: "free", status: "canceled" })
        .eq("profile_id", userId)
        .select()
        .single();

      if (updateError) throw updateError;
      setSubscription(data);
      toast({ title: "Subscription canceled" });
      return true;
    } catch (err) {
      console.error("Cancellation error:", err);
      toast({ title: "Cancellation failed", variant: "destructive" });
      return false;
    }
  };

  return {
    subscription,
    loading,
    error,
    isPremium,
    isPremiumPlus,
    upgradeToPremium,
    cancelSubscription,
  };
};
