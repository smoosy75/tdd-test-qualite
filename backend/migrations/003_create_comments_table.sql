SET search_path TO app;

-- Create the comments table
CREATE TABLE IF NOT EXISTS comments (
    id SERIAL PRIMARY KEY,                     -- Unique identifier for each comment
    post_id INTEGER NOT NULL,                  -- References the post this comment belongs to
    user_id INTEGER NOT NULL,                  -- References the user who made the comment
    content TEXT NOT NULL,                     -- Comment text
    created_at TIMESTAMPTZ DEFAULT NOW(),      -- Creation timestamp
    updated_at TIMESTAMPTZ DEFAULT NOW(),      -- Last update timestamp

    -- Foreign key constraints
    CONSTRAINT fk_comments_post
        FOREIGN KEY (post_id)
        REFERENCES "posts" (id)
        ON DELETE cascade
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON "comments" (post_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON "comments" (user_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON "comments" (created_at);

-- Create trigger function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_comments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for comments table
DROP TRIGGER IF EXISTS trigger_update_comments_updated_at ON comments;

CREATE TRIGGER trigger_update_comments_updated_at
BEFORE UPDATE ON comments
FOR EACH ROW
EXECUTE FUNCTION update_comments_updated_at();