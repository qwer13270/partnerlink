-- Notifications table for activity events (inquiry, visited, deal)
CREATE TABLE IF NOT EXISTS notifications (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type       TEXT        NOT NULL,   -- 'new_inquiry' | 'visited' | 'deal'
  title      TEXT        NOT NULL,
  href       TEXT        NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS notifications_user_id_created_at
  ON notifications(user_id, created_at DESC);
