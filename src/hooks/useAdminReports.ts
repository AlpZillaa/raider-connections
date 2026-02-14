import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface ReportWithProfiles {
  id: string;
  category: string;
  description?: string;
  status: string;
  created_at: string;
  reporter: {
    id: string;
    display_name: string;
    profile_image_url?: string;
  };
  reported: {
    id: string;
    display_name: string;
    profile_image_url?: string;
  };
  reportCount?: number; // total reports on this user
}

export const useAdminReports = () => {
  const [reports, setReports] = useState<ReportWithProfiles[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all reports with related profile info
      const { data, error: fetchError } = await supabase
        .from("profile_reports")
        .select(`
          id,
          category,
          description,
          status,
          created_at,
          reporter_id,
          reported_id
        `)
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;

      // Enrich with profile data for each report
      const enriched = await Promise.all(
        (data || []).map(async (report) => {
          const [reporterData, reportedData] = await Promise.all([
            supabase
              .from("profiles")
              .select("id, display_name, profile_image_url")
              .eq("id", report.reporter_id)
              .single(),
            supabase
              .from("profiles")
              .select("id, display_name, profile_image_url")
              .eq("id", report.reported_id)
              .single(),
            // Count total approved reports on this user
            supabase
              .from("profile_reports")
              .select("id", { count: "exact" })
              .eq("reported_id", report.reported_id)
              .eq("status", "resolved"),
          ]);

          return {
            id: report.id,
            category: report.category,
            description: report.description,
            status: report.status,
            created_at: report.created_at,
            reporter: reporterData.data || { id: "", display_name: "Unknown" },
            reported: reportedData.data || { id: "", display_name: "Unknown" },
            reportCount: 0,
          };
        })
      );

      setReports(enriched);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to fetch reports";
      setError(msg);
      console.error("Error fetching reports:", err);
    } finally {
      setLoading(false);
    }
  };

  const approveReport = async (reportId: string, reportedProfileId: string) => {
    try {
      // Get count of approved reports for this user
      const { count } = await supabase
        .from("profile_reports")
        .select("id", { count: "exact" })
        .eq("reported_id", reportedProfileId)
        .eq("status", "resolved");

      const approvedCount = (count || 0) + 1;

      // Update report status
      const { error: updateError } = await supabase
        .from("profile_reports")
        .update({ status: "resolved" })
        .eq("id", reportId);

      if (updateError) throw updateError;

      // If 3+ approved reports, auto-ban by setting photo_verified to false
      if (approvedCount >= 3) {
        await supabase
          .from("profiles")
          .update({ photo_verified: false })
          .eq("id", reportedProfileId);

        toast({
          title: "User Banned",
          description: "This user has been removed from discovery after 3+ approved reports.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Report Approved",
          description: `${approvedCount}/3 approved reports for this user.`,
        });
      }

      // Refresh reports list
      fetchReports();
    } catch (err) {
      console.error("Error approving report:", err);
      toast({
        title: "Error",
        description: "Failed to approve report",
        variant: "destructive",
      });
    }
  };

  const rejectReport = async (reportId: string) => {
    try {
      const { error } = await supabase
        .from("profile_reports")
        .update({ status: "rejected" })
        .eq("id", reportId);

      if (error) throw error;

      toast({ title: "Report Rejected" });
      fetchReports();
    } catch (err) {
      console.error("Error rejecting report:", err);
      toast({
        title: "Error",
        description: "Failed to reject report",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  return { reports, loading, error, approveReport, rejectReport, refetch: fetchReports };
};

export default useAdminReports;
