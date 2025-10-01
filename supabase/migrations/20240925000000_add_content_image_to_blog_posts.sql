-- Add content_image column to blog_posts table
ALTER TABLE public.blog_posts 
ADD COLUMN IF NOT EXISTS content_image TEXT;
