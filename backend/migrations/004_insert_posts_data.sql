SET search_path TO app;

DELETE FROM "posts";

-- Insert sample posts for existing users (user_id 1–3)
INSERT INTO "posts" (user_id, title, content, image_url, is_published)
VALUES
    (1, 'Welcome to My Blog', 'This is my first post on this new platform!', NULL, TRUE),
    (1, 'My Second Post', 'Here is another update — learning PostgreSQL migrations!', NULL, TRUE),
    (2, 'Tech Tips: PostgreSQL', 'In this post, I share my favorite PostgreSQL tips.', 'https://example.com/images/sql-tips.jpg', TRUE),
    (3, 'Weekend Thoughts', 'Just sharing some random weekend musings.', NULL, TRUE),
    (3, 'Draft Post', 'This post is still in draft mode.', NULL, FALSE);

-- Verify insert
SELECT * FROM posts ORDER BY id;