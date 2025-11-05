import { Heart, MessageCircle, User, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Navigation = ({ activeTab, onTabChange }: NavigationProps) => {
  const tabs = [
    { id: "discover", icon: Heart, label: "Discover" },
    { id: "matches", icon: MessageCircle, label: "Matches" },
    { id: "badges", icon: Trophy, label: "Badges" },
    { id: "profile", icon: User, label: "Profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-md border-t border-border z-[9999] mobile-navigation" style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}>
      <div className="flex justify-around items-center py-2 px-4 max-w-md mx-auto">
        {tabs.map(({ id, icon: Icon, label }) => (
          <Button
            key={id}
            variant="ghost"
            size="sm"
            className={`flex flex-col items-center gap-1 h-auto py-2 px-3 transition-all ${
              activeTab === id 
                ? "text-primary" 
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => onTabChange(id)}
          >
            <Icon className={`w-5 h-5 ${activeTab === id ? "pulse-red" : ""}`} />
            <span className="text-xs font-medium">{label}</span>
          </Button>
        ))}
      </div>
    </nav>
  );
};

export default Navigation;