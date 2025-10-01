import { supabase } from '../lib/supabase';

// Make sure this matches exactly with your Supabase storage bucket name
export const BUCKET_NAME = 'blogimage';  // Matches the bucket name in Supabase storage

// Re-export supabase storage for convenience
export const storage = supabase.storage;

// Function to check storage configuration
export const checkStorageConfig = async () => {
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.error('Error fetching buckets:', error);
      return { success: false, error: error.message };
    }
    
    console.log('Available buckets:', buckets.map(b => b.name));
    
    const bucketExists = buckets.some(bucket => bucket.name === BUCKET_NAME);
    
    if (!bucketExists) {
      console.error(`Bucket '${BUCKET_NAME}' not found in storage`);
      return { success: false, error: `Bucket '${BUCKET_NAME}' not found` };
    }
    
    return { success: true };
  } catch (err) {
    console.error('Error checking storage config:', err);
    return { success: false, error: err.message };
  }
};

/**
 * Get the correct URL for an image in Supabase storage
 * Handles multiple URL formats and provides fallbacks
 */
export const getImageUrl = (path) => {
  try {
    // Return empty string if no path is provided
    if (!path) {
      console.warn('getImageUrl: No path provided');
      return '';
    }

    // If it's already a full URL, return it as is
    if (typeof path === 'string' && path.startsWith('http')) {
      return path;
    }

    // Ensure path is a string
    const pathStr = String(path).trim();
    if (!pathStr) {
      console.warn('getImageUrl: Empty path after conversion');
      return '';
    }

    // Clean up the path (remove any leading/trailing slashes and spaces)
    const cleanPath = pathStr.replace(/^\/+|\/+$/g, '');
    if (!cleanPath) {
      console.warn('getImageUrl: Empty path after cleaning');
      return '';
    }

    // Get the project URL from environment variable or use default
    const projectUrl = import.meta.env.VITE_SUPABASE_URL || 'https://eoayrogsrkcvyinasvol.supabase.co';
    const cleanProjectUrl = projectUrl.replace(/\/storage\/v1$/, '').replace(/\/+$/, '');
    
    // Generate the public URL using the correct Supabase storage URL pattern
    const publicUrl = `${cleanProjectUrl}/storage/v1/object/public/${BUCKET_NAME}/${cleanPath}`;
    
    // Verify the URL is well-formed
    new URL(publicUrl);
    
    // For debugging
    if (process.env.NODE_ENV === 'development') {
      console.log('Image URL generated:', {
        originalPath: path,
        cleanPath,
        publicUrl,
        bucket: BUCKET_NAME,
        projectUrl: cleanProjectUrl
      });
    }
    
    return publicUrl;
    
  } catch (error) {
    console.error('Error in getImageUrl:', {
      error: error.message,
      path,
      bucket: BUCKET_NAME,
      stack: error.stack
    });
    return '';
  }
};

export const uploadImage = async (file) => {
  try {
    console.log('Starting image upload...');
    
    // Validate file
    if (!file) {
      throw new Error('No file provided');
    }
    
    // Generate a unique filename with the correct extension
    const fileExt = file.name.split('.').pop().toLowerCase();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    
    console.log('Uploading file:', {
      originalName: file.name,
      newName: fileName,
      type: file.type,
      size: file.size,
      bucket: BUCKET_NAME
    });
    
    // Skip bucket existence check since it was working before
    console.log(`Proceeding with upload to bucket: ${BUCKET_NAME}`);
    
    // 2. Upload the file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type || 'image/jpeg' // Default to jpeg if type not provided
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw new Error(`Upload failed: ${uploadError.message}`);
    }
    
    // 3. Get the public URL
    const publicUrl = getImageUrl(fileName);
    
    console.log('Upload successful!', {
      path: fileName,
      publicUrl: publicUrl,
      bucket: BUCKET_NAME,
      uploadData: uploadData
    });
    
    // 4. Verify the file is accessible (with retry logic)
    const maxRetries = 3;
    let retryCount = 0;
    let isAccessible = false;
    
    while (retryCount < maxRetries && !isAccessible) {
      try {
        const response = await fetch(publicUrl, { 
          method: 'HEAD',
          cache: 'no-store' // Prevent caching
        });
        
        console.log(`Access check attempt ${retryCount + 1}:`, {
          status: response.status,
          statusText: response.statusText,
          url: publicUrl
        });
        
        if (response.ok) {
          isAccessible = true;
          console.log('Image is accessible at:', publicUrl);
        } else if (response.status === 404 && retryCount < maxRetries - 1) {
          // Wait a bit before retrying (exponential backoff)
          const delay = Math.pow(2, retryCount) * 1000;
          console.log(`File not found yet, retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      } catch (error) {
        console.warn(`Access check error (attempt ${retryCount + 1}):`, error.message);
        if (retryCount === maxRetries - 1) {
          console.warn('Max retries reached, continuing anyway...');
        } else {
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      retryCount++;
    }
    
    if (!isAccessible) {
      console.warn('Warning: Could not verify image accessibility after multiple attempts');
    }
    
    // Return the file name (path) to be stored in the database
    return fileName;
    
  } catch (error) {
    console.error('Error in uploadImage:', error);
    throw error;
  }
};

// Delete an image from storage
export const deleteImage = async (path) => {
  if (!path) return true; // Nothing to delete
  
  try {
    console.log('Deleting image:', path);
    
    // Extract just the filename from the path if it's a full URL
    const fileName = path.startsWith('http') 
      ? path.split('/').pop()
      : path;
    
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([fileName]);
    
    if (error) {
      console.error('Error deleting image:', error);
      throw error;
    }
    
    console.log('Successfully deleted image:', fileName);
    return true;
  } catch (error) {
    console.error('Error in deleteImage:', error);
    throw error;
  }
};
