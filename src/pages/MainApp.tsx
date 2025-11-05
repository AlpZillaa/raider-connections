import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import Navigation from "@/components/Navigation";
import SwipeCard from "@/components/SwipeCard";
import BadgeSystem from "@/components/BadgeSystem";
import { useBadges } from "@/hooks/useBadges";
import { useProfiles } from "@/hooks/useProfiles";
import { useSwipes } from "@/hooks/useSwipes";
import { useMatches } from "@/hooks/useMatches";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import RaiderRashLogo from "@/components/RaiderRashLogo";
import { ProfileCardSkeleton, MatchListSkeleton } from "@/components/SkeletonLoader";
import { Heart, MessageCircle, Settings, User, Filter, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const MainApp = () => {
  const [activeTab, setActiveTab] = useState("discover");
  const [currentProfileIndex, setCurrentProfileIndex] = useState(0);
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<any>(null);
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profiles, loading: profilesLoading, currentUserId, removeProfile } = useProfiles();
  const { swipe } = useSwipes();
  const { matches, loading: matchesLoading } = useMatches();
  const { badges, toggleBadgeDisplay, getDisplayedBadges } = useBadges(matches.length);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (!currentSession) {
        navigate("/auth");
      }
    });

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (!currentSession) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSwipe = async (direction: "left" | "right") => {
    if (!currentUserId || !profiles[currentProfileIndex]) return;

    const currentProfile = profiles[currentProfileIndex];
    const isLike = direction === "right";

    // Save swipe to database
    await swipe(currentUserId, currentProfile.id, isLike);

    // Remove profile from list
    removeProfile(currentProfile.id);
    
    // Move to next profile (index stays same since we removed current)
    if (currentProfileIndex >= profiles.length - 1) {
      setCurrentProfileIndex(0);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Logged out",
      description: "See you next time!",
    });
    navigate("/landing");
  };

  const renderDiscoverTab = () => (
    <div className="flex flex-col min-h-screen overflow-y-auto pb-20">
      <div className="flex items-center justify-between w-full p-4">
        <RaiderRashLogo size="sm" />
        <h2 className="text-xl font-bold">Discover</h2>
        <Button variant="ghost" size="icon">
          <Filter className="w-5 h-5" />
        </Button>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        {profilesLoading ? (
          <ProfileCardSkeleton />
        ) : profiles[currentProfileIndex] ? (
          <SwipeCard 
            profile={{
              id: profiles[currentProfileIndex].id,
              name: profiles[currentProfileIndex].display_name,
              age: profiles[currentProfileIndex].age || 0,
              major: "Red Raider",
              year: "Student",
              bio: profiles[currentProfileIndex].bio || "Hey there! 👋",
              interests: profiles[currentProfileIndex].interests || [],
              images: [profiles[currentProfileIndex].profile_image_url || "https://picsum.photos/400/600?random=1"],
              distance: "Campus",
            }}
            onSwipe={handleSwipe}
          />
        ) : (
          <div className="text-center space-y-4">
            <div className="text-6xl">🎉</div>
            <h3 className="text-xl font-semibold">That's everyone for now!</h3>
            <p className="text-muted-foreground">Check back later for more Raiders</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderMatchesTab = () => (
    <div className="min-h-screen overflow-y-auto pb-20">
      <div className="flex items-center justify-between p-4 mb-6">
        <h2 className="text-2xl font-bold">Your Matches</h2>
        <Badge variant="secondary">{matches.length}</Badge>
      </div>
      
      <div className="space-y-4 px-4">
        {matchesLoading ? (
          <MatchListSkeleton />
        ) : matches.length === 0 ? (
          <div className="text-center py-12 space-y-2">
            <div className="text-4xl">💔</div>
            <h3 className="font-semibold">No matches yet</h3>
            <p className="text-sm text-muted-foreground">Start swiping to find your matches!</p>
          </div>
        ) : (
          matches.map((match) => (
            <Button
              key={match.id} 
              variant="ghost"
              className="w-full h-auto p-4 justify-start hover:bg-muted/50"
              onClick={() => {
                setActiveTab("chat");
              }}
            >
              <div className="flex items-center gap-4 w-full">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={match.matchedProfile.profile_image_url || undefined} />
                  <AvatarFallback className="text-lg">
                    {match.matchedProfile.display_name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-left">
                  <h3 className="font-semibold">{match.matchedProfile.display_name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {match.matchedProfile.age && `${match.matchedProfile.age} • `}
                    Start a conversation!
                  </p>
                </div>
                <MessageCircle className="w-5 h-5 text-muted-foreground" />
              </div>
            </Button>
          ))
        )}
      </div>
    </div>
  );

  const renderBadgesTab = () => (
    <BadgeSystem 
      badges={badges}
      currentMatches={matches.length}
      onToggleDisplay={toggleBadgeDisplay}
    />
  );

  const renderProfileTab = () => {
    const userData = {
      name: "Alex Rodriguez",
      age: 20,
      major: "Computer Science", 
      year: "Senior",
    };

    return (
      <div className="min-h-screen overflow-y-auto pb-20 bg-background">
        <div className="flex flex-col items-center p-6 space-y-6">
          {/* Large Profile Photo */}
          <div className="mt-8">
            <Avatar className="w-40 h-40 border-4 border-border shadow-lg">
              <AvatarImage src="/placeholder.svg" alt="Your profile" />
              <AvatarFallback className="text-4xl font-bold bg-primary text-primary-foreground">
                {userData.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Name and Age */}
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold">{userData.name}, {userData.age}</h1>
            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-primary text-xs">✓</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-6 w-full max-w-md justify-center">
            <button
              type="button"
              className="flex flex-col items-center gap-2 py-4 touch-target cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toast({
                  title: "Settings",
                  description: "Settings page coming soon!",
                });
              }}
            >
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-all">
                <Settings className="w-6 h-6 text-muted-foreground" />
              </div>
              <span className="text-xs text-muted-foreground uppercase">Settings</span>
            </button>

            <button
              type="button"
              className="flex flex-col items-center gap-2 py-4 touch-target cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toast({
                  title: "Add Media",
                  description: "Photo upload coming soon!",
                });
              }}
            >
              <div className="w-16 h-16 rounded-full bg-primary shadow-lg flex items-center justify-center relative hover:bg-primary/90 transition-all">
                <Heart className="w-7 h-7 text-white fill-white" />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white shadow-md flex items-center justify-center">
                  <span className="text-primary font-bold text-lg">+</span>
                </div>
              </div>
              <span className="text-xs text-white uppercase font-semibold">Add Media</span>
            </button>

            <button
              type="button"
              className="flex flex-col items-center gap-2 py-4 touch-target cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toast({
                  title: "Edit Profile",
                  description: "Profile editing coming soon!",
                });
              }}
            >
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-all">
                <User className="w-6 h-6 text-muted-foreground" />
              </div>
              <span className="text-xs text-muted-foreground uppercase">Edit Info</span>
            </button>
          </div>

          {/* Logout Button */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleLogout();
            }}
            className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-muted-foreground hover:bg-muted/50 transition-all touch-target cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>

          {/* Photo Tip Banner */}
          <div className="w-full max-w-md">
            <div className="gradient-primary rounded-2xl p-4 flex items-center justify-between shadow-md">
              <p className="text-white font-medium">
                Photo Tip: A smile should get their attention
              </p>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toast({
                    title: "Add Photos",
                    description: "Photo upload feature coming soon!",
                  });
                }}
                className="w-10 h-10 bg-white/20 hover:bg-white/30 text-white rounded-full flex items-center justify-center touch-target cursor-pointer transition-all"
              >
                <span className="text-xl">+</span>
              </button>
            </div>
          </div>

          {/* Display selected badges */}
          {getDisplayedBadges().length > 0 && (
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle className="text-lg">My Infections</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {getDisplayedBadges().map(badge => (
                    <div key={badge.id} className="flex items-center gap-2 bg-primary/10 rounded-full px-3 py-1">
                      <img 
                        src={badge.icon} 
                        alt={badge.name}
                        className="w-4 h-4 object-contain"
                      />
                      <span className="text-sm font-medium text-primary">{badge.name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Get Premium Section */}
          <Card className="w-full max-w-md bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="p-6 text-center space-y-3">
              <div className="text-4xl">🔥</div>
              <h3 className="text-xl font-bold">Get Raider Rash Premium</h3>
              <p className="text-muted-foreground">See who Likes You & more!</p>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toast({
                    title: "Premium Coming Soon!",
                    description: "Premium features will be available soon!",
                  });
                }}
                className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg font-semibold touch-target cursor-pointer transition-all"
              >
                GET PREMIUM
              </button>
            </CardContent>
          </Card>

          {/* Profile Stats */}
          <Card className="w-full max-w-md">
            <CardContent className="p-6">
              <div className="flex justify-around">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{matches.length}</p>
                  <p className="text-sm text-muted-foreground">Matches</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{userData.age}</p>
                  <p className="text-sm text-muted-foreground">Age</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{getDisplayedBadges().length}</p>
                  <p className="text-sm text-muted-foreground">Badges</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  const renderChatTab = () => (
    <div className="min-h-screen overflow-y-auto pb-20">
      <div className="flex items-center justify-between p-4 mb-6 border-b">
        <Button 
          variant="ghost" 
          onClick={() => setActiveTab("matches")}
          className="text-primary"
        >
          ← Back to Matches
        </Button>
        <h2 className="text-xl font-bold">Chat</h2>
        <div></div>
      </div>
      
      <div className="space-y-4 px-4">
        <div className="bg-muted/50 rounded-lg p-4 max-w-xs">
          <p className="text-sm">Hey! How's your semester going?</p>
          <p className="text-xs text-muted-foreground mt-1">2m ago</p>
        </div>
        <div className="bg-primary/10 rounded-lg p-4 max-w-xs ml-auto">
          <p className="text-sm">Great! Just finished my finals. How about you?</p>
          <p className="text-xs text-muted-foreground mt-1">1m ago</p>
        </div>
        <div className="bg-muted/50 rounded-lg p-4 max-w-xs">
          <p className="text-sm">Same here! Want to celebrate at the Rec Center?</p>
          <p className="text-xs text-muted-foreground mt-1">Now</p>
        </div>
      </div>
      
      <div className="fixed bottom-20 left-0 right-0 p-4 bg-background/95 backdrop-blur-sm border-t">
        <div className="flex gap-2 max-w-md mx-auto">
          <input 
            type="text" 
            placeholder="Type a message..." 
            className="flex-1 px-4 py-2 bg-input rounded-full border border-border focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <Button size="sm" className="rounded-full px-6">
            Send
          </Button>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "discover": return renderDiscoverTab();
      case "matches": return renderMatchesTab();
      case "badges": return renderBadgesTab();
      case "profile": return renderProfileTab();
      case "chat": return renderChatTab();
      default: return renderDiscoverTab();
    }
  };

  if (!session || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {renderContent()}
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default MainApp;