import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Profile {
  id: string;
  user_id: string;
  display_name: string;
  age: number | null;
  bio: string | null;
  profile_image_url: string | null;
  location: string | null;
  interests: string[] | null;
}

export type ProfileFilters = {
  minAge?: number;
  maxAge?: number;
  major?: string;
  year?: string;
  interests?: string[];
  query?: string; // name search
};

export const useProfiles = (filters?: ProfileFilters) => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    fetchProfiles(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filters)]);

  const fetchProfiles = async (appliedFilters?: ProfileFilters) => {
    try {
      setLoading(true);
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get current user's profile id
      const { data: currentProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!currentProfile) return;
      
      setCurrentUserId(currentProfile.id);

      // Get profiles that the user hasn't swiped on yet
      const { data: swipedIds } = await supabase
        .from('swipes')
        .select('swiped_id')
        .eq('swiper_id', currentProfile.id);

      const swipedProfileIds = swipedIds?.map(s => s.swiped_id) || [];

      // Get blocked users
      const { data: blockedIds } = await supabase
        .from('blocked_users')
        .select('blocked_id')
        .eq('blocker_id', currentProfile.id);

      const blockedProfileIds = blockedIds?.map(b => b.blocked_id) || [];

      // Combine all IDs to exclude
      const excludeIds = [...new Set([...swipedProfileIds, ...blockedProfileIds])];

      // Base query: verified profiles excluding current user
      let query = supabase
        .from('profiles')
        .select('*')
        .neq('id', currentProfile.id)
        .eq('photo_verified', true);

      // Exclude swiped/blocked
      if (excludeIds.length > 0) {
        query = query.not('id', 'in', `(${excludeIds.join(',')})`);
      }

      // Apply filters
      if (appliedFilters) {
        const { minAge, maxAge, major, year, interests, query: q } = appliedFilters;
        if (typeof minAge === 'number') query = query.gte('age', minAge);
        if (typeof maxAge === 'number') query = query.lte('age', maxAge);
        if (major && major.trim()) query = query.ilike('major', `%${major.trim()}%`);
        if (year && year.trim()) query = query.eq('year', year.trim());
        if (interests && interests.length > 0) {
          // profiles.interests is stored as text[] - use cs (contains) operator
          const interestsArray = interests.map((i) => `'${i.trim()}'`).join(',');
          query = query.filter('interests', 'cs', `{${interests.map(i => i.trim()).join(',')}}`);
        }
        if (q && q.trim()) query = query.ilike('display_name', `%${q.trim()}%`);
      }

      const { data, error } = await query.limit(40);

      if (error) throw error;
      setProfiles(data || []);
    } catch (error) {
      console.error('Error fetching profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeProfile = (profileId: string) => {
    setProfiles(prev => prev.filter(p => p.id !== profileId));
  };

  return { profiles, loading, currentUserId, removeProfile, refetch: fetchProfiles };
};
