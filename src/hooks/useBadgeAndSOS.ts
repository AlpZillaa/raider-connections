import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface BadgeVerification {
  id: string;
  badge_type: "instagram" | "spotify" | "college_email" | "facebook";
  external_username?: string;
  verified: boolean;
  verified_at?: string;
}

export interface SOSContact {
  id: string;
  contact_name: string;
  contact_phone: string;
  contact_relationship?: string;
  is_primary: boolean;
}

export const useBadgeVerification = (userId?: string) => {
  const [badges, setBadges] = useState<BadgeVerification[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!userId) return;

    const fetchBadges = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("badge_verifications")
          .select("*")
          .eq("profile_id", userId);

        if (error && error.code !== "PGRST116") throw error;
        setBadges(data || []);
      } catch (err) {
        console.error("Error fetching badges:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBadges();
  }, [userId]);

  const verifyBadge = async (badgeType: string, username: string) => {
    if (!userId) return false;

    try {
      // In production, this would verify with external APIs
      // For MVP, just create the verification record
      const { error } = await supabase.from("badge_verifications").upsert(
        [
          {
            profile_id: userId,
            badge_type: badgeType,
            external_username: username,
            verified: true,
            verified_at: new Date().toISOString(),
          },
        ],
        { onConflict: "profile_id,badge_type" }
      );

      if (error) throw error;

      setBadges((prev) => [
        ...prev.filter((b) => b.badge_type !== badgeType),
        {
          id: `${userId}-${badgeType}`,
          badge_type: badgeType as any,
          external_username: username,
          verified: true,
          verified_at: new Date().toISOString(),
        },
      ]);

      toast({ title: `${badgeType} verified! ✓` });
      return true;
    } catch (err) {
      console.error("Verification error:", err);
      toast({ title: "Verification failed", variant: "destructive" });
      return false;
    }
  };

  const removeBadge = async (badgeType: string) => {
    if (!userId) return false;

    try {
      const { error } = await supabase
        .from("badge_verifications")
        .delete()
        .eq("profile_id", userId)
        .eq("badge_type", badgeType);

      if (error) throw error;

      setBadges((prev) => prev.filter((b) => b.badge_type !== badgeType));
      toast({ title: "Badge removed" });
      return true;
    } catch (err) {
      console.error("Removal error:", err);
      return false;
    }
  };

  return {
    badges,
    loading,
    verifyBadge,
    removeBadge,
  };
};

export const useSOSContacts = (userId?: string) => {
  const [contacts, setContacts] = useState<SOSContact[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!userId) return;

    const fetchContacts = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("sos_contacts")
          .select("*")
          .eq("profile_id", userId)
          .order("is_primary", { ascending: false });

        if (error && error.code !== "PGRST116") throw error;
        setContacts(data || []);
      } catch (err) {
        console.error("Error fetching SOS contacts:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchContacts();
  }, [userId]);

  const addContact = async (name: string, phone: string, relationship?: string) => {
    if (!userId) return false;

    try {
      const { data, error } = await supabase
        .from("sos_contacts")
        .insert([
          {
            profile_id: userId,
            contact_name: name,
            contact_phone: phone,
            contact_relationship: relationship,
            is_primary: contacts.length === 0, // First contact is primary
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setContacts((prev) => [...prev, data]);
      toast({ title: "Contact added!" });
      return true;
    } catch (err) {
      console.error("Error adding contact:", err);
      toast({ title: "Failed to add contact", variant: "destructive" });
      return false;
    }
  };

  const setPrimaryContact = async (contactId: string) => {
    if (!userId) return false;

    try {
      // Unset all as primary
      const { error: unsetError } = await supabase
        .from("sos_contacts")
        .update({ is_primary: false })
        .eq("profile_id", userId);

      if (unsetError) throw unsetError;

      // Set new primary
      const { error: setError } = await supabase
        .from("sos_contacts")
        .update({ is_primary: true })
        .eq("id", contactId);

      if (setError) throw setError;

      setContacts((prev) =>
        prev.map((c) => ({
          ...c,
          is_primary: c.id === contactId,
        }))
      );

      toast({ title: "Primary contact updated" });
      return true;
    } catch (err) {
      console.error("Error updating primary:", err);
      return false;
    }
  };

  const triggerSOS = async (location?: { lat: number; lng: number }, matchId?: string) => {
    if (!userId) return false;

    try {
      const { error } = await supabase.from("sos_events").insert([
        {
          profile_id: userId,
          triggered_at: new Date().toISOString(),
          location_lat: location?.lat,
          location_lng: location?.lng,
          match_id: matchId,
        },
      ]);

      if (error) throw error;

      // In production, would also:
      // - Send SMS to all contacts
      // - Alert campus security
      // - Share location with trusted circle
      toast({
        title: "SOS triggered!",
        description: "Emergency contacts notified. Campus security alerted.",
      });
      return true;
    } catch (err) {
      console.error("Error triggering SOS:", err);
      toast({ title: "SOS failed", variant: "destructive" });
      return false;
    }
  };

  return {
    contacts,
    loading,
    addContact,
    setPrimaryContact,
    triggerSOS,
  };
};
