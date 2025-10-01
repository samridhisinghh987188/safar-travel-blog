-- First, ensure the bucket exists in the storage.buckets table
INSERT INTO storage.buckets (id, name, public)
VALUES ('blogimage', 'blogimage', true)
ON CONFLICT (id) DO UPDATE 
SET public = EXCLUDED.public,
    name = EXCLUDED.name;

-- Create or replace the function that handles storage permissions
CREATE OR REPLACE FUNCTION public.handle_storage_permissions()
RETURNS TRIGGER AS $$
BEGIN
  -- Allow public access to all files in the blogimage bucket
  IF NEW.bucket_id = 'blogimage' THEN
    -- Allow public read access
    INSERT INTO storage.objects_public_access (bucket_id, object_name, action, role_name)
    VALUES (NEW.bucket_id, NEW.name, 'select', 'anon')
    ON CONFLICT (bucket_id, object_name, action, role_name) DO NOTHING;
    
    -- Allow authenticated users to upload/update/delete
    INSERT INTO storage.objects_public_access (bucket_id, object_name, action, role_name)
    SELECT NEW.bucket_id, NEW.name, action, 'authenticated'
    FROM unnest(ARRAY['insert', 'update', 'delete']::text[]) AS action
    ON CONFLICT (bucket_id, object_name, action, role_name) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_trigger 
    WHERE tgname = 'on_storage_objects_created'
  ) THEN
    CREATE TRIGGER on_storage_objects_created
    AFTER INSERT ON storage.objects
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_storage_permissions();
  END IF;
END $$;

-- Update existing objects with the correct permissions
INSERT INTO storage.objects_public_access (bucket_id, object_name, action, role_name)
SELECT 'blogimage', name, 'select', 'anon'
FROM storage.objects 
WHERE bucket_id = 'blogimage'
ON CONFLICT (bucket_id, object_name, action, role_name) DO NOTHING;

-- Set bucket policy to allow all operations
UPDATE storage.buckets 
SET 
  allowed_mime_types = '{"image/*"}',
  file_size_limit = 5 * 1024 * 1024,
  public = true,
  avif_autodetection = false,
  file_name_length_for_content_disposition = 100
WHERE id = 'blogimage';

-- Ensure the bucket is properly exposed in the API
NOTIFY pgrst, 'reload schema';
