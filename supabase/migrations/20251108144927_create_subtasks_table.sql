/*
  # Create subtasks table

  1. New Tables
    - `subtasks`
      - `id` (uuid, primary key) - Unique identifier for each subtask
      - `task_id` (uuid, foreign key) - References tasks table to link subtask to main task
      - `user_id` (uuid, foreign key) - References auth.users table to map subtasks to users
      - `title` (text) - Subtask title/description
      - `status` (text) - Subtask status: 'pending', 'in-progress', 'done'
      - `created_at` (timestamptz) - Timestamp when subtask was created
      - `updated_at` (timestamptz) - Timestamp when subtask was last updated

  2. Security
    - Enable RLS on `subtasks` table
    - Add policy for authenticated users to read their own subtasks
    - Add policy for authenticated users to insert their own subtasks
    - Add policy for authenticated users to update their own subtasks
    - Add policy for authenticated users to delete their own subtasks

  3. Important Notes
    - All subtasks are private and only accessible to the user who created them
    - Status defaults to 'pending'
    - Foreign key constraints ensure data integrity with tasks and auth.users
    - Cascade delete ensures subtasks are removed when parent task is deleted
*/

CREATE TABLE IF NOT EXISTS subtasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid REFERENCES tasks(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'done')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE subtasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own subtasks"
  ON subtasks
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subtasks"
  ON subtasks
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subtasks"
  ON subtasks
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own subtasks"
  ON subtasks
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_subtasks_task_id ON subtasks(task_id);
CREATE INDEX IF NOT EXISTS idx_subtasks_user_id ON subtasks(user_id);
