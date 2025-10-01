-- Enable Row Level Security on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Allow public access to storage.objects
CREATE POLICY "Public Access" ON storage.objects
  FOR SELECT USING (bucket_id = 'blogimage');

-- Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload files" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'blogimage');

-- Allow users to update their own files
CREATE POLICY "Users can update their own files" ON storage.objects
  FOR UPDATE USING (auth.uid() = owner)
  WITH CHECK (bucket_id = 'blogimage');

-- Allow users to delete their own files
CREATE POLICY "Users can delete their own files" ON storage.objects
  FOR DELETE USING (auth.uid() = owner AND bucket_id = 'blogimage');

-- Set up storage bucket if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE name = 'blogimage') THEN
    INSERT INTO storage.buckets (id, name, public) VALUES ('blogimage', 'blogimage', true);
  END IF;
END $$;
