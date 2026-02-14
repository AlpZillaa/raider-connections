import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface IcebreakerPrompt {
  id: string;
  prompt_text: string;
  category: string;
}

export interface IcebreakerAnswer {
  prompt_id: string;
  answer: string;
}

export const useIcebreakers = (userId?: string) => {
  const [prompts, setPrompts] = useState<IcebreakerPrompt[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchPromptsAndAnswers = async () => {
      try {
        setLoading(true);

        // Fetch all active prompts
        const { data: promptsData, error: promptsError } = await supabase
          .from("icebreaker_prompts")
          .select("*")
          .eq("is_active", true)
          .limit(10);

        if (promptsError) throw promptsError;
        setPrompts(promptsData || []);

        // Fetch user's answers if userId provided
        if (userId) {
          const { data: answersData, error: answersError } = await supabase
            .from("icebreaker_answers")
            .select("*")
            .eq("profile_id", userId);

          if (answersError && answersError.code !== "PGRST116") throw answersError;

          const answersMap: Record<string, string> = {};
          answersData?.forEach((a: any) => {
            answersMap[a.prompt_id] = a.answer;
          });
          setAnswers(answersMap);
        }
      } catch (err) {
        console.error("Error fetching icebreakers:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPromptsAndAnswers();
  }, [userId]);

  const saveAnswer = async (promptId: string, answer: string) => {
    if (!userId) return false;

    try {
      const { error } = await supabase.from("icebreaker_answers").upsert(
        [
          {
            profile_id: userId,
            prompt_id: promptId,
            answer,
          },
        ],
        { onConflict: "profile_id,prompt_id" }
      );

      if (error) throw error;

      setAnswers((prev) => ({
        ...prev,
        [promptId]: answer,
      }));

      toast({ title: "Answer saved!" });
      return true;
    } catch (err) {
      console.error("Error saving answer:", err);
      toast({ title: "Failed to save answer", variant: "destructive" });
      return false;
    }
  };

  const sendIcebreaker = async (matchId: string, promptId: string) => {
    if (!userId) return false;

    try {
      const { error } = await supabase.from("icebreaker_chats").insert([
        {
          match_id: matchId,
          prompt_id: promptId,
          sender_id: userId,
        },
      ]);

      if (error) throw error;

      const prompt = prompts.find((p) => p.id === promptId);
      toast({
        title: "Icebreaker sent!",
        description: `Sent: "${prompt?.prompt_text}"`,
      });
      return true;
    } catch (err) {
      console.error("Error sending icebreaker:", err);
      toast({ title: "Failed to send icebreaker", variant: "destructive" });
      return false;
    }
  };

  const getRandomPrompt = () => {
    if (prompts.length === 0) return null;
    return prompts[Math.floor(Math.random() * prompts.length)];
  };

  return {
    prompts,
    answers,
    loading,
    saveAnswer,
    sendIcebreaker,
    getRandomPrompt,
  };
};
