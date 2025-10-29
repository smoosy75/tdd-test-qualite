SET search_path TO app;

-- =========================================
-- Create table: posts
-- =========================================

CREATE TABLE IF NOT EXISTS posts (
    id SERIAL PRIMARY KEY,                     -- Unique identifier for each post
    user_id INTEGER NOT NULL,                  -- References the author/user of the post
    title VARCHAR(255) NOT NULL,               -- Post title
    content TEXT NOT NULL,                     -- Main content of the post
    image_url TEXT,                            -- Optional image attachment
    is_published BOOLEAN DEFAULT TRUE,         -- Visibility flag
    created_at TIMESTAMPTZ DEFAULT NOW(),      -- Creation timestamp
    updated_at TIMESTAMPTZ DEFAULT NOW()      -- Last update timestamp
);

-- =========================================
-- Optional: Create an index for faster lookups
-- =========================================
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON "posts" (user_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON "posts" (created_at);

-- =========================================
-- Trigger to auto-update updated_at on modification
-- =========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_update_posts_updated_at
BEFORE UPDATE ON "posts"
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();