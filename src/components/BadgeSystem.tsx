import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Trophy, Lock } from "lucide-react";

export interface MatchBadge {
  id: string;
  name: string;
  description: string;
  requiredMatches: number;
  tier: "bronze" | "silver" | "gold" | "platinum" | "diamond" | "legendary" | "mythic";
  unlocked: boolean;
  displayOnProfile: boolean;
  icon: string;
}

interface BadgeSystemProps {
  badges: MatchBadge[];
  currentMatches: number;
  onToggleDisplay: (badgeId: string) => void;
}

const tierColors = {
  bronze: "bg-orange-600 text-orange-100",
  silver: "bg-gray-400 text-gray-900", 
  gold: "bg-yellow-500 text-yellow-900",
  platinum: "bg-purple-600 text-purple-100",
  diamond: "bg-blue-600 text-blue-100",
  legendary: "bg-red-600 text-red-100",
  mythic: "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
};

const BadgeSystem = ({ badges, currentMatches, onToggleDisplay }: BadgeSystemProps) => {
  return (
    <div className="min-h-screen overflow-y-auto pb-20 bg-background">
      <div className="space-y-6 p-4">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-primary">Achievement Collection</h2>
          <p className="text-muted-foreground">Match Count: {currentMatches}</p>
        </div>

        <div className="grid gap-4">
        {badges.map((badge) => (
          <Card key={badge.id} className={`${badge.unlocked ? "" : "opacity-60"}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  {badge.unlocked ? (
                    <img 
                      src={badge.icon} 
                      alt={badge.name}
                      className="w-8 h-8 object-contain"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                      <Lock className="w-4 h-4 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div>
                  <CardTitle className="text-lg">{badge.name}</CardTitle>
                  <CardDescription>{badge.description}</CardDescription>
                </div>
              </div>
                <Badge className={tierColors[badge.tier]}>
                  {badge.tier.toUpperCase()}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  {badge.unlocked ? "Unlocked!" : `${badge.requiredMatches} matches required`}
                </div>
                
                {badge.unlocked && (
                  <div className="flex items-center space-x-2">
                    <Switch
                      id={`display-${badge.id}`}
                      checked={badge.displayOnProfile}
                      onCheckedChange={() => onToggleDisplay(badge.id)}
                    />
                    <Label htmlFor={`display-${badge.id}`} className="text-sm">
                      Show on Profile
                    </Label>
                  </div>
                )}
              </div>
              
              {!badge.unlocked && (
                <div className="mt-2">
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ 
                        width: `${Math.min((currentMatches / badge.requiredMatches) * 100, 100)}%` 
                      }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {Math.max(0, badge.requiredMatches - currentMatches)} matches to go
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        </div>
      </div>
    </div>
  );
};

export default BadgeSystem;