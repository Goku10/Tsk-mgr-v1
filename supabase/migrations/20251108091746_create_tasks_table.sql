/*
  # Create tasks table with priority and status

  1. New Tables
    - `tasks`
      - `id` (uuid, primary key) - Unique identifier for each task
      - `user_id` (uuid, foreign key) - References auth.users table to map tasks to users
      - `title` (text) - Task title/description
      - `priority` (text) - Task priority: 'low', 'medium', 'high'
      - `status` (text) - Task status: 'pending', 'in-progress', 'done'
      - `created_at` (timestamptz) - Timestamp when task was created
      - `updated_at` (timestamptz) - Timestamp when task was last updated

  2. Security
    - Enable RLS on `tasks` table
    - Add policy for authenticated users to read their own tasks
    - Add policy for authenticated users to insert their own tasks
    - Add policy for authenticated users to update their own tasks
    - Add policy for authenticated users to delete their own tasks

  3. Important Notes
    - All tasks are private and only accessible to the user who created them
    - Priority defaults to 'medium' and status defaults to 'pending'
    - Foreign key constraint ensures data integrity with auth.users
*/

CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'done')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own tasks"
  ON tasks
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tasks"
  ON tasks
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tasks"
  ON tasks
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own tasks"
  ON tasks
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
