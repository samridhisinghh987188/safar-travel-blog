-- Create the storage bucket if it doesn't exist
insert into storage.buckets (id, name, public)
values ('blogimage', 'blogimage', true)
on conflict (name) do nothing;

-- Enable Row Level Security on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, avatar_url)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'username', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Set up storage policies
DO $$
BEGIN
  -- Public read access
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'Public Access') THEN
    CREATE POLICY "Public Access" 
    ON storage.objects 
    FOR SELECT 
    USING (bucket_id = 'blogimage');
  END IF;

  -- Allow authenticated uploads
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'Authenticated Uploads') THEN
    CREATE POLICY "Authenticated Uploads" 
    ON storage.objects 
    FOR INSERT 
    TO authenticated 
    WITH CHECK (bucket_id = 'blogimage');
  END IF;

  -- Allow users to update their own files
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'Update Own Files') THEN
    CREATE POLICY "Update Own Files" 
    ON storage.objects 
    FOR UPDATE 
    USING (auth.uid() = owner)
    WITH CHECK (bucket_id = 'blogimage');
  END IF;

  -- Allow users to delete their own files
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'Delete Own Files') THEN
    CREATE POLICY "Delete Own Files" 
    ON storage.objects 
    FOR DELETE 
    USING (auth.uid() = owner AND bucket_id = 'blogimage');
  END IF;
END $$;
