import { useInsights } from "@/hooks/useInsights";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, MessageCircle, Zap, TrendingUp } from "lucide-react";

interface InsightsDashboardProps {
  userId?: string;
}

export const InsightsDashboard = ({ userId }: InsightsDashboardProps) => {
  const { insights, loading } = useInsights(userId);

  if (loading) {
    return (
      <div className="space-y-4 p-6">
        <div className="h-20 bg-muted rounded-lg animate-pulse"></div>
        <div className="h-20 bg-muted rounded-lg animate-pulse"></div>
      </div>
    );
  }

  if (!insights) {
    return (
      <Card className="border-0 shadow-light">
        <CardContent className="p-8 text-center text-muted-foreground">
          <p>No insights yet. Start swiping to see your stats!</p>
        </CardContent>
      </Card>
    );
  }

  const stats = [
    {
      label: "Total Swipes",
      value: insights.total_swipes,
      icon: Zap,
      color: "text-yellow-600",
      bg: "bg-yellow-100 dark:bg-yellow-900/20",
    },
    {
      label: "Matches",
      value: insights.total_matches,
      icon: Heart,
      color: "text-red-600",
      bg: "bg-red-100 dark:bg-red-900/20",
    },
    {
      label: "Messages Sent",
      value: insights.messages_sent,
      icon: MessageCircle,
      color: "text-blue-600",
      bg: "bg-blue-100 dark:bg-blue-900/20",
    },
    {
      label: "Match Rate",
      value: `${(insights.match_rate * 100).toFixed(1)}%`,
      icon: TrendingUp,
      color: "text-green-600",
      bg: "bg-green-100 dark:bg-green-900/20",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Month/Year indicator */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          {new Date(insights.year, insights.month - 1, 1).toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          })}
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="border-0 shadow-light">
              <CardContent className="p-4 space-y-2">
                <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Detailed metrics */}
      <Card className="border-0 shadow-light">
        <CardHeader>
          <CardTitle className="text-base">Detailed Metrics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Profile Views</span>
            <span className="font-semibold">{insights.profile_views}</span>
          </div>
          <div className="flex justify-between items-center border-t border-border pt-4">
            <span className="text-sm text-muted-foreground">Messages Received</span>
            <span className="font-semibold">{insights.messages_received}</span>
          </div>
          <div className="flex justify-between items-center border-t border-border pt-4">
            <span className="text-sm text-muted-foreground">Response Rate</span>
            <span className="font-semibold">
              {(insights.response_rate * 100).toFixed(1)}%
            </span>
          </div>
          {insights.most_active_day && (
            <>
              <div className="flex justify-between items-center border-t border-border pt-4">
                <span className="text-sm text-muted-foreground">Most Active Day</span>
                <span className="font-semibold">{insights.most_active_day}</span>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Tips */}
      <Card className="border-0 shadow-light bg-card/50">
        <CardHeader>
          <CardTitle className="text-base">💡 Tips to Improve</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-foreground/80">
          {insights.match_rate < 0.1 && (
            <p>
              • Try updating your profile photos or bio. Better profiles get more matches!
            </p>
          )}
          {insights.response_rate < 0.5 && (
            <p>• Check your messages! More responses lead to more connections.</p>
          )}
          {insights.total_swipes < 10 && (
            <p>• Spend more time swiping to increase your chances of finding matches.</p>
          )}
          <p>• Use icebreaker prompts to start conversations that stand out.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default InsightsDashboard;
