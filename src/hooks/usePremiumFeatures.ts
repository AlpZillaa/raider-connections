import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface PremiumFeatures {
  super_like: { remaining: number; limit: number };
  rewind: { remaining: number; limit: number };
  see_who_liked: { remaining: number; limit: number };
}

export const usePremiumFeatures = (userId?: string, isPremium?: boolean) => {
  const [features, setFeatures] = useState<PremiumFeatures>({
    super_like: { remaining: 0, limit: 0 },
    rewind: { remaining: 0, limit: 0 },
    see_who_liked: { remaining: 0, limit: 0 },
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!userId || !isPremium) {
      setFeatures({
        super_like: { remaining: 0, limit: 0 },
        rewind: { remaining: 0, limit: 0 },
        see_who_liked: { remaining: 0, limit: 0 },
      });
      setLoading(false);
      return;
    }

    const fetchFeatures = async () => {
      try {
        const { data, error } = await supabase
          .from("premium_features")
          .select("*")
          .eq("profile_id", userId);

        if (error) throw error;

        // Process feature data
        const featureMap: Record<string, any> = {};
        data?.forEach((f: any) => {
          featureMap[f.feature_type] = f.usage_count;
        });

        // Set limits based on subscription tier
        setFeatures({
          super_like: { remaining: Math.max(0, 5 - (featureMap.super_like || 0)), limit: 5 },
          rewind: { remaining: Math.max(0, 1 - (featureMap.rewind || 0)), limit: 1 },
          see_who_liked: { remaining: Math.max(0, 3 - (featureMap.see_who_liked || 0)), limit: 3 },
        });
      } catch (err) {
        console.error("Error fetching premium features:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatures();
  }, [userId, isPremium]);

  const useSuperLike = async (recipientId: string) => {
    if (features.super_like.remaining <= 0) {
      toast({ title: "No super likes remaining", variant: "destructive" });
      return false;
    }

    try {
      // Create super like
      const { error: likeError } = await supabase
        .from("super_likes")
        .insert([{ sender_id: userId, recipient_id: recipientId }]);

      if (likeError) throw likeError;

      // Update usage count
      await supabase
        .from("premium_features")
        .update({
          usage_count: (features.super_like.limit - features.super_like.remaining) + 1,
        })
        .eq("profile_id", userId)
        .eq("feature_type", "super_like");

      // Update local state
      setFeatures((prev) => ({
        ...prev,
        super_like: { ...prev.super_like, remaining: prev.super_like.remaining - 1 },
      }));

      toast({ title: "Super like sent! ⭐" });
      return true;
    } catch (err) {
      console.error("Super like error:", err);
      toast({ title: "Failed to send super like", variant: "destructive" });
      return false;
    }
  };

  const useRewind = async (swipeId: string) => {
    if (features.rewind.remaining <= 0) {
      toast({ title: "No rewinds remaining", variant: "destructive" });
      return false;
    }

    try {
      const { error } = await supabase
        .from("rewinds")
        .insert([{ profile_id: userId, original_swipe_id: swipeId }]);

      if (error) throw error;

      setFeatures((prev) => ({
        ...prev,
        rewind: { ...prev.rewind, remaining: prev.rewind.remaining - 1 },
      }));

      toast({ title: "Rewind used! ⏮️" });
      return true;
    } catch (err) {
      console.error("Rewind error:", err);
      toast({ title: "Failed to rewind", variant: "destructive" });
      return false;
    }
  };

  const checkSeeWhoLiked = async () => {
    if (features.see_who_liked.remaining <= 0) {
      toast({ title: "No views remaining", variant: "destructive" });
      return null;
    }

    try {
      // Fetch list of users who super liked this user
      const { data, error } = await supabase
        .from("super_likes")
        .select("sender_id, profiles!super_likes_sender_id(*)")
        .eq("recipient_id", userId)
        .limit(5);

      if (error) throw error;

      // Update usage
      await supabase
        .from("premium_features")
        .update({
          usage_count: (features.see_who_liked.limit - features.see_who_liked.remaining) + 1,
        })
        .eq("profile_id", userId)
        .eq("feature_type", "see_who_liked");

      setFeatures((prev) => ({
        ...prev,
        see_who_liked: { ...prev.see_who_liked, remaining: prev.see_who_liked.remaining - 1 },
      }));

      return data || [];
    } catch (err) {
      console.error("See who liked error:", err);
      toast({ title: "Failed to load", variant: "destructive" });
      return null;
    }
  };

  return {
    features,
    loading,
    useSuperLike,
    useRewind,
    checkSeeWhoLiked,
  };
};
