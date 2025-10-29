SET search_path TO app;

DELETE FROM "comments";

-- Insert comments (assuming posts and users already exist)
INSERT INTO "comments" (post_id, user_id, content)
VALUES
    (1, 2, 'Great first post! Excited to see more.'),
    (1, 3, 'Welcome to the platform 🎉'),
    (2, 1, 'Thanks for the feedback! Working on new features soon.'),
    (3, 1, 'Loved your PostgreSQL tips — super useful!'),
    (3, 3, 'I totally agree about indexing strategies.'),
    (4, 2, 'Chill vibes, nice thoughts.'),
    (5, 1, 'Can’t wait to read the final version once published.');

-- Verify insert
SELECT * FROM "comments" ORDER BY id;