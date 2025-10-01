# Storage Setup Guide

## Problem: Storage Bucket Errors

If you're seeing any of these errors when trying to upload images:
- `"Bucket 'blogimage' does not exist"`
- `"new row violates row-level security policy"`
- `"StorageApiError: new row violates row-level security policy"`

This means the Supabase storage bucket needs to be created manually due to permission restrictions.

## Quick Fix

### Option 1: Manual Creation in Supabase Dashboard (Recommended)

**This is the most reliable method due to permission restrictions:**

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Storage** in the sidebar
4. Click **Create a new bucket**
5. Name it: `blogimage`
6. Make it **Public**
7. Set allowed MIME types to: `image/*`
8. Set file size limit to: `5MB`
9. Click **Create bucket**

### Option 2: Run SQL Migration

If you have access to the SQL editor in Supabase:

```sql
-- Create the storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('blogimage', 'blogimage', true)
ON CONFLICT (id) DO UPDATE 
SET public = EXCLUDED.public,
    name = EXCLUDED.name;

-- Set bucket configuration
UPDATE storage.buckets 
SET 
  allowed_mime_types = '{"image/*"}',
  file_size_limit = 5242880,
  public = true
WHERE id = 'blogimage';
```

## Verification

After setup, you should see:
- ✅ No more "bucket does not exist" errors
- ✅ Image uploads work properly
- ✅ Images display correctly in the blog

## Troubleshooting

### Still getting errors?

1. **Check Supabase credentials**: Make sure your `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are correct
2. **Check permissions**: Ensure your Supabase project has storage enabled
3. **Clear browser cache**: Sometimes cached errors persist
4. **Check network**: Make sure you can reach Supabase servers

### Common Issues

- **"Storage not enabled"**: Enable storage in your Supabase project settings
- **"Insufficient permissions"**: Check your RLS policies and API key permissions
- **"Network error"**: Check your internet connection and firewall settings

## Need Help?

If you're still having issues:
1. Check the browser console for detailed error messages
2. Verify your Supabase project is active and accessible
3. Try creating the bucket manually in the Supabase dashboard
4. Contact support with the specific error messages you're seeing
