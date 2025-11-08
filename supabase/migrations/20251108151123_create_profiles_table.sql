/*
  # Create profiles table for user profile data

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key) - Unique identifier for each profile
      - `user_id` (uuid, foreign key) - References auth.users table
      - `profile_picture_url` (text) - URL to the user's profile picture in storage
      - `created_at` (timestamptz) - Timestamp when profile was created
      - `updated_at` (timestamptz) - Timestamp when profile was last updated

  2. Security
    - Enable RLS on `profiles` table
    - Add policy for authenticated users to read their own profile
    - Add policy for authenticated users to insert their own profile
    - Add policy for authenticated users to update their own profile

  3. Storage
    - Create storage bucket for profile pictures
    - Set up storage policies for authenticated users

  4. Important Notes
    - Each user can have only one profile
    - Profile pictures are stored in Supabase Storage
    - Users can only access their own profile data
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  profile_picture_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create index
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);

-- Create storage bucket for profile pictures
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-pictures', 'profile-pictures', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
DO $$
BEGIN
  -- Allow authenticated users to upload their own profile pictures
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Users can upload own profile picture'
  ) THEN
    CREATE POLICY "Users can upload own profile picture"
      ON storage.objects
      FOR INSERT
      TO authenticated
      WITH CHECK (
        bucket_id = 'profile-pictures' AND
        (storage.foldername(name))[1] = auth.uid()::text
      );
  END IF;

  -- Allow authenticated users to update their own profile pictures
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Users can update own profile picture'
  ) THEN
    CREATE POLICY "Users can update own profile picture"
      ON storage.objects
      FOR UPDATE
      TO authenticated
      USING (
        bucket_id = 'profile-pictures' AND
        (storage.foldername(name))[1] = auth.uid()::text
      );
  END IF;

  -- Allow authenticated users to delete their own profile pictures
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Users can delete own profile picture'
  ) THEN
    CREATE POLICY "Users can delete own profile picture"
      ON storage.objects
      FOR DELETE
      TO authenticated
      USING (
        bucket_id = 'profile-pictures' AND
        (storage.foldername(name))[1] = auth.uid()::text
      );
  END IF;

  -- Allow public read access to profile pictures
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Public can view profile pictures'
  ) THEN
    CREATE POLICY "Public can view profile pictures"
      ON storage.objects
      FOR SELECT
      TO public
      USING (bucket_id = 'profile-pictures');
  END IF;
END $$;
