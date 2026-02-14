import { useState } from "react";
import { Trash2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useBlocking } from "@/hooks/useBlocking";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const BlockedUsersList = () => {
  const { blockedUsers, loading, unblockUser } = useBlocking();
  const [unblockingId, setUnblockingId] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="w-full max-w-md space-y-3">
        <div className="animate-pulse h-12 bg-muted rounded-lg"></div>
        <div className="animate-pulse h-12 bg-muted rounded-lg"></div>
      </div>
    );
  }

  if (blockedUsers.length === 0) {
    return (
      <div className="w-full max-w-md">
        <div className="p-6 bg-muted/50 rounded-xl border border-border text-center">
          <p className="text-muted-foreground text-sm">
            No blocked users yet. Users you block won't appear in your discovery.
          </p>
        </div>
      </div>
    );
  }

  const handleUnblock = async (blockId: string, targetProfileId: string) => {
    setUnblockingId(blockId);
    await unblockUser(blockId, targetProfileId);
    setUnblockingId(null);
  };

  return (
    <div className="w-full max-w-md space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <AlertCircle className="w-4 h-4 text-yellow-600" />
        <span className="text-sm font-medium text-muted-foreground">
          {blockedUsers.length} user{blockedUsers.length !== 1 ? "s" : ""} blocked
        </span>
      </div>

      <div className="space-y-2">
        {blockedUsers.map((block) => (
          <div
            key={block.id}
            className="p-4 bg-card border border-border rounded-xl flex items-center justify-between"
          >
            <div className="flex-1 min-w-0">
              <Badge variant="outline" className="text-xs mb-2">
                Blocked
              </Badge>
              {block.reason && (
                <p className="text-xs text-muted-foreground">{block.reason}</p>
              )}
              <p className="text-xs text-muted-foreground/70 mt-1">
                {new Date(block.created_at).toLocaleDateString()}
              </p>
            </div>

            <AlertDialog>
              <Button
                variant="ghost"
                size="icon"
                className="ml-2 text-destructive hover:bg-destructive/10"
                disabled={unblockingId === block.id}
              >
                <Trash2 className="w-4 h-4" />
              </Button>

              <AlertDialogContent>
                <AlertDialogTitle>Unblock User?</AlertDialogTitle>
                <AlertDialogDescription>
                  This user will appear in your discovery feed again and you'll be able to see them in your matches.
                </AlertDialogDescription>
                <div className="flex gap-3 justify-end">
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleUnblock(block.id, block.blocked_id)}
                    className="bg-destructive hover:bg-destructive/90"
                  >
                    Unblock
                  </AlertDialogAction>
                </div>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BlockedUsersList;
