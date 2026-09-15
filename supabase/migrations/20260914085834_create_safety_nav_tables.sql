/*
# Create tables for women-focused smart safety navigation platform

This is a single-tenant app with no sign-in screen. All data is intentionally public/shared,
so policies use TO anon, authenticated with USING (true).

## New Tables

1. community_reports
   - Stores user-submitted safety reports (broken streetlight, blocked road, etc.)
   - Columns: id, type, description, lat, lng, location_name, reported_by, confirmations, created_at, status

2. chat_messages
   - Stores real-time community chat messages
   - Columns: id, username, message, created_at

3. chat_presence
   - Tracks which users are currently online in the chat
   - Columns: id, username, last_seen, is_online

## Security
- RLS enabled on all tables
- All tables allow anon + authenticated CRUD (single-tenant, no auth)
*/

-- Community reports table
CREATE TABLE IF NOT EXISTS community_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  description text,
  lat double precision NOT NULL,
  lng double precision NOT NULL,
  location_name text,
  reported_by text NOT NULL DEFAULT 'Anonymous',
  confirmations integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE community_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_reports" ON community_reports;
CREATE POLICY "anon_select_reports" ON community_reports FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_reports" ON community_reports;
CREATE POLICY "anon_insert_reports" ON community_reports FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_reports" ON community_reports;
CREATE POLICY "anon_update_reports" ON community_reports FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_reports" ON community_reports;
CREATE POLICY "anon_delete_reports" ON community_reports FOR DELETE
  TO anon, authenticated USING (true);

-- Chat messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text NOT NULL,
  message text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_chat" ON chat_messages;
CREATE POLICY "anon_select_chat" ON chat_messages FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_chat" ON chat_messages;
CREATE POLICY "anon_insert_chat" ON chat_messages FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_chat" ON chat_messages;
CREATE POLICY "anon_delete_chat" ON chat_messages FOR DELETE
  TO anon, authenticated USING (true);

-- Chat presence table
CREATE TABLE IF NOT EXISTS chat_presence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text NOT NULL UNIQUE,
  last_seen timestamptz DEFAULT now(),
  is_online boolean NOT NULL DEFAULT true
);

ALTER TABLE chat_presence ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_presence" ON chat_presence;
CREATE POLICY "anon_select_presence" ON chat_presence FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_presence" ON chat_presence;
CREATE POLICY "anon_insert_presence" ON chat_presence FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_presence" ON chat_presence;
CREATE POLICY "anon_update_presence" ON chat_presence FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_presence" ON chat_presence;
CREATE POLICY "anon_delete_presence" ON chat_presence FOR DELETE
  TO anon, authenticated USING (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON community_reports (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_presence_online ON chat_presence (is_online);
