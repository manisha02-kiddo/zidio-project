/*
  # Real-Time Collaboration Features

  1. New Tables
    - `chat_messages`: Store team chat messages
    - `shared_files`: Track shared files and resources
    - `chat_rooms`: Group chat functionality
    
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create chat rooms table
CREATE TABLE IF NOT EXISTS chat_rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  created_by uuid REFERENCES auth.users,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT name_length CHECK (char_length(name) >= 1)
);

-- Create chat messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid REFERENCES chat_rooms ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT content_not_empty CHECK (char_length(content) >= 1)
);

-- Create shared files table
CREATE TABLE IF NOT EXISTS shared_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid REFERENCES chat_rooms ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  url text NOT NULL,
  size_bytes bigint,
  mime_type text,
  user_id uuid REFERENCES auth.users,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT name_length CHECK (char_length(name) >= 1)
);

-- Enable RLS
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_files ENABLE ROW LEVEL SECURITY;

-- Chat room policies
CREATE POLICY "Users can view chat rooms"
  ON chat_rooms FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create chat rooms"
  ON chat_rooms FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- Chat message policies
CREATE POLICY "Users can view messages"
  ON chat_messages FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can send messages"
  ON chat_messages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Shared files policies
CREATE POLICY "Users can view shared files"
  ON shared_files FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can share files"
  ON shared_files FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);