import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export const usePhotoUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const uploadProfilePhoto = useCallback(
    async (
      file: File,
      userId: string,
      isVerification: boolean = false
    ): Promise<{ url: string; path: string } | null> => {
      if (!file || !userId) {
        setError("Missing file or user ID");
        return null;
      }

      // Validate file
      if (!file.type.startsWith("image/")) {
        setError("Please select an image file");
        return null;
      }

      if (file.size > 5 * 1024 * 1024) {
        setError("File must be smaller than 5MB");
        return null;
      }

      try {
        setUploading(true);
        setError(null);
        setProgress(0);

        // Create unique filename
        const timestamp = Date.now();
        const folder = isVerification ? "verification" : "profiles";
        const filename = `${folder}/${userId}/${timestamp}-${file.name}`;

        // Upload to Supabase Storage
        const { data, error: uploadError } = await supabase.storage
          .from("photos")
          .upload(filename, file, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          console.error("Upload error:", uploadError);
          setError(uploadError.message);
          return null;
        }

        // Get public URL
        const { data: publicUrlData } = supabase.storage
          .from("photos")
          .getPublicUrl(filename);

        setProgress(100);

        return {
          url: publicUrlData.publicUrl,
          path: filename,
        };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Upload failed";
        console.error("Error uploading photo:", err);
        setError(errorMessage);
        return null;
      } finally {
        setUploading(false);
      }
    },
    []
  );

  const deletePhoto = useCallback(async (path: string): Promise<boolean> => {
    try {
      const { error: deleteError } = await supabase.storage
        .from("photos")
        .remove([path]);

      if (deleteError) {
        console.error("Delete error:", deleteError);
        setError(deleteError.message);
        return false;
      }

      return true;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Delete failed";
      console.error("Error deleting photo:", err);
      setError(errorMessage);
      return false;
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    uploadProfilePhoto,
    deletePhoto,
    uploading,
    error,
    progress,
    clearError,
  };
};
