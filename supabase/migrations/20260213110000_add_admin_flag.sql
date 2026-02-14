-- Add is_admin flag to profiles table for role-based access
ALTER TABLE profiles ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;

-- Create index for faster admin checks
CREATE INDEX idx_profiles_is_admin ON profiles(is_admin);

-- Set the initial admin (replace with actual admin email)
-- UPDATE profiles SET is_admin = TRUE WHERE id = 'YOUR_ADMIN_USER_ID';
