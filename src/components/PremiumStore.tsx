import { useSubscription } from "@/hooks/useSubscription";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Heart, Eye, X } from "lucide-react";

interface PremiumStoreProps {
  userId?: string;
  onClose?: () => void;
}

export const PremiumStore = ({ userId, onClose }: PremiumStoreProps) => {
  const { subscription, isPremium, upgradeToPremium, cancelSubscription } = useSubscription(userId);

  const plans = [
    {
      name: "Free",
      price: "$0/mo",
      features: [
        { icon: Heart, text: "10 swipes/day", included: true },
        { icon: Eye, text: "See who liked you", included: false },
        { icon: Star, text: "Super likes", included: false },
      ],
      tier: "free",
      cta: "Current Plan",
      ctaVariant: "outline",
    },
    {
      name: "Premium",
      price: "$4.99/mo",
      features: [
        { icon: Heart, text: "Unlimited swipes", included: true },
        { icon: Eye, text: "See who liked you (3x/mo)", included: true },
        { icon: Star, text: "5 Super likes/mo", included: true },
      ],
      tier: "premium",
      badge: "Most Popular",
      cta: "Upgrade Now",
      ctaVariant: "default",
    },
    {
      name: "Premium+",
      price: "$9.99/mo",
      features: [
        { icon: Heart, text: "Unlimited swipes", included: true },
        { icon: Eye, text: "See who liked you (unlimited)", included: true },
        { icon: Star, text: "20 Super likes/mo + Rewind", included: true },
      ],
      tier: "premium_plus",
      badge: "Best Value",
      cta: "Upgrade Now",
      ctaVariant: "default",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-xl border-b border-border p-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-black bg-gradient-primary bg-clip-text text-transparent">
            Unlock Premium
          </h1>
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          )}
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-6 space-y-8">
        {/* Value proposition */}
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold">Find Your Perfect Match</h2>
          <p className="text-muted-foreground">
            Unlock powerful features to maximize your connections
          </p>
        </div>

        {/* Plans comparison */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map((plan) => (
            <Card
              key={plan.tier}
              className={`relative border-0 transition-all ${
                subscription?.tier === plan.tier
                  ? "shadow-lg border-2 border-primary"
                  : "shadow-light hover:shadow-medium"
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 right-4">
                  <Badge className="bg-gradient-primary text-white">{plan.badge}</Badge>
                </div>
              )}

              <CardHeader>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <div className="text-4xl font-black text-primary mt-4">{plan.price}</div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Features list */}
                <ul className="space-y-3">
                  {plan.features.map((feature, idx) => {
                    const Icon = feature.icon;
                    return (
                      <li
                        key={idx}
                        className={`flex items-center gap-3 ${
                          feature.included ? "text-foreground" : "text-muted-foreground"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="text-sm">{feature.text}</span>
                      </li>
                    );
                  })}
                </ul>

                {/* CTA Button */}
                <Button
                  variant={plan.ctaVariant as any}
                  className="w-full"
                  disabled={subscription?.tier === plan.tier}
                  onClick={() => {
                    if (subscription?.tier === plan.tier) {
                      cancelSubscription();
                    } else {
                      upgradeToPremium(plan.tier as any);
                    }
                  }}
                >
                  {subscription?.tier === plan.tier ? "Current Plan" : plan.cta}
                </Button>

                {plan.tier !== "free" && (
                  <p className="text-xs text-center text-muted-foreground">
                    Cancel anytime. No commitment.
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Benefits section */}
        <Card className="border-0 shadow-light bg-card/50">
          <CardHeader>
            <CardTitle>Why go Premium?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-foreground/80">
            <div className="flex gap-3">
              <Star className="w-5 h-5 flex-shrink-0 text-primary" />
              <p>
                <strong>Super Likes</strong> - Show someone you really like them before they even
                swipe
              </p>
            </div>
            <div className="flex gap-3">
              <Eye className="w-5 h-5 flex-shrink-0 text-primary" />
              <p>
                <strong>See Who Liked You</strong> - Never miss a potential match
              </p>
            </div>
            <div className="flex gap-3">
              <Heart className="w-5 h-5 flex-shrink-0 text-primary" />
              <p>
                <strong>Unlimited Swipes</strong> - Swipe as much as you want without limits
              </p>
            </div>
          </CardContent>
        </Card>

        {/* FAQ */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Questions?</h3>
          <div className="space-y-3 text-sm">
            <div>
              <p className="font-semibold">How does the free trial work?</p>
              <p className="text-muted-foreground">
                New premium members get 3 days free before being charged.
              </p>
            </div>
            <div>
              <p className="font-semibold">Can I cancel anytime?</p>
              <p className="text-muted-foreground">
                Yes! Cancel in your settings at any time. No questions asked.
              </p>
            </div>
            <div>
              <p className="font-semibold">Is my payment secure?</p>
              <p className="text-muted-foreground">
                We use Stripe for encrypted, PCI-compliant payment processing.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumStore;
