-- Add author column to blog_posts table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'blog_posts' AND column_name = 'author') THEN
        ALTER TABLE blog_posts ADD COLUMN author TEXT;
    END IF;
END $$;

-- Add isPrivate column to blog_posts table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'blog_posts' AND column_name = 'isPrivate') THEN
        ALTER TABLE blog_posts ADD COLUMN "isPrivate" BOOLEAN DEFAULT false;
    END IF;
END $$;

-- Update existing posts without author to have a default author
UPDATE blog_posts 
SET author = 'Anonymous User' 
WHERE author IS NULL OR author = '';

-- Set all existing posts to public by default
UPDATE blog_posts 
SET "isPrivate" = false 
WHERE "isPrivate" IS NULL;
