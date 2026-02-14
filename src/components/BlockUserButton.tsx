import { useState } from "react";
import { MoreVertical, Ban, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBlocking } from "@/hooks/useBlocking";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useReporting } from "@/hooks/useReporting";

interface BlockUserButtonProps {
  targetProfileId: string;
  profileName?: string;
  onBlocked?: () => void;
}

export const BlockUserButton = ({
  targetProfileId,
  profileName = "User",
  onBlocked,
}: BlockUserButtonProps) => {
  const { blockUser } = useBlocking();
  const { reportUser } = useReporting();
  const [showReasonDialog, setShowReasonDialog] = useState(false);
  const [reason, setReason] = useState("");
  const [isConfirming, setIsConfirming] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportCategory, setReportCategory] = useState("Inappropriate");
  const [reportDesc, setReportDesc] = useState("");

  const handleBlockClick = () => {
    setShowReasonDialog(true);
  };

  const handleConfirmBlock = async () => {
    setIsConfirming(true);
    const success = await blockUser(targetProfileId, reason || undefined);
    setIsConfirming(false);

    if (success) {
      setShowReasonDialog(false);
      setReason("");
      onBlocked?.();
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="w-9 h-9 text-muted-foreground hover:text-foreground"
          >
            <MoreVertical className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleBlockClick} className="text-destructive">
            <Ban className="w-4 h-4 mr-2" />
            Block User
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShowReportDialog(true)} className="text-warning">
            <Flag className="w-4 h-4 mr-2" />
            Report User
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showReasonDialog} onOpenChange={setShowReasonDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Block {profileName}?</DialogTitle>
            <DialogDescription>
              This user won't appear in your discovery feed. They won't be notified that you blocked them.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Reason (Optional)
              </label>
              <Textarea
                placeholder="E.g., Inappropriate messages, fake profile, etc."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="min-h-24"
              />
            </div>

            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowReasonDialog(false)}
                disabled={isConfirming}
              >
                Cancel
              </Button>
              <Button
                className="bg-destructive hover:bg-destructive/90"
                onClick={handleConfirmBlock}
                disabled={isConfirming}
              >
                {isConfirming ? "Blocking..." : "Block User"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Report Dialog */}
      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report {profileName}</DialogTitle>
            <DialogDescription>
              Tell us why you're reporting this profile. Our team will review it.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">Category</label>
              <select
                value={reportCategory}
                onChange={(e) => setReportCategory(e.target.value)}
                className="w-full px-3 py-2 bg-input border border-border rounded-lg"
              >
                <option>Inappropriate</option>
                <option>Spam</option>
                <option>Fake Profile</option>
                <option>Harassment</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">Details (optional)</label>
              <Textarea
                placeholder="Additional information to help review"
                value={reportDesc}
                onChange={(e) => setReportDesc(e.target.value)}
                className="min-h-24"
              />
            </div>

            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setShowReportDialog(false)}>Cancel</Button>
              <Button
                className="bg-warning hover:bg-warning/90"
                onClick={async () => {
                  const success = await reportUser(targetProfileId, reportCategory, reportDesc || undefined);
                  if (success) setShowReportDialog(false);
                }}
              >
                Submit Report
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BlockUserButton;
