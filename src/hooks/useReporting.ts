import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Report {
  id: string;
  reported_id: string;
  category: string;
  description?: string;
  status: string;
  created_at: string;
}

export const useReporting = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

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

  const fetchMyReports = async () => {
    try {
      setLoading(true);
      const profileId = await getCurrentProfileId();
      if (!profileId) return;

      const { data, error: fetchError } = await supabase
        .from("profile_reports")
        .select("*")
        .eq("reporter_id", profileId)
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;
      setReports(data || []);
    } catch (err) {
      console.error("Error fetching reports:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch reports");
    } finally {
      setLoading(false);
    }
  };

  const reportUser = async (reportedProfileId: string, category: string, description?: string) => {
    try {
      setError(null);
      const reporterId = await getCurrentProfileId();
      if (!reporterId) throw new Error("Not authenticated");

      const { error: insertError } = await supabase
        .from("profile_reports")
        .insert({
          reporter_id: reporterId,
          reported_id: reportedProfileId,
          category,
          description: description || null,
        });

      if (insertError) throw insertError;

      toast({ title: "Report submitted", description: "Thanks — we'll review this profile." });
      // refresh local list
      fetchMyReports();
      return true;
    } catch (err) {
      console.error("Error submitting report:", err);
      setError(err instanceof Error ? err.message : "Failed to submit report");
      toast({ title: "Error", description: err instanceof Error ? err.message : "Failed to submit report", variant: "destructive" });
      return false;
    }
  };

  useEffect(() => {
    fetchMyReports();
  }, []);

  return { reports, loading, error, fetchMyReports, reportUser };
};

export default useReporting;
