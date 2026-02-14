import { useState, useEffect } from "react";
import { useAdminReports } from "@/hooks/useAdminReports";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle2, XCircle, TrendingUp, Users, ShieldAlert } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const AdminDashboard = () => {
  const { reports, loading, approveReport, rejectReport } = useAdminReports();
  const [statusFilter, setStatusFilter] = useState<"all" | "open" | "resolved" | "rejected">("open");
  const [stats, setStats] = useState({ totalUsers: 0, verifiedUsers: 0, bannedUsers: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Total users
        const { count: totalCount } = await supabase
          .from("profiles")
          .select("id", { count: "exact" });

        // Verified users
        const { count: verifiedCount } = await supabase
          .from("profiles")
          .select("id", { count: "exact" })
          .eq("photo_verified", true);

        // Banned users (not verified)
        const { count: bannedCount } = await supabase
          .from("profiles")
          .select("id", { count: "exact" })
          .eq("photo_verified", false);

        setStats({
          totalUsers: totalCount || 0,
          verifiedUsers: verifiedCount || 0,
          bannedUsers: (bannedCount || 0) - (verifiedCount || 0),
        });
      } catch (err) {
        console.error("Error fetching stats:", err);
      }
    };

    fetchStats();
  }, []);

  const filteredReports = reports.filter((r) => {
    if (statusFilter === "all") return true;
    return r.status === statusFilter;
  });

  const openCount = reports.filter((r) => r.status === "open").length;
  const resolvedCount = reports.filter((r) => r.status === "resolved").length;

  const openReports = filteredReports.filter((r) => r.status === "open");
  const reviewedReports = filteredReports.filter((r) => r.status !== "open");

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-black bg-gradient-primary bg-clip-text text-transparent">
            🛡️ Admin Dashboard
          </h1>
          <p className="text-muted-foreground">Moderate reports, manage users, review community health</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-0 shadow-light">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-sm font-medium">
                <span>Open Reports</span>
                <AlertCircle className="w-5 h-5 text-destructive" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-destructive">{openCount}</div>
              <p className="text-xs text-muted-foreground mt-1">Waiting for review</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-light">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-sm font-medium">
                <span>Resolved</span>
                <CheckCircle2 className="w-5 h-5 text-primary" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{resolvedCount}</div>
              <p className="text-xs text-muted-foreground mt-1">Approved reports</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-light">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-sm font-medium">
                <span>Active Users</span>
                <Users className="w-5 h-5 text-blue-500" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-500">{stats.verifiedUsers}</div>
              <p className="text-xs text-muted-foreground mt-1">Verified profiles</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-light">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-sm font-medium">
                <span>Banned</span>
                <ShieldAlert className="w-5 h-5 text-yellow-600" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">{stats.bannedUsers}</div>
              <p className="text-xs text-muted-foreground mt-1">Removed from discovery</p>
            </CardContent>
          </Card>
        </div>

        {/* Reports Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Community Reports</h2>
            <div className="flex gap-2">
              <Button
                variant={statusFilter === "open" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("open")}
              >
                Open ({openCount})
              </Button>
              <Button
                variant={statusFilter === "resolved" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("resolved")}
              >
                Resolved
              </Button>
              <Button
                variant={statusFilter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("all")}
              >
                All
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center p-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredReports.length === 0 ? (
            <Card className="border-0 shadow-light">
              <CardContent className="p-12 text-center text-muted-foreground">
                <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-muted opacity-50" />
                <p>No reports in this category. Community is clean! ✨</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {/* Open Reports - Prioritized */}
              {openReports.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-destructive">⚠️ NEEDS REVIEW ({openReports.length})</h3>
                  {openReports.map((report) => (
                    <Card key={report.id} className="border-destructive/20 shadow-light hover:shadow-medium transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 space-y-3">
                            <div className="flex items-center gap-3">
                              <Avatar className="w-8 h-8">
                                <AvatarImage src={report.reporter.profile_image_url} />
                                <AvatarFallback>{report.reporter.display_name[0]}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold">{report.reporter.display_name}</p>
                                <p className="text-xs text-muted-foreground">reported</p>
                              </div>
                              <Badge className="bg-destructive/10 text-destructive border-destructive/20">
                                {report.category}
                              </Badge>
                            </div>

                            <div className="flex items-center gap-3 bg-muted/50 p-3 rounded-lg">
                              <Avatar className="w-8 h-8">
                                <AvatarImage src={report.reported.profile_image_url} />
                                <AvatarFallback>{report.reported.display_name[0]}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm font-semibold">{report.reported.display_name}</p>
                              </div>
                            </div>

                            {report.description && (
                              <div className="bg-card border border-border rounded p-3">
                                <p className="text-sm text-foreground/80">{report.description}</p>
                              </div>
                            )}

                            <p className="text-xs text-muted-foreground">
                              {new Date(report.created_at).toLocaleDateString()} at{" "}
                              {new Date(report.created_at).toLocaleTimeString()}
                            </p>
                          </div>

                          <div className="flex gap-2 flex-shrink-0">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => rejectReport(report.id)}
                              className="hover:bg-muted"
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Reject
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => approveReport(report.id, report.reported.id)}
                              className="bg-destructive hover:bg-destructive/90"
                            >
                              <CheckCircle2 className="w-4 h-4 mr-1" />
                              Approve
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Reviewed Reports */}
              {reviewedReports.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-muted-foreground">✓ REVIEWED ({reviewedReports.length})</h3>
                  {reviewedReports.map((report) => (
                    <Card key={report.id} className="opacity-75">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-sm font-semibold">{report.reporter.display_name}</span>
                              <span className="text-xs text-muted-foreground">→</span>
                              <span className="text-sm font-semibold">{report.reported.display_name}</span>
                              <Badge variant="outline" className="text-xs">
                                {report.category}
                              </Badge>
                            </div>
                            <Badge variant={report.status === "resolved" ? "secondary" : "outline"}>
                              {report.status === "resolved" ? "✓ Approved" : "✗ Rejected"}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground text-right">
                            {new Date(report.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
