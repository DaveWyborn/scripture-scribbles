# Supabase Setup Guide for Scripture Scribbles

## Step 1: Create Account & Project

1. Go to https://supabase.com
2. Click "Start your project"
3. Sign up with GitHub (recommended) or email
4. Create new organization: "Scripture Scribbles" (or your preference)
5. Create new project:
   - **Name:** scripture-scribbles
   - **Database Password:** (generate strong password, save it somewhere safe)
   - **Region:** Choose closest to you (UK probably)
   - **Pricing Plan:** Free (plenty for development and first 10k users)
6. Click "Create new project"
7. Wait 2-3 minutes for project to be created

## Step 2: Get API Credentials

Once project is created:

1. In Supabase dashboard, click **Settings** (gear icon in sidebar)
2. Click **API** in settings menu
3. You'll see:

```
Project URL:
https://xxxxxxxxxxxxx.supabase.co

API Keys:
- anon public (this one is safe to use in browser)
- service_role (NEVER expose in browser, only server-side)
```

4. **Copy these and save to file:**

Create file: `/Users/davewyborn/Documents/2_Obsidian/supabase-credentials.txt`

```
PROJECT_URL=https://xxxxxxxxxxxxx.supabase.co
ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ey....(very long string)
```

## Step 3: Set Up Database Schema

1. In Supabase dashboard, click **SQL Editor** (in sidebar)
2. Click **New query**
3. Copy and paste the SQL below
4. Click **Run** (or Ctrl/Cmd + Enter)

```sql
-- Users table is handled automatically by Supabase Auth
-- We just need to create tables for our app data

-- Annotations table
CREATE TABLE annotations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  bible_version text DEFAULT 'WEB' NOT NULL,
  annotation_set text DEFAULT 'Study' NOT NULL,
  book_id text NOT NULL,
  data jsonb NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE annotations ENABLE ROW LEVEL SECURITY;

-- Policies: Users can only access their own annotations
CREATE POLICY "Users can view their own annotations"
  ON annotations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own annotations"
  ON annotations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own annotations"
  ON annotations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own annotations"
  ON annotations FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX annotations_user_id_idx ON annotations(user_id);
CREATE INDEX annotations_book_id_idx ON annotations(book_id);
CREATE INDEX annotations_version_set_idx ON annotations(bible_version, annotation_set);
CREATE INDEX annotations_updated_at_idx ON annotations(updated_at DESC);

-- Sermons table (for future sermon notes feature)
CREATE TABLE sermons (
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

-- Indexes for sermons
CREATE INDEX sermons_user_id_idx ON sermons(user_id);
CREATE INDEX sermons_date_idx ON sermons(date DESC);
CREATE INDEX sermons_updated_at_idx ON sermons(updated_at DESC);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to auto-update updated_at
CREATE TRIGGER update_annotations_updated_at
  BEFORE UPDATE ON annotations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sermons_updated_at
  BEFORE UPDATE ON sermons
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create a view for user stats (optional, helpful for analytics later)
CREATE VIEW user_annotation_stats AS
SELECT
  user_id,
  bible_version,
  annotation_set,
  COUNT(*) as annotation_count,
  MAX(updated_at) as last_updated
FROM annotations
GROUP BY user_id, bible_version, annotation_set;
```

5. You should see "Success. No rows returned"
6. Click **Database** in sidebar to verify tables were created:
   - You should see: `annotations`, `sermons`

## Step 4: Enable Authentication Providers

1. Click **Authentication** in sidebar
2. Click **Providers**
3. **Email** should already be enabled (default)
4. **Optional:** Enable Google OAuth:
   - Toggle "Google" on
   - You'll need Google OAuth credentials (can do this later)
   - For now, just email auth is fine

## Step 5: Configure Email Templates (Optional)

1. In **Authentication** → **Email Templates**
2. You can customize:
   - Confirm signup email
   - Magic link email
   - Password reset email
3. **For now:** Leave as default, customize later

## Step 6: Test Database Connection

1. In Supabase dashboard, click **Table Editor**
2. Select `annotations` table
3. Click **Insert row**
4. Try adding a test row:
   - user_id: Leave blank for now
   - bible_version: WEB
   - annotation_set: Test
   - book_id: matthew
   - data: `{"test": "data"}`
5. Click **Save**
6. If it saves, database is working!
7. **Delete the test row** (click row, click delete)

## Step 7: Share Credentials with Claude

**Option A: File (Secure)**
Create file I can read:
```
/Users/davewyborn/Documents/2_Obsidian/supabase-credentials.txt
```

With content:
```
PROJECT_URL=https://xxxxxxxxxxxxx.supabase.co
ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Option B: Tell me in chat**
Just paste them in next session.

**Note:** The anon key is safe to expose in browser code. It's designed to be public. Row Level Security policies protect user data.

## What I'll Do Next Session

Once you share credentials, I'll:

1. Add Supabase client to `scripture-scribbles-reader.html`
2. Implement sign-up/sign-in UI
3. Connect annotations to Supabase
4. Test sync across devices
5. Verify Row Level Security works

## Troubleshooting

**If SQL fails:**
- Make sure you clicked "New query" (not editing an existing query)
- Make sure you copied ALL the SQL (it's long)
- Check for any error messages in red
- Try running each section separately (CREATE TABLE, then policies, then indexes)

**If you can't find API keys:**
- Settings → API → Should be right there
- Make sure project is fully created (can take 2-3 min)

**If you need help:**
- Supabase docs: https://supabase.com/docs
- Or just ask me next session!

## Expected Result

After completing these steps, you should have:

✅ Supabase project created
✅ API credentials saved
✅ Database schema created (annotations, sermons tables)
✅ Row Level Security enabled
✅ Ready for me to integrate

Total time: ~15-20 minutes

## Cost Check

**Free tier includes:**
- 500 MB database space (plenty for thousands of users)
- 50,000 monthly active users
- 1 GB file storage
- 2 GB bandwidth
- Unlimited API requests

**We won't hit limits until:**
- 10,000+ active users (realistic estimate)
- At which point, revenue from premium features should cover costs

**First paid tier:** $25/month (starts at 100K MAU)

You're safe on free tier for a long time!

