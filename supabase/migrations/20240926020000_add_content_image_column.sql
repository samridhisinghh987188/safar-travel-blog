-- Create a function to add the content_image column if it doesn't exist
CREATE OR REPLACE FUNCTION public.ensure_content_image_column()
RETURNS void AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'blog_posts' 
    AND column_name = 'content_image'
  ) THEN
    ALTER TABLE public.blog_posts 
    ADD COLUMN content_image TEXT;
    
    RAISE NOTICE 'Added content_image column to blog_posts table';
  ELSE
    RAISE NOTICE 'content_image column already exists in blog_posts table';
  END IF;
  
  RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Call the function to ensure the column exists
SELECT public.ensure_content_image_column();
