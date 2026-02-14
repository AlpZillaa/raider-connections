import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import Navigation from "@/components/Navigation";
import SwipeCard from "@/components/SwipeCard";
import BadgeSystem from "@/components/BadgeSystem";
import { PhotoVerification } from "@/components/PhotoVerification";
import BlockedUsersList from "@/components/BlockedUsersList";
import AdminDashboard from "@/pages/AdminDashboard";
import { PremiumStore } from "@/components/PremiumStore";
import { IcebreakerCard } from "@/components/IcebreakerCard";
import { ReferralInvite } from "@/components/ReferralInvite";
import { SOSButton } from "@/components/SOSButton";
import { InsightsDashboard } from "@/components/InsightsDashboard";
import { BadgeVerification } from "@/components/BadgeVerification";
import { useBadges } from "@/hooks/useBadges";
import { useProfiles, ProfileFilters } from "@/hooks/useProfiles";
import { useSwipes } from "@/hooks/useSwipes";
import { useMatches } from "@/hooks/useMatches";
import { useMessages } from "@/hooks/useMessages";
import { useEmailNotifications } from "@/hooks/useEmailNotifications";
import { useSubscription } from "@/hooks/useSubscription";
import { usePremiumFeatures } from "@/hooks/usePremiumFeatures";
import { useInsights } from "@/hooks/useInsights";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import RaiderRashLogo from "@/components/RaiderRashLogo";
import { ProfileCardSkeleton, MatchListSkeleton } from "@/components/SkeletonLoader";
import { Heart, MessageCircle, Settings, User, Filter, LogOut, Send, Sparkles, BarChart3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useActivity } from "@/hooks/useActivity";
import FilterPanel from "@/components/FilterPanel";
import { Onboarding } from "@/components/Onboarding";
import { useOnboarding } from "@/hooks/useOnboarding";

