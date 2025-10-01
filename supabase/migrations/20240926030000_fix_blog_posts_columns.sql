-- Drop the existing function if it exists
DROP FUNCTION IF EXISTS public.ensure_content_image_column();

-- Add content_image column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'blog_posts' 
    AND column_name = 'content_image'
  ) THEN
    ALTER TABLE public.blog_posts 
    ADD COLUMN content_image TEXT;
    
    RAISE NOTICE 'Added content_image column to blog_posts table';
  ELSE
    RAISE NOTICE 'content_image column already exists in blog_posts table';
  END IF;
END $$;

-- Add cover_image column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'blog_posts' 
    AND column_name = 'cover_image'
  ) THEN
    ALTER TABLE public.blog_posts 
    ADD COLUMN cover_image TEXT;
    
    -- Copy data from the 'image' column to 'cover_image' for backward compatibility
    UPDATE public.blog_posts 
    SET cover_image = image 
    WHERE image IS NOT NULL;
    
    RAISE NOTICE 'Added cover_image column to blog_posts table and migrated data from image column';
  ELSE
    RAISE NOTICE 'cover_image column already exists in blog_posts table';
  END IF;
END $$;
