import { useState } from "react";
import { useSOSContacts } from "@/hooks/useBadgeAndSOS";
import { Button } from "@/components/ui/button";
import { AlertCircle, AlertTriangle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface SOSButtonProps {
  userId?: string;
  matchId?: string;
  compact?: boolean;
}

export const SOSButton = ({ userId, matchId, compact = false }: SOSButtonProps) => {
  const { contacts, triggerSOS } = useSOSContacts(userId);
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const hasContacts = contacts.length > 0;

  const handleTriggerSOS = async () => {
    setConfirming(true);

    // Get current location if available
    let location;
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        location = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
      });
    }

    await triggerSOS(location, matchId);
    setOpen(false);
    setConfirming(false);
  };

  if (compact) {
    return (
      <>
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={() => setOpen(true)}
          disabled={!hasContacts}
        >
          <AlertTriangle className="w-4 h-4 mr-2" />
          SOS
        </Button>

        <AlertDialog open={open} onOpenChange={setOpen}>
          <AlertDialogContent className="border-0 shadow-lg">
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-destructive" />
              Emergency Alert
            </AlertDialogTitle>
            <AlertDialogDescription>
              {!hasContacts ? (
                <div className="space-y-2">
                  <p className="text-foreground">
                    You need to set up emergency contacts first.
                  </p>
                  <p className="text-muted-foreground text-sm">
                    Go to Settings → Emergency Contacts to add trusted friends.
                  </p>
                </div>
              ) : (
                <p>
                  This will alert your emergency contacts and campus security of your location.
                  Are you safe?
                </p>
              )}
            </AlertDialogDescription>
            <div className="flex gap-2">
              <AlertDialogCancel className="flex-1">Cancel</AlertDialogCancel>
              {hasContacts && (
                <AlertDialogAction
                  onClick={handleTriggerSOS}
                  disabled={confirming}
                  className="flex-1 bg-destructive hover:bg-destructive/90"
                >
                  {confirming ? "Alerting..." : "Yes, Get Help"}
                </AlertDialogAction>
              )}
            </div>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  }

  // Full button variant
  return (
    <>
      <Button
        variant="destructive"
        size="lg"
        className="w-full gap-2 shadow-lg"
        onClick={() => setOpen(true)}
        disabled={!hasContacts}
      >
        <AlertCircle className="w-5 h-5" />
        Emergency SOS
      </Button>

      {!hasContacts && (
        <p className="text-xs text-destructive text-center mt-2">
          Add emergency contacts in settings first
        </p>
      )}

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent className="border-0 shadow-lg">
          <AlertDialogTitle className="flex items-center gap-2 text-2xl">
            <AlertTriangle className="w-8 h-8 text-destructive" />
            Emergency Alert
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-foreground">
              <p className="font-semibold mb-2">This action will:</p>
              <ul className="space-y-1 text-sm list-disc list-inside">
                <li>Alert all your emergency contacts</li>
                <li>Notify campus security</li>
                <li>Share your real-time location</li>
                <li>Flag the current match for review</li>
              </ul>
            </div>
            <p className="text-muted-foreground">Are you in danger? Do you need help?</p>
          </AlertDialogDescription>
          <div className="flex gap-2">
            <AlertDialogCancel className="flex-1">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleTriggerSOS}
              disabled={confirming}
              className="flex-1 bg-destructive hover:bg-destructive/90"
            >
              {confirming ? "Contacting..." : "Yes, Get Help Now"}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default SOSButton;
