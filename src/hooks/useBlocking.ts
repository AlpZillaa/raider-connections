import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export interface BlockedUser {
  id: string;
  blocked_id: string;
  created_at: string;
  reason?: string;
}

export const useBlocking = () => {
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch current user's profile ID
  const getCurrentProfileId = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    return profile?.id || null;
  };

  // Fetch list of blocked users
  const fetchBlockedUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const profileId = await getCurrentProfileId();
      if (!profileId) return;

      const { data, error: fetchError } = await supabase
        .from("blocked_users")
        .select("*")
        .eq("blocker_id", profileId)
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;
      setBlockedUsers(data || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch blocked users";
      setError(message);
      console.error("Error fetching blocked users:", err);
    } finally {
      setLoading(false);
    }
  };

  // Check if a specific user is blocked
  const isUserBlocked = async (targetProfileId: string): Promise<boolean> => {
    try {
      const profileId = await getCurrentProfileId();
      if (!profileId) return false;

      const { data } = await supabase
        .from("blocked_users")
        .select("id")
        .eq("blocker_id", profileId)
        .eq("blocked_id", targetProfileId)
        .single();

      return !!data;
    } catch (err) {
      console.error("Error checking blocked status:", err);
      return false;
    }
  };

  // Block a user
  const blockUser = async (targetProfileId: string, reason?: string) => {
    try {
      setError(null);
      const profileId = await getCurrentProfileId();
      if (!profileId) throw new Error("Profile not found");

      const { error: blockError } = await supabase
        .from("blocked_users")
        .insert({
          blocker_id: profileId,
          blocked_id: targetProfileId,
          reason: reason || null,
        });

      if (blockError) throw blockError;

      // Update local state
      setBlockedUsers([
        {
          id: `temp-${Date.now()}`,
          blocked_id: targetProfileId,
          created_at: new Date().toISOString(),
          reason,
        },
        ...blockedUsers,
      ]);

      toast({
        title: "User Blocked",
        description: "You won't see this profile anymore",
      });

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to block user";
      setError(message);
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
      console.error("Error blocking user:", err);
      return false;
    }
  };

  // Unblock a user
  const unblockUser = async (blockId: string, targetProfileId: string) => {
    try {
      setError(null);

      const { error: unblockError } = await supabase
        .from("blocked_users")
        .delete()
        .eq("id", blockId);

      if (unblockError) throw unblockError;

      // Update local state
      setBlockedUsers(blockedUsers.filter((b) => b.id !== blockId));

      toast({
        title: "User Unblocked",
        description: "You can now see this profile again",
      });

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to unblock user";
      setError(message);
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
      console.error("Error unblocking user:", err);
      return false;
    }
  };

  // Auto-fetch blocked users on mount
  useEffect(() => {
    fetchBlockedUsers();
  }, []);

  return {
    blockedUsers,
    loading,
    error,
    blockUser,
    unblockUser,
    isUserBlocked,
    fetchBlockedUsers,
  };
};