const MainApp = () => {
  const [activeTab, setActiveTab] = useState("discover");
  const [currentProfileIndex, setCurrentProfileIndex] = useState(0);
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<any>(null);
  const [selectedMatch, setSelectedMatch] = useState<any>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isInSettings, setIsInSettings] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showPremiumStore, setShowPremiumStore] = useState(false);
  const [showReferrals, setShowReferrals] = useState(false);
  const [showBadges, setShowBadges] = useState(false);
  const [showInsights, setShowInsights] = useState(false);
  const [editedName, setEditedName] = useState("Alex Rodriguez");
  const [editedAge, setEditedAge] = useState("20");
  const [editedMajor, setEditedMajor] = useState("Computer Science");
  const [editedYear, setEditedYear] = useState("Senior");
  const [chatMessage, setChatMessage] = useState("");
  const [messages, setMessages] = useState([
    { type: "other", text: "Hey! How's your semester going?", time: "2m ago" },
    { type: "user", text: "Great! Just finished my finals. How about you?", time: "1m ago" },
    { type: "other", text: "Same here! Want to celebrate at the Rec Center?", time: "Now" },
  ]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [onlineStatus, setOnlineStatus] = useState(true);
  const [showEmail, setShowEmail] = useState(false);
  const [blockedUsers, setBlockedUsers] = useState<string[]>([]);
  const [userPhotoVerified, setUserPhotoVerified] = useState(false);
  const [userProfileData, setUserProfileData] = useState<any>(null);
  const [hasVerificationAttempt, setHasVerificationAttempt] = useState(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const activity = useActivity();
  const { notifyMatch } = useEmailNotifications();
  const [filters, setFilters] = useState<ProfileFilters | undefined>(undefined);
  const { profiles, loading: profilesLoading, currentUserId, removeProfile, refetch } = useProfiles(filters);
  const { showOnboarding, completeOnboarding } = useOnboarding(currentUserId);
  const { subscription } = useSubscription(currentUserId);
  const { features } = usePremiumFeatures(currentUserId, subscription?.tier?.startsWith("premium"));
  const { incrementSwipes, incrementMatches } = useInsights(currentUserId);
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

  // Start/stop activity pinger based on session
  useEffect(() => {
    if (session) {
      activity.start();
    }

    return () => activity.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  // Check if user is admin by querying database
  useEffect(() => {
    if (!user?.id) return;

    const checkIfAdmin = async () => {
      try {
        const { data: profileData, error } = await supabase
          .from("profiles")
          .select("is_admin")
          .eq("id", user.id)
          .single();

        if (error) {
          console.error("Error fetching admin status:", error);
          return;
        }

        setIsAdmin(profileData?.is_admin || false);
      } catch (err) {
        console.error("Error checking admin status:", err);
      }
    };

    checkIfAdmin();
  }, [user?.id]);

  // Fetch user's profile data including verification status
  useEffect(() => {
    if (!currentUserId) return;

    const fetchUserProfile = async () => {
      try {
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", currentUserId)
          .single();

        if (profileError) {
          console.error("Error fetching user profile:", profileError);
          return;
        }

        if (profileData) {
          setUserProfileData(profileData);
          setUserPhotoVerified(profileData.photo_verified || false);

          // Check if user has any pending or approved verification attempts
          const { data: attempts, error: attemptsError } = await supabase
            .from("verification_attempts")
            .select("*")
            .eq("profile_id", currentUserId)
            .order("attempted_at", { ascending: false })
            .limit(1);

          if (!attemptsError && attempts && attempts.length > 0) {
            setHasVerificationAttempt(true);
          }
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
      }
    };

    fetchUserProfile();
  }, [currentUserId]);

  const handleSwipe = async (direction: "left" | "right") => {
    if (!currentUserId || !profiles[currentProfileIndex]) return;

    const currentProfile = profiles[currentProfileIndex];
    const isLike = direction === "right";

    // Save swipe to database
    await swipe(currentUserId, currentProfile.id, isLike);

    // If user swiped right (like), check if it's a match
    if (isLike) {
      try {
        // Check if the other user also liked this user (mutual match)
        const { data: reciprocalSwipe, error } = await supabase
          .from("swipes")
          .select("*")
          .eq("swiper_id", currentProfile.id)
          .eq("swiped_on_id", currentUserId)
          .eq("is_like", true)
          .single();

        // If mutual match found, send match notifications
        if (reciprocalSwipe && !error) {
          try {
            // Send email to current user
            await notifyMatch(
              user?.email || "noreply@raiderrash.com",
              userProfileData?.display_name || "Friend",
              currentProfile.display_name,
              currentProfile.profile_image_url || ""
            );

            // Send email to matched user
            await notifyMatch(
              currentProfile.email || "noreply@raiderrash.com",
              currentProfile.display_name,
              userProfileData?.display_name || "Friend",
              userProfileData?.profile_image_url || ""
            );
          } catch (emailErr) {
            console.error("Error sending match notification emails:", emailErr);
            // Don't fail the swipe if email fails
          }
        }
      } catch (err) {
        console.error("Error checking for match:", err);
      }
    }

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
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="w-5 h-5" />
        </Button>
      </div>
      {showFilters && (
        <div className="px-4 py-3">
          <FilterPanel
            filters={{
              minAge: filters?.minAge,
              maxAge: filters?.maxAge,
              major: filters?.major,
              year: filters?.year,
              interests: filters?.interests?.join(',') || '',
              query: filters?.query
            }}
            onChange={(next) => {
              const interests = next.interests ? next.interests.split(',').map(s => s.trim()).filter(Boolean) : [];
              const newFilters: ProfileFilters = {
                minAge: next.minAge,
                maxAge: next.maxAge,
                major: next.major,
                year: next.year,
                interests: interests.length > 0 ? (interests as string[]) : undefined,
                query: next.query
              };
              setFilters(newFilters);
            }}
            onClose={() => setShowFilters(false)}
          />
        </div>
      )}

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
                setSelectedMatch(match);
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

  const renderSettingsTab = () => {
    return (
      <div className="min-h-screen overflow-y-auto pb-20 bg-background">
        <div className="flex flex-col items-center p-6 space-y-4">
          {/* Header with Back Button */}
          <div className="w-full flex items-center mb-4">
            <Button 
              variant="ghost" 
              onClick={() => setIsInSettings(false)}
              className="text-primary font-semibold"
            >
              ← Back
            </Button>
            <h2 className="text-3xl font-black flex-1 text-center -ml-12 bg-gradient-primary bg-clip-text text-transparent">Settings</h2>
            <div className="w-12"></div>
          </div>

          {/* Notifications Card */}
          <Card className="w-full max-w-md border-0 shadow-light hover:shadow-medium transition-all">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-base">
                <span className="font-semibold">🔔 Notifications</span>
                <input 
                  type="checkbox" 
                  checked={notificationsEnabled}
                  onChange={(e) => setNotificationsEnabled(e.target.checked)}
                  className="w-5 h-5 cursor-pointer accent-primary rounded"
                />
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1">Get notified about matches and messages</p>
            </CardHeader>
          </Card>

          {/* Online Status Card */}
          <Card className="w-full max-w-md border-0 shadow-light hover:shadow-medium transition-all">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-base">
                <span className="font-semibold">🟢 Online Status</span>
                <input 
                  type="checkbox" 
                  checked={onlineStatus}
                  onChange={(e) => setOnlineStatus(e.target.checked)}
                  className="w-5 h-5 cursor-pointer accent-primary rounded"
                />
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1">Show when you're active</p>
            </CardHeader>
          </Card>

          {/* Email Visibility Card */}
          <Card className="w-full max-w-md border-0 shadow-light hover:shadow-medium transition-all">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-base">
                <span className="font-semibold">📧 Show Email</span>
                <input 
                  type="checkbox" 
                  checked={showEmail}
                  onChange={(e) => setShowEmail(e.target.checked)}
                  className="w-5 h-5 cursor-pointer accent-primary rounded"
                />
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1">Let matches see your email</p>
            </CardHeader>
          </Card>

          {/* Blocked Users Section */}
          <div className="w-full max-w-md">
            <h3 className="text-lg font-semibold mb-3">🚫 Blocked Users</h3>
            <BlockedUsersList />
          </div>

          {/* Account Section */}
          <Card className="w-full max-w-md border-0 shadow-light hover:shadow-medium transition-all">
            <CardHeader>
              <CardTitle className="text-base font-semibold">👤 Account</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground"><span className="font-semibold text-foreground">Email:</span> {user?.email}</p>
              <p className="text-sm text-muted-foreground"><span className="font-semibold text-foreground">Member since:</span> 2024</p>
            </CardContent>
          </Card>

          {/* Logout Button */}
          <Button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleLogout();
            }}
            variant="destructive"
            className="w-full max-w-md h-12 font-bold shadow-lg hover:shadow-xl"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>

          {/* Privacy Notice */}
          <p className="text-xs text-muted-foreground text-center max-w-md pt-4">
            🔒 We respect your privacy. Your settings are encrypted and secure.
          </p>
        </div>
      </div>
    );
  };

  const renderProfileTab = () => {
    if (isInSettings) {
      return renderSettingsTab();
    }

    const userData = {
      name: editedName,
      age: parseInt(editedAge),
      major: editedMajor, 
      year: editedYear,
    };

    const handleSaveProfile = () => {
      toast({
        title: "Profile Updated!",
        description: "Your profile has been saved successfully.",
      });
      setIsEditingProfile(false);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        toast({
          title: "Photo Added!",
          description: `${file.name} has been uploaded to your profile.`,
        });
      }
    };

    if (isEditingProfile) {
      return (
        <div className="min-h-screen overflow-y-auto pb-20 bg-background">
          <div className="flex flex-col items-center p-6 space-y-6">
            <h2 className="text-2xl font-bold">Edit Profile</h2>
            
            <div className="w-full max-w-md space-y-4">
              <div>
                <label className="text-sm font-medium">Name</label>
                <input 
                  type="text" 
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Age</label>
                  <input 
                    type="number" 
                    value={editedAge}
                    onChange={(e) => setEditedAge(e.target.value)}
                    className="w-full mt-1 px-3 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Year</label>
                  <select 
                    value={editedYear}
                    onChange={(e) => setEditedYear(e.target.value)}
                    className="w-full mt-1 px-3 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option>Freshman</option>
                    <option>Sophomore</option>
                    <option>Junior</option>
                    <option>Senior</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Major</label>
                <input 
                  type="text" 
                  value={editedMajor}
                  onChange={(e) => setEditedMajor(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={() => setIsEditingProfile(false)} variant="outline" className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleSaveProfile} className="flex-1">
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        </div>
      );
    }

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
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-black bg-gradient-primary bg-clip-text text-transparent">{userData.name}, {userData.age}</h1>
            <div className="w-7 h-7 rounded-full bg-gradient-primary flex items-center justify-center shadow-primary">
              <span className="text-white text-xs font-bold">✓</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-5 w-full max-w-md justify-center">
            <button
              type="button"
              className="flex flex-col items-center gap-2 py-3 touch-target cursor-pointer group transition-all duration-200"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsInSettings(true);
              }}
            >
              <div className="w-14 h-14 rounded-full bg-muted/60 group-hover:bg-muted transition-all flex items-center justify-center group-hover:shadow-lg">
                <Settings className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <span className="text-xs text-muted-foreground font-semibold group-hover:text-primary transition-colors">Settings</span>
            </button>

            <button
              type="button"
              className="flex flex-col items-center gap-2 py-3 touch-target cursor-pointer group transition-all duration-200"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                document.getElementById("fileUpload")?.click();
              }}
            >
              <input 
                id="fileUpload"
                type="file" 
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div className="w-18 h-18 rounded-full bg-gradient-primary shadow-lg shadow-primary flex items-center justify-center relative hover:shadow-xl transition-all group-hover:scale-105">
                <Heart className="w-8 h-8 text-white fill-white" />
                <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-white shadow-md flex items-center justify-center">
                  <span className="text-primary font-bold text-lg">+</span>
                </div>
              </div>
              <span className="text-xs text-white font-bold group-hover:text-primary transition-colors">Add Media</span>
            </button>

            <button
              type="button"
              className="flex flex-col items-center gap-2 py-3 touch-target cursor-pointer group transition-all duration-200"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsEditingProfile(true);
              }}
            >
              <div className="w-14 h-14 rounded-full bg-muted/60 group-hover:bg-muted transition-all flex items-center justify-center group-hover:shadow-lg">
                <User className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <span className="text-xs text-muted-foreground font-semibold group-hover:text-primary transition-colors">Edit Info</span>
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
            className="flex items-center gap-2 px-5 py-2.5 border border-destructive/50 rounded-full text-destructive hover:bg-destructive hover:text-white hover:border-destructive transition-all duration-200 touch-target cursor-pointer font-medium text-sm shadow-light hover:shadow-md"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>

          {/* Photo Tip Banner */}
          <div className="w-full max-w-md">
            <div className="gradient-primary rounded-2xl p-5 flex items-center justify-between shadow-primary">
              <p className="text-white font-semibold text-sm">
                📸 A great photo gets more likes
              </p>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  document.getElementById("fileUpload2")?.click();
                }}
                className="w-11 h-11 bg-white/20 hover:bg-white/30 text-white rounded-full flex items-center justify-center touch-target cursor-pointer transition-all duration-200 font-bold text-lg"
              >
                <input 
                  id="fileUpload2"
                  type="file" 
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                +
              </button>
            </div>
          </div>

          {/* Photo Verification Component */}
          <PhotoVerification
            userId={user?.id}
            profileId={currentUserId}
            isVerified={userPhotoVerified}
            hasAttempt={hasVerificationAttempt}
            onVerificationSubmitted={() => {
              setHasVerificationAttempt(true);
              toast({
                title: "Verification Submitted",
                description: "We're reviewing your photo. Check back soon!",
              });
            }}
          />

          {/* Display selected badges */}
          {getDisplayedBadges().length > 0 && (
            <Card className="w-full max-w-md border-0 shadow-light hover:shadow-medium transition-all">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg text-center bg-gradient-primary bg-clip-text text-transparent">My Badges</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3 justify-center">
                  {getDisplayedBadges().map(badge => (
                    <div key={badge.id} className="flex items-center gap-2 bg-primary/10 hover:bg-primary/20 rounded-full px-4 py-2 transition-all duration-200 border border-primary/20">
                      <img 
                        src={badge.icon} 
                        alt={badge.name}
                        className="w-5 h-5 object-contain"
                      />
                      <span className="text-xs font-bold text-primary">{badge.name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Get Premium Section */}
          <Card className="w-full max-w-md bg-gradient-premium border-0 shadow-lg hover:shadow-xl transition-all">
            <CardContent className="p-6 text-center space-y-3">
              <div className="text-5xl">⚡</div>
              <h3 className="text-2xl font-bold text-white">Get Raider Rash Premium</h3>
              <p className="text-white/85">See who likes you & get unlimited likes!</p>
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
                className="w-full h-12 bg-white text-primary hover:bg-white/90 rounded-full font-bold touch-target cursor-pointer transition-all duration-200 shadow-md hover:shadow-lg active:scale-95"
              >
                UPGRADE NOW
              </button>
            </CardContent>
          </Card>

          {/* Profile Stats */}
          <Card className="w-full max-w-md border-0 shadow-light hover:shadow-medium transition-all duration-200 bg-card">
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div className="text-center flex-1 border-r border-border/50">
                  <p className="text-3xl font-black text-primary">{matches.length}</p>
                  <p className="text-xs text-muted-foreground font-semibold mt-1">MATCHES</p>
                </div>
                <div className="text-center flex-1 border-r border-border/50">
                  <p className="text-3xl font-black text-primary">{userData.age}</p>
                  <p className="text-xs text-muted-foreground font-semibold mt-1">AGE</p>
                </div>
                <div className="text-center flex-1">
                  <p className="text-3xl font-black text-primary">{getDisplayedBadges().length}</p>
                  <p className="text-xs text-muted-foreground font-semibold mt-1">BADGES</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  const renderChatTab = () => {
    // Get messages for the selected match
    const { messages: dbMessages, loading: messagesLoading, sendMessage } = useMessages({
      matchId: selectedMatch?.id,
      currentUserId: currentUserId,
    });

    const handleSendMessage = async () => {
      if (!chatMessage.trim()) return;

      // Optimistic update
      const messageText = chatMessage;
      setChatMessage("");

      // Send to database
      const success = await sendMessage(messageText);
      
      if (!success) {
        toast({
          title: "Error",
          description: "Failed to send message. Please try again.",
          variant: "destructive",
        });
        setChatMessage(messageText);
      }
    };

    if (!selectedMatch) {
      return (
        <div className="min-h-screen flex items-center justify-center pb-20">
          <div className="text-center space-y-4">
            <div className="text-6xl">💬</div>
            <p className="text-muted-foreground">No chat selected</p>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen overflow-y-auto pb-20 bg-gradient-to-b from-background to-muted/20">
        {/* Chat Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-4 bg-card/95 backdrop-blur-md border-b border-border shadow-light">
          <Button 
            variant="ghost" 
            onClick={() => {
              setSelectedMatch(null);
              setActiveTab("matches");
            }}
            className="text-primary font-semibold"
          >
            ← Back
          </Button>
          <div className="flex-1 text-center">
            <h2 className="text-lg font-bold">{selectedMatch?.matchedProfile?.display_name || "Chat"}</h2>
            <p className="text-xs text-muted-foreground">
              {selectedMatch?.matchedProfile?.age && `${selectedMatch.matchedProfile.age} • `}
              Online
            </p>
          </div>
          <div className="w-10"></div>
        </div>
        
        {/* Messages Container */}
        <div className="space-y-3 px-4 py-6">
          {messagesLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : dbMessages.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <div className="text-5xl">👋</div>
              <p className="text-muted-foreground">Start a conversation!</p>
              <p className="text-xs text-muted-foreground">Send the first message to break the ice</p>
            </div>
          ) : (
            dbMessages.map((msg) => {
              const isOwnMessage = msg.sender_id === currentUserId;
              return (
                <div
                  key={msg.id}
                  className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-xs rounded-2xl px-4 py-2.5 shadow-light transition-all ${
                      isOwnMessage
                        ? "bg-gradient-primary text-white rounded-br-none"
                        : "bg-card border border-border rounded-bl-none"
                    }`}
                  >
                    <p className="text-sm break-words">{msg.content}</p>
                    <p
                      className={`text-xs mt-1 ${
                        isOwnMessage ? "text-white/70" : "text-muted-foreground"
                      }`}
                    >
                      {new Date(msg.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
        
        {/* Message Input */}
        <div className="fixed bottom-20 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent border-t border-border">
          <div className="flex gap-2 max-w-md mx-auto">
            <input 
              type="text" 
              placeholder="Type a message..." 
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              className="flex-1 px-4 py-2.5 bg-input border border-border rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
            />
            <Button 
              size="icon"
              className="rounded-full w-10 h-10 bg-gradient-primary hover:shadow-lg shadow-primary"
              onClick={handleSendMessage}
              disabled={!chatMessage.trim() || messagesLoading}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case "discover": return renderDiscoverTab();
      case "matches": return renderMatchesTab();
      case "badges": return renderBadgesTab();
      case "profile": return renderProfileTab();
      case "chat": return renderChatTab();
      case "admin": return isAdmin ? <AdminDashboard /> : renderDiscoverTab();
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
      {showOnboarding && (
        <Onboarding
          profileName={editedName || "Friend"}
          onComplete={completeOnboarding}
        />
      )}
      {renderContent()}
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} isAdmin={isAdmin} />
    </div>
  );
};

export default MainApp;