import { useReferralSystem } from "@/hooks/useReferralSystem";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Share2, Copy, Gift } from "lucide-react";
import { useState } from "react";

interface ReferralInviteProps {
  userId?: string;
}

export const ReferralInvite = ({ userId }: ReferralInviteProps) => {
  const { referralData, shareReferralCode, redeemReferralCode, claimRewards } =
    useReferralSystem(userId);
  const [redeemCode, setRedeemCode] = useState("");
  const [redeeming, setRedeeming] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!referralData) return;
    const text = `Join me on RaiderRash! Use code ${referralData.referral_code} to get 1 week of premium free. https://raiderrash.com?ref=${referralData.referral_code}`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRedeem = async () => {
    if (!redeemCode.trim()) return;
    setRedeeming(true);
    const success = await redeemReferralCode(redeemCode);
    if (success) {
      setRedeemCode("");
    }
    setRedeeming(false);
  };

  return (
    <div className="space-y-4">
      {/* Invitation card */}
      <Card className="border-0 shadow-light bg-gradient-to-br from-primary/5 to-accent/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-primary" />
            Earn Free Premium
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-foreground/80">
            Share your code with friends. When they join, you both get 1 week of premium free!
          </p>

          {/* Referral code display */}
          {referralData && (
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  value={referralData.referral_code}
                  readOnly
                  className="font-mono font-bold text-center bg-card"
                />
                <Button size="icon" variant="outline" onClick={handleCopy}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              {copied && <p className="text-xs text-green-600 text-center">Copied!</p>}
            </div>
          )}

          {/* Share button */}
          <Button
            variant="default"
            className="w-full gap-2"
            onClick={shareReferralCode}
          >
            <Share2 className="w-4 h-4" />
            Share with Friends
          </Button>

          {/* Stats */}
          {referralData && (
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">
                  {referralData.total_referrals}
                </p>
                <p className="text-xs text-muted-foreground">Invited</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-accent">
                  {referralData.successful_referrals}
                </p>
                <p className="text-xs text-muted-foreground">Joined</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {referralData.total_rewards_claimed}
                </p>
                <p className="text-xs text-muted-foreground">Rewards</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Redeem code card */}
      <Card className="border-0 shadow-light">
        <CardHeader>
          <CardTitle className="text-base">Redeem a Code</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Have a friend's referral code? Enter it here to claim your free week!
          </p>
          <div className="flex gap-2">
            <Input
              placeholder="Enter referral code"
              value={redeemCode}
              onChange={(e) => setRedeemCode(e.target.value.toUpperCase())}
            />
            <Button
              onClick={handleRedeem}
              disabled={!redeemCode.trim() || redeeming}
              className="px-6"
            >
              {redeeming ? "Redeeming..." : "Redeem"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReferralInvite;
