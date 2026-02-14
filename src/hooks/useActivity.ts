import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

// Updates `profiles.last_active` for the current user periodically and on focus/visibility change.
export const useActivity = () => {
  const intervalRef = useRef<number | null>(null);

  const updateLastActive = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Update profile by user_id
      await supabase
        .from("profiles")
        .update({ last_active: new Date().toISOString() })
        .eq("user_id", user.id);
    } catch (err) {
      console.error("Error updating last_active:", err);
    }
  };

  const start = () => {
    // Update once immediately
    updateLastActive();

    // Update every 60 seconds
    if (intervalRef.current == null) {
      intervalRef.current = window.setInterval(() => {
        updateLastActive();
      }, 60000);
    }

    // Visibility/focus handlers
    const handleVisibility = () => {
      if (document.visibilityState === "visible") updateLastActive();
    };

    window.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("focus", updateLastActive as any);

    // store cleanup on ref for stop
    (start as any)._cleanup = () => {
      window.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("focus", updateLastActive as any);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  };

  const stop = () => {
    const cleanup = (start as any)._cleanup;
    if (typeof cleanup === "function") cleanup();
  };

  // Auto-start when hook is used in mounted component
  useEffect(() => {
    start();
    return () => stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { start, stop, updateLastActive };
};

export default useActivity;
