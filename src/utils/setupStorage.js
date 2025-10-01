import { supabase } from '../lib/supabase';
import { BUCKET_NAME } from './storage';

// Function to create storage bucket if it doesn't exist
export const setupStorage = async () => {
  try {
    console.log('Setting up storage configuration...');
    
    // Check if we can access storage
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.warn('Storage not accessible (this is OK for development):', listError.message);
      return { 
        success: true, // Don't fail the app
        warning: `Storage not configured: ${listError.message}`,
        skipStorage: true
      };
    }
    
    console.log('Available buckets:', buckets?.map(b => b.name) || 'none');
    console.log('Looking for bucket:', BUCKET_NAME);
    
    // Check if our bucket exists (with detailed logging)
    const bucketExists = buckets?.some(bucket => {
      console.log(`Checking bucket: "${bucket.name}" === "${BUCKET_NAME}"?`, bucket.name === BUCKET_NAME);
      return bucket.name === BUCKET_NAME;
    });
    
    console.log('Bucket exists check result:', bucketExists);
    
    if (!bucketExists) {
      console.log(`Bucket '${BUCKET_NAME}' not found.`);
      
      // Try to create the bucket, but handle permission errors gracefully
      try {
        console.log('Attempting to create bucket...');
        const { data: createData, error: createError } = await supabase.storage.createBucket(BUCKET_NAME, {
          public: true,
          allowedMimeTypes: ['image/*'],
          fileSizeLimit: 5 * 1024 * 1024 // 5MB
        });
        
        if (createError) {
          // Check if it's a permission error
          if (createError.message.includes('row-level security policy') || 
              createError.message.includes('permission') ||
              createError.message.includes('policy')) {
            console.warn('Cannot create bucket automatically due to permissions. App will work without image uploads.');
            return { 
              success: true, // Don't fail the app
              warning: 'PERMISSION_ERROR',
              message: 'Storage bucket needs to be created manually for image uploads to work.',
              skipStorage: true,
              instructions: {
                step1: 'Go to your Supabase Dashboard',
                step2: 'Navigate to Storage',
                step3: 'Click "Create a new bucket"',
                step4: 'Name it: "blogimage"',
                step5: 'Make it Public',
                step6: 'Set allowed MIME types to: image/*',
                step7: 'Set file size limit to: 5MB'
              }
            };
          }
          
          throw createError;
        }
        
        console.log(`Successfully created bucket '${BUCKET_NAME}'`);
      } catch (createError) {
        console.warn('Error creating bucket (app will continue without image uploads):', createError);
        return { 
          success: true, // Don't fail the app
          warning: `Failed to create storage bucket: ${createError.message}`,
          skipStorage: true,
          needsManualSetup: true
        };
      }
    } else {
      console.log(`Bucket '${BUCKET_NAME}' already exists`);
    }
    
    return { success: true };
    
  } catch (error) {
    console.warn('Storage setup failed (app will continue without image uploads):', error);
    return { 
      success: true, // Don't fail the app
      warning: error.message || 'Failed to setup storage configuration',
      skipStorage: true
    };
  }
};

// Run the setup when this module is imported
// setupStorage().then(console.log);
