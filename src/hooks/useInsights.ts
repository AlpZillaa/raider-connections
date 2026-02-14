import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface UserInsights {
  month: number;
  year: number;
  total_swipes: number;
  total_likes: number;
  total_matches: number;
  profile_views: number;
  messages_sent: number;
  messages_received: number;
  match_rate: number;
  response_rate: number;
  most_active_day?: string;
  most_active_hour?: number;
}

export const useInsights = (userId?: string) => {
  const [insights, setInsights] = useState<UserInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    const fetchInsights = async () => {
      try {
        setLoading(true);
        const now = new Date();
        const month = now.getMonth() + 1;
        const year = now.getFullYear();

        const { data, error: fetchError } = await supabase
          .from("user_insights")
          .select("*")
          .eq("profile_id", userId)
          .eq("month", month)
          .eq("year", year)
          .single();

        if (fetchError && fetchError.code !== "PGRST116") {
          throw fetchError;
        }

        if (data) {
          setInsights(data);
        } else {
          // Initialize empty insights for current month
          const { data: newInsights } = await supabase
            .from("user_insights")
            .insert([
              {
                profile_id: userId,
                month,
                year,
                total_swipes: 0,
                total_likes: 0,
                total_matches: 0,
                profile_views: 0,
                messages_sent: 0,
                messages_received: 0,
                match_rate: 0,
                response_rate: 0,
              },
            ])
            .select()
            .single();

          setInsights(newInsights);
        }
      } catch (err) {
        console.error("Error fetching insights:", err);
        setError("Failed to load insights");
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, [userId]);

  const updateInsights = async (updates: Partial<UserInsights>) => {
    if (!userId || !insights) return;

    try {
      const { data, error } = await supabase
        .from("user_insights")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("profile_id", userId)
        .eq("month", insights.month)
        .eq("year", insights.year)
        .select()
        .single();

      if (error) throw error;
      setInsights(data);
    } catch (err) {
      console.error("Error updating insights:", err);
    }
  };

  const incrementSwipes = () => {
    if (!insights) return;
    updateInsights({ total_swipes: (insights.total_swipes || 0) + 1 });
  };

  const incrementLikes = () => {
    if (!insights) return;
    updateInsights({ total_likes: (insights.total_likes || 0) + 1 });
  };

  const incrementMatches = () => {
    if (!insights) return;
    updateInsights({ total_matches: (insights.total_matches || 0) + 1 });
  };

  const incrementMessages = (type: "sent" | "received") => {
    if (!insights) return;
    if (type === "sent") {
      updateInsights({ messages_sent: (insights.messages_sent || 0) + 1 });
    } else {
      updateInsights({ messages_received: (insights.messages_received || 0) + 1 });
    }
  };

  return {
    insights,
    loading,
    error,
    updateInsights,
    incrementSwipes,
    incrementLikes,
    incrementMatches,
    incrementMessages,
  };
};
