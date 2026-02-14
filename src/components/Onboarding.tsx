import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronRight, Heart, Camera, Filter, MessageCircle } from "lucide-react";

interface OnboardingProps {
  profileName: string;
  onComplete: () => void;
}

export const Onboarding = ({ profileName, onComplete }: OnboardingProps) => {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: "Welcome to RaiderRash! 🎉",
      description: "The dating app for Texas Tech students",
      subtitle: `Great to meet you, ${profileName}! Let's get you set up.`,
      icon: "🎓",
    },
    {
      title: "Complete Your Profile",
      description: "Add a bio, major, and interests so matches know you better",
      subtitle: "More info = more matches! 📝",
      icon: "✏️",
      action: "Go to Profile",
    },
    {
      title: "Verify Your Photo",
      description: "Verified profiles get 3x more matches and build trust",
      subtitle: "Takes 2 minutes, huge confidence boost ✓",
      icon: "📸",
      action: "Verify Now",
    },
    {
      title: "Ready to Discover?",
      description: "Swipe right on profiles you like, left to skip",
      subtitle: "When you match, start a conversation!",
      icon: "❤️",
    },
  ];

  const current = steps[step];
  const isLastStep = step === steps.length - 1;

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-background to-muted/20 z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Progress Indicator */}
        <div className="flex justify-center gap-2">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === step
                  ? "bg-gradient-primary w-8"
                  : i < step
                    ? "bg-primary w-6"
                    : "bg-muted w-6"
              }`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="text-center space-y-4">
          <div className="text-6xl">{current.icon}</div>
          <h2 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            {current.title}
          </h2>
          <p className="text-base text-foreground/80 leading-relaxed">
            {current.description}
          </p>
          <p className="text-sm text-muted-foreground">{current.subtitle}</p>
        </div>

        {/* Feature Cards (Step 0) */}
        {step === 0 && (
          <div className="space-y-2">
            <div className="p-4 bg-card border border-border rounded-xl flex items-start gap-3">
              <Heart className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div className="text-left">
                <p className="font-medium text-sm">Swipe & Match</p>
                <p className="text-xs text-muted-foreground">Find your perfect Raider</p>
              </div>
            </div>
            <div className="p-4 bg-card border border-border rounded-xl flex items-start gap-3">
              <MessageCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div className="text-left">
                <p className="font-medium text-sm">Chat Instantly</p>
                <p className="text-xs text-muted-foreground">Real-time messaging when you match</p>
              </div>
            </div>
            <div className="p-4 bg-card border border-border rounded-xl flex items-start gap-3">
              <Camera className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div className="text-left">
                <p className="font-medium text-sm">Verified Profiles</p>
                <p className="text-xs text-muted-foreground">Safe, verified community</p>
              </div>
            </div>
            <div className="p-4 bg-card border border-border rounded-xl flex items-start gap-3">
              <Filter className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div className="text-left">
                <p className="font-medium text-sm">Smart Filters</p>
                <p className="text-xs text-muted-foreground">Filter by major, year, interests</p>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          {step > 0 && (
            <Button
              variant="outline"
              onClick={() => setStep(step - 1)}
              className="flex-1"
            >
              Back
            </Button>
          )}
          <Button
            onClick={() => {
              if (isLastStep) {
                onComplete();
              } else {
                setStep(step + 1);
              }
            }}
            className="flex-1 bg-gradient-primary hover:shadow-lg shadow-primary"
          >
            {isLastStep ? "Let's Go! 🚀" : "Next"}
            {!isLastStep && <ChevronRight className="w-4 h-4 ml-2" />}
          </Button>
        </div>

        {/* Skip Link */}
        {step === 0 && (
          <button
            onClick={onComplete}
            className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Skip for now
          </button>
        )}
      </div>
    </div>
  );
};

export default Onboarding;
