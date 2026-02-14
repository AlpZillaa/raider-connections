import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useOnboarding = (currentUserId?: string) => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUserId) {
      setLoading(false);
      return;
    }

    const checkOnboarding = async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("onboarding_completed")
          .eq("id", currentUserId)
          .single();

        if (error) {
          console.error("Error checking onboarding:", error);
          setLoading(false);
          return;
        }

        const completed = data?.onboarding_completed || false;
        setHasCompleted(completed);
        setShowOnboarding(!completed);
        setLoading(false);
      } catch (err) {
        console.error("Error in useOnboarding:", err);
        setLoading(false);
      }
    };

    checkOnboarding();
  }, [currentUserId]);

  const completeOnboarding = async () => {
    if (!currentUserId) return;

    try {
      await supabase
        .from("profiles")
        .update({
          onboarding_completed: true,
          onboarding_completed_at: new Date().toISOString(),
        })
        .eq("id", currentUserId);

      setShowOnboarding(false);
      setHasCompleted(true);
    } catch (err) {
      console.error("Error completing onboarding:", err);
    }
  };

  return { showOnboarding, hasCompleted, loading, completeOnboarding };
};

export default useOnboarding;
