import { Heart, MessageCircle, User, Trophy, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isAdmin?: boolean;
}

const Navigation = ({ activeTab, onTabChange, isAdmin = false }: NavigationProps) => {
  const tabs = [
    { id: "discover", icon: Heart, label: "Discover" },
    { id: "matches", icon: MessageCircle, label: "Matches" },
    { id: "badges", icon: Trophy, label: "Badges" },
    { id: "profile", icon: User, label: "Profile" },
    ...(isAdmin ? [{ id: "admin", icon: ShieldAlert, label: "Admin" }] : []),
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-background via-background to-background/80 backdrop-blur-xl border-t border-border/50 z-[9999] mobile-navigation shadow-2xl transition-all duration-300" style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}>
      <div className="flex justify-around items-center py-3 px-4 max-w-md mx-auto">
        {tabs.map(({ id, icon: Icon, label }) => (
          <Button
            key={id}
            variant="ghost"
            size="sm"
            className={`flex flex-col items-center gap-1.5 h-auto py-2 px-3 transition-all duration-300 relative group ${
              activeTab === id 
                ? "text-primary scale-110" 
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => onTabChange(id)}
          >
            {/* Animated background for active tab */}
            {activeTab === id && (
              <div className="absolute inset-0 opacity-10 bg-gradient-to-t from-primary to-primary rounded-2xl -z-10 transition-all duration-300"></div>
            )}
            
            <div className={`relative transition-all duration-300 ${activeTab === id ? "drop-shadow-lg" : ""}`}>
              <Icon className={`w-5 h-5 ${activeTab === id ? "animate-pulse" : ""}`} />
              
              {/* Active indicator dot */}
              {activeTab === id && (
                <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-primary transition-all duration-300 shadow-primary"></div>
              )}
            </div>
            
            <span className={`text-xs font-semibold transition-all duration-300 ${
              activeTab === id ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
            }`}>{label}</span>
          </Button>
        ))}
      </div>
    </nav>
  );
};

export default Navigation;