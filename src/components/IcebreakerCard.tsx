import { useState } from "react";
import { useIcebreakers } from "@/hooks/useIcebreakers";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles, ChevronRight } from "lucide-react";

interface IcebreakerCardProps {
  matchId?: string;
  onSent?: () => void;
}

export const IcebreakerCard = ({ matchId, onSent }: IcebreakerCardProps) => {
  const { prompts, sendIcebreaker, getRandomPrompt } = useIcebreakers();
  const [currentPrompt, setCurrentPrompt] = useState(getRandomPrompt());
  const [sending, setSending] = useState(false);

  const handleNextPrompt = () => {
    setCurrentPrompt(getRandomPrompt());
  };

  const handleSendPrompt = async () => {
    if (!currentPrompt || !matchId) return;

    setSending(true);
    const success = await sendIcebreaker(matchId, currentPrompt.id);
    setSending(false);

    if (success) {
      onSent?.();
    }
  };

  if (!currentPrompt) {
    return null;
  }

  return (
    <Card className="border-0 shadow-light p-6 bg-gradient-to-br from-primary/5 to-accent/5">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <span className="text-sm font-semibold text-primary">Icebreaker</span>
        </div>

        {/* Prompt */}
        <div className="space-y-3">
          <p className="text-lg font-semibold text-foreground">{currentPrompt.prompt_text}</p>
          <p className="text-xs text-muted-foreground">
            Perfect way to start a conversation. They'll love it!
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleNextPrompt}
            disabled={sending}
          >
            <ChevronRight className="w-4 h-4 mr-2" />
            Next
          </Button>
          <Button
            className="flex-1 bg-gradient-primary hover:shadow-lg"
            onClick={handleSendPrompt}
            disabled={sending || !matchId}
          >
            {sending ? "Sending..." : "Send"}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default IcebreakerCard;
