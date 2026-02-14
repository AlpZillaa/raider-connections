import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePhotoUpload } from "@/hooks/usePhotoUpload";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Upload, Check, Clock, AlertCircle, Camera } from "lucide-react";

interface PhotoVerificationProps {
  userId: string | undefined;
  profileId: string | undefined;
  isVerified: boolean;
  hasAttempt: boolean;
  onVerificationSubmitted?: () => void;
}

export const PhotoVerification = ({
  userId,
  profileId,
  isVerified,
  hasAttempt,
  onVerificationSubmitted,
}: PhotoVerificationProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { uploadProfilePhoto, uploading, error: uploadError, clearError } = usePhotoUpload();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    clearError();
    const file = e.target.files?.[0];
    if (!file) return;

    // Create preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setPreviewUrl(event.target?.result as string);
    };
    reader.readAsDataURL(file);

    setSelectedFile(file);
  };

  const handleSubmitVerification = async () => {
    if (!selectedFile || !userId || !profileId) {
      toast({
        title: "Error",
        description: "Missing file or user information",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);
      clearError();

      // Upload photo to verification folder
      const uploadResult = await uploadProfilePhoto(selectedFile, userId, true);

      if (!uploadResult) {
        toast({
          title: "Upload Failed",
          description: uploadError || "Failed to upload photo",
          variant: "destructive",
        });
        return;
      }

      // Record verification attempt in database
      const { error: insertError } = await supabase
        .from("verification_attempts")
        .insert({
          profile_id: profileId,
          status: "pending",
        });

      if (insertError) {
        toast({
          title: "Error",
          description: "Failed to record verification attempt",
          variant: "destructive",
        });
        return;
      }

      // Update profile with last verification attempt timestamp
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          last_verification_attempt: new Date().toISOString(),
          verification_attempts: (hasAttempt ? 1 : 0) + 1,
        })
        .eq("id", profileId);

      if (updateError) {
        console.error("Error updating profile:", updateError);
      }

      toast({
        title: "Verification Submitted! 🎉",
        description:
          "Your photo has been submitted for review. We'll verify it within 24 hours.",
      });

      // Reset form
      setSelectedFile(null);
      setPreviewUrl(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      onVerificationSubmitted?.();
    } catch (err) {
      console.error("Verification submission error:", err);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (isVerified) {
    return (
      <Card className="w-full max-w-md border-0 shadow-light bg-green-50/50 dark:bg-green-950/20 border border-green-200/50">
        <CardContent className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <Check className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="font-bold text-green-900 dark:text-green-100">
                Profile Verified ✓
              </p>
              <p className="text-sm text-green-700 dark:text-green-200">
                Your photo has been approved
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (hasAttempt) {
    return (
      <Card className="w-full max-w-md border-0 shadow-light bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50">
        <CardContent className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <Clock className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="font-bold text-amber-900 dark:text-amber-100">
                Verification Pending
              </p>
              <p className="text-sm text-amber-700 dark:text-amber-200">
                We're reviewing your photo. Check back soon!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md border-0 shadow-light hover:shadow-medium transition-all">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="w-5 h-5 text-primary" />
          Photo Verification
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-2">
          Get verified to appear in discovery and get more matches!
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Preview or Upload Area */}
        {previewUrl ? (
          <div className="space-y-4">
            <div className="relative w-full aspect-square rounded-lg overflow-hidden border-2 border-primary/20">
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>

            <div className="text-sm text-muted-foreground space-y-2 p-3 bg-muted/50 rounded-lg">
              <p className="flex items-center gap-2">
                <span className="text-xs">✓</span>
                Clear face photo recommended
              </p>
              <p className="flex items-center gap-2">
                <span className="text-xs">✓</span>
                Recent photo (within 6 months)
              </p>
              <p className="flex items-center gap-2">
                <span className="text-xs">✓</span>
                Good lighting, no filters
              </p>
            </div>
          </div>
        ) : (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full aspect-square rounded-lg border-2 border-dashed border-primary/30 hover:border-primary/60 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer"
          >
            <Camera className="w-8 h-8 text-muted-foreground" />
            <p className="text-sm font-medium text-muted-foreground">
              Click to select photo
            </p>
            <p className="text-xs text-muted-foreground">JPG, PNG or WebP</p>
          </button>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Error Message */}
        {uploadError && (
          <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
            <AlertCircle className="w-4 h-4 text-destructive" />
            <p className="text-sm text-destructive">{uploadError}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          {previewUrl && (
            <Button
              variant="outline"
              onClick={() => {
                setPreviewUrl(null);
                setSelectedFile(null);
              }}
              disabled={uploading}
              className="flex-1"
            >
              Change Photo
            </Button>
          )}

          <Button
            onClick={previewUrl ? handleSubmitVerification : () => fileInputRef.current?.click()}
            disabled={uploading || !selectedFile}
            className="flex-1 bg-gradient-primary hover:shadow-lg shadow-primary"
          >
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Uploading...
              </>
            ) : previewUrl ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Submit for Verification
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Upload Photo
              </>
            )}
          </Button>
        </div>

        {/* Help Text */}
        <p className="text-xs text-muted-foreground text-center">
          This helps us prevent fake accounts and keep everyone safe 🔒
        </p>
      </CardContent>
    </Card>
  );
};
