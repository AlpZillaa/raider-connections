import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Match {
  id: string;
  matchedProfile: {
    id: string;
    display_name: string;
    profile_image_url: string | null;
    age: number | null;
    bio: string | null;
  };
  created_at: string;
}

export const useMatches = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMatches();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('matches-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'matches',
        },
        () => {
          fetchMatches();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get current user's profile
      const { data: currentProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!currentProfile) return;

      // Get blocked users
      const { data: blockedData } = await supabase
        .from('blocked_users')
        .select('blocked_id')
        .eq('blocker_id', currentProfile.id);

      const blockedIds = new Set(blockedData?.map(b => b.blocked_id) || []);

      // Fetch matches where user is either user1 or user2
      const { data, error } = await supabase
        .from('matches')
        .select(`
          id,
          created_at,
          user1_id,
          user2_id
        `)
        .or(`user1_id.eq.${currentProfile.id},user2_id.eq.${currentProfile.id}`);

      if (error) throw error;

      // For each match, fetch the other user's profile (excluding blocked users)
      const matchesWithProfiles = await Promise.all(
        (data || [])
          .filter(match => {
            const otherUserId = match.user1_id === currentProfile.id 
              ? match.user2_id 
              : match.user1_id;
            return !blockedIds.has(otherUserId);
          })
          .map(async (match) => {
            const otherUserId = match.user1_id === currentProfile.id 
              ? match.user2_id 
              : match.user1_id;

            const { data: profile } = await supabase
              .from('profiles')
              .select('id, display_name, profile_image_url, age, bio, last_active')
              .eq('id', otherUserId)
              .single();

            return {
              id: match.id,
              matchedProfile: profile || {
                id: otherUserId,
                display_name: 'Unknown',
                profile_image_url: null,
                age: null,
                bio: null,
              },
              created_at: match.created_at,
            };
          })
      );

      setMatches(matchesWithProfiles);
    } catch (error) {
      console.error('Error fetching matches:', error);
    } finally {
      setLoading(false);
    }
  };

  return { matches, loading, refetch: fetchMatches };
};
