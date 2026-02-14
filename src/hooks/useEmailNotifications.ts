import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface EmailNotification {
  type: "match" | "message" | "verification_approved";
  recipientEmail: string;
  recipientName: string;
  senderName?: string;
  senderImage?: string;
  matchData?: {
    matchedProfileId: string;
    matchedName: string;
    matchedImage: string;
  };
  messageData?: {
    senderName: string;
    senderImage: string;
    messagePreview: string;
  };
}

export const useEmailNotifications = () => {
  const { toast } = useToast();

  const sendEmailNotification = async (notification: EmailNotification) => {
    try {
      // Call Supabase Edge Function to send email
      const { data, error } = await supabase.functions.invoke("send-email", {
        body: {
          type: notification.type,
          recipientEmail: notification.recipientEmail,
          recipientName: notification.recipientName,
          headers: {
            authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          },
          ...notification,
        },
      });

      if (error) {
        console.error("Email notification error:", error);
        // Don't show toast error to user - email is non-critical
        return false;
      }

      console.log("Email sent successfully:", data);
      return true;
    } catch (err) {
      console.error("Failed to send email:", err);
      return false;
    }
  };

  const notifyMatch = async (
    recipientEmail: string,
    recipientName: string,
    matchedName: string,
    matchedImage: string
  ) => {
    return sendEmailNotification({
      type: "match",
      recipientEmail,
      recipientName,
      senderName: matchedName,
      senderImage: matchedImage,
      matchData: {
        matchedProfileId: "",
        matchedName,
        matchedImage,
      },
    });
  };

  const notifyNewMessage = async (
    recipientEmail: string,
    recipientName: string,
    senderName: string,
    senderImage: string,
    messagePreview: string
  ) => {
    return sendEmailNotification({
      type: "message",
      recipientEmail,
      recipientName,
      senderName,
      messageData: {
        senderName,
        senderImage,
        messagePreview,
      },
    });
  };

  const notifyVerificationApproved = async (recipientEmail: string, recipientName: string) => {
    return sendEmailNotification({
      type: "verification_approved",
      recipientEmail,
      recipientName,
    });
  };

  return {
    sendEmailNotification,
    notifyMatch,
    notifyNewMessage,
    notifyVerificationApproved,
  };
};
