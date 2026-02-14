import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Message {
  id: string;
  match_id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

interface UseMessagesProps {
  matchId: string | undefined;
  currentUserId: string | undefined;
}

export const useMessages = ({ matchId, currentUserId }: UseMessagesProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch initial messages
  useEffect(() => {
    if (!matchId) return;

    const fetchMessages = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error: err } = await supabase
          .from("messages")
          .select("*")
          .eq("match_id", matchId)
          .order("created_at", { ascending: true });

        if (err) {
          console.error("Error fetching messages:", err);
          setError(err.message);
          return;
        }

        setMessages(data || []);
      } catch (e) {
        console.error("Unexpected error fetching messages:", e);
        setError("Failed to fetch messages");
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [matchId]);

  // Subscribe to realtime updates
  useEffect(() => {
    if (!matchId) return;

    // Subscribe to new messages
    const subscription = supabase
      .channel(`messages:${matchId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `match_id=eq.${matchId}`,
        },
        (payload) => {
          const newMessage = payload.new as Message;
          setMessages((prev) => [...prev, newMessage]);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [matchId]);

  // Send a message
  const sendMessage = useCallback(
    async (content: string) => {
      if (!matchId || !currentUserId || !content.trim()) {
        return;
      }

      try {
        const { error: err } = await supabase.from("messages").insert({
          match_id: matchId,
          sender_id: currentUserId,
          content: content.trim(),
        });

        if (err) {
          console.error("Error sending message:", err);
          setError(err.message);
          return false;
        }

        return true;
      } catch (e) {
        console.error("Unexpected error sending message:", e);
        setError("Failed to send message");
        return false;
      }
    },
    [matchId, currentUserId]
  );

  return {
    messages,
    loading,
    error,
    sendMessage,
  };
};
