-- Reading History Migration
-- Run this in the Supabase SQL editor

CREATE TABLE IF NOT EXISTS reading_history (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    book_id text NOT NULL,
    chapter integer NOT NULL,
    section_index integer NOT NULL,
    total_sections integer NOT NULL DEFAULT 1,
    version text NOT NULL DEFAULT 'web',
    read_at timestamptz DEFAULT now() NOT NULL,
    UNIQUE(user_id, book_id, chapter, section_index, version)
);

ALTER TABLE reading_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own history" ON reading_history
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own history" ON reading_history
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own history" ON reading_history
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own history" ON reading_history
    FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_reading_history_user_book
    ON reading_history(user_id, book_id, chapter);
