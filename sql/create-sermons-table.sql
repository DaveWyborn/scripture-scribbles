-- Sermon Notes Table
-- Run this in Supabase SQL Editor if sermons table doesn't exist

-- Create sermons table
CREATE TABLE IF NOT EXISTS sermons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  date date NOT NULL,
  speaker text,
  location text,
  series text,
  passage text,
  content text,
  metadata jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE sermons ENABLE ROW LEVEL SECURITY;

-- Policies: Users can manage their own sermons
CREATE POLICY "Users can manage their own sermons"
  ON sermons FOR ALL
  USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS sermons_user_id_idx ON sermons(user_id);
CREATE INDEX IF NOT EXISTS sermons_date_idx ON sermons(date DESC);
CREATE INDEX IF NOT EXISTS sermons_updated_at_idx ON sermons(updated_at DESC);

-- Create trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for auto-updating updated_at
DROP TRIGGER IF EXISTS update_sermons_updated_at ON sermons;
CREATE TRIGGER update_sermons_updated_at
  BEFORE UPDATE ON sermons
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
