import { useState } from "react";
import { useBadgeVerification, useSOSContacts } from "@/hooks/useBadgeAndSOS";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Instagram, Spotify, AlertCircle, Check, Plus, Phone } from "lucide-react";

interface BadgeVerificationProps {
  userId?: string;
}

export const BadgeVerification = ({ userId }: BadgeVerificationProps) => {
  const { badges, verifyBadge, removeBadge } = useBadgeVerification(userId);
  const { contacts, addContact } = useSOSContacts(userId);
  const [verifying, setVerifying] = useState<string | null>(null);
  const [instagramUsername, setInstagramUsername] = useState("");
  const [spotifyUsername, setSpotifyUsername] = useState("");
  const [addingContact, setAddingContact] = useState(false);
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");

  const handleVerifyBadge = async (badgeType: string, username: string) => {
    setVerifying(badgeType);
    await verifyBadge(badgeType, username);
    if (badgeType === "instagram") setInstagramUsername("");
    if (badgeType === "spotify") setSpotifyUsername("");
    setVerifying(null);
  };

  const handleAddContact = async () => {
    if (!contactName.trim() || !contactPhone.trim()) return;
    setAddingContact(true);
    await addContact(contactName, contactPhone);
    setContactName("");
    setContactPhone("");
    setAddingContact(false);
  };

  const isBadgeVerified = (badgeType: string) => badges.some((b) => b.badge_type === badgeType);

  const badges_list = [
    {
      key: "instagram",
      name: "Instagram",
      icon: Instagram,
      color: "bg-pink-100 dark:bg-pink-900/20",
      value: instagramUsername,
      setValue: setInstagramUsername,
      description: "Verify your real Instagram account",
    },
    {
      key: "spotify",
      name: "Spotify",
      icon: Spotify,
      color: "bg-green-100 dark:bg-green-900/20",
      value: spotifyUsername,
      setValue: setSpotifyUsername,
      description: "Show your music taste",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Badge verification section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Verify Your Identity</h3>
        <p className="text-sm text-muted-foreground">
          Verified badges increase trust and help you stand out.
        </p>

        {badges_list.map((badge) => {
          const Icon = badge.icon;
          const isVerified = isBadgeVerified(badge.key);

          return (
            <Card key={badge.key} className="border-0 shadow-light">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg ${badge.color} flex items-center justify-center`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold">{badge.name}</p>
                      <p className="text-xs text-muted-foreground">{badge.description}</p>
                    </div>
                  </div>
                  {isVerified && (
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                      <Check className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>

                {!isVerified && (
                  <div className="flex gap-2 pt-2">
                    <Input
                      placeholder={`${badge.name} username`}
                      value={badge.value}
                      onChange={(e) => badge.setValue(e.target.value)}
                      disabled={verifying === badge.key}
                    />
                    <Button
                      size="sm"
                      onClick={() => handleVerifyBadge(badge.key, badge.value)}
                      disabled={!badge.value.trim() || verifying === badge.key}
                    >
                      {verifying === badge.key ? "Verifying..." : "Verify"}
                    </Button>
                  </div>
                )}

                {isVerified && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full text-destructive hover:bg-destructive/10"
                    onClick={() => removeBadge(badge.key)}
                  >
                    Remove
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Emergency contacts section */}
      <div className="space-y-4 border-t border-border pt-6">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-primary" />
          Emergency Contacts
        </h3>
        <p className="text-sm text-muted-foreground">
          Add trusted contacts who will be notified if you use the SOS feature.
        </p>

        {/* Contacts list */}
        {contacts.length > 0 && (
          <Card className="border-0 shadow-light">
            <CardContent className="p-4 space-y-2">
              {contacts.map((contact) => (
                <div key={contact.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{contact.contact_name}</p>
                      <p className="text-xs text-muted-foreground">{contact.contact_phone}</p>
                    </div>
                  </div>
                  {contact.is_primary && (
                    <Badge className="bg-primary text-white">Primary</Badge>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Add contact form */}
        <Card className="border-0 shadow-light">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Emergency Contact
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              placeholder="Contact name"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
            />
            <Input
              placeholder="Phone number"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              type="tel"
            />
            <Button
              className="w-full"
              onClick={handleAddContact}
              disabled={!contactName.trim() || !contactPhone.trim() || addingContact}
            >
              {addingContact ? "Adding..." : "Add Contact"}
            </Button>
            <p className="text-xs text-muted-foreground">
              Your contacts will only be alerted if you use the SOS feature.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BadgeVerification;
