import { useState, useCallback } from "react";
import { MapPin, GraduationCap, X, Heart, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface SwipeCardProps {
  profile: {
    id: string;
    name: string;
    age: number;
    major: string;
    year: string;
    bio: string;
    interests: string[];
    images: string[];
    distance?: string;
    last_active?: string | null;
  };
  onSwipe: (direction: "left" | "right") => void;
}

const SwipeCard = ({ profile, onSwipe }: SwipeCardProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState<boolean | null>(null);

  const handleSwipe = useCallback((direction: "left" | "right") => {
    setIsLiked(direction === "right");
    setTimeout(() => {
      onSwipe(direction);
      setIsLiked(null);
      setCurrentImageIndex(0);
    }, 300);
  }, [onSwipe]);

  return (
    <div className={`swipe-card w-full max-w-sm mx-auto transform transition-all duration-300 no-select ${
      isLiked === true ? "scale-105 rotate-6 opacity-75" : 
      isLiked === false ? "scale-105 -rotate-6 opacity-75" : ""
    }`}>
      {/* Image Section */}
      <div className="relative h-96 bg-muted overflow-hidden">
        {profile.images[currentImageIndex] ? (
          <img 
            src={profile.images[currentImageIndex]} 
            alt={profile.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-dark">
            <span className="text-muted-foreground text-6xl">📸</span>
          </div>
        )}
        
        {/* Gradient overlay at bottom for text readability */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/60 to-transparent"></div>
        
        {/* Image indicators - clickable for navigation */}
        {profile.images.length > 1 && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 flex gap-1.5 px-4">
            {profile.images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`rounded-full transition-all cursor-pointer backdrop-blur-sm ${
                  index === currentImageIndex ? "bg-white/90 w-8 h-1" : "bg-white/40 w-6 h-1 hover:bg-white/60"
                }`}
              />
            ))}
          </div>
        )}

        {/* Verification Badge */}
        <div className="absolute top-4 right-4 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full p-1.5 shadow-lg backdrop-blur-sm">
          <CheckCircle2 className="w-5 h-5 text-white fill-white" />
        </div>

        {/* Image navigation arrows */}
        {profile.images.length > 1 && (
          <>
            <button
              onClick={() => setCurrentImageIndex((prev) => (prev - 1 + profile.images.length) % profile.images.length)}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-9 h-9 bg-black/40 hover:bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all duration-200"
            >
              ‹
            </button>
            <button
              onClick={() => setCurrentImageIndex((prev) => (prev + 1) % profile.images.length)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 w-9 h-9 bg-black/40 hover:bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all duration-200"
            >
              ›
            </button>
          </>
        )}

        {/* Swipe overlay */}
        {isLiked !== null && (
          <div className={`absolute inset-0 flex items-center justify-center backdrop-blur-sm transition-all duration-300 ${
            isLiked ? "bg-primary/30" : "bg-red-500/30"
          }`}>
            <div className={`transition-all duration-300 ${isLiked ? "text-green-400 text-5xl font-bold" : "text-red-400 text-5xl font-bold"}`}>
              {isLiked ? "♥" : "✕"}
            </div>
          </div>
        )}

        {/* Bottom info gradient section */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-bold">{profile.name}</h3>
            <span className="text-lg font-semibold text-white/80">{profile.age}</span>
          </div>
          {profile.last_active && (
            <div className="text-sm text-white/80 mt-1">
              {(() => {
                const diff = Date.now() - new Date(profile.last_active).getTime();
                if (diff < 60000) return "Online";
                if (diff < 3600000) return `${Math.round(diff / 60000)}m ago`;
                if (diff < 86400000) return `${Math.round(diff / 3600000)}h ago`;
                return `${Math.round(diff / 86400000)}d ago`;
              })()}
            </div>
          )}
          {profile.distance && (
            <div className="flex items-center gap-1 text-white/90 mt-2 text-sm">
              <MapPin className="w-4 h-4" />
              <span>{profile.distance}</span>
            </div>
          )}
        </div>
      </div>

      {/* Profile Info */}
      <div className="p-5 space-y-4 bg-card border-t border-border/50">
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <GraduationCap className="w-4 h-4" />
          <span className="font-medium">{profile.major}</span>
          <span className="text-muted-foreground">•</span>
          <span className="font-medium">{profile.year}</span>
        </div>

        {profile.bio && (
          <p className="text-foreground/85 text-sm leading-relaxed line-clamp-3">{profile.bio}</p>
        )}

        {/* Interests */}
        {profile.interests.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {profile.interests.slice(0, 5).map((interest) => (
              <Badge key={interest} variant="secondary" className="text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-all">
                {interest}
              </Badge>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-center gap-6 pt-6">
          <Button
            variant="outline"
            size="icon"
            className="w-16 h-16 rounded-full border-2 border-muted-foreground/50 hover:border-destructive hover:bg-destructive/5 transition-all duration-200 touch-target shadow-lg hover:shadow-md"
            onClick={() => handleSwipe("left")}
          >
            <X className="w-6 h-6 text-muted-foreground hover:text-destructive transition-colors" />
          </Button>
          
          <Button
            size="icon"
            className="w-16 h-16 rounded-full bg-gradient-primary hover:shadow-lg shadow-primary text-white font-bold touch-target transition-all duration-200 hover:scale-110"
            onClick={() => handleSwipe("right")}
          >
            <Heart className="w-6 h-6 fill-current" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SwipeCard;