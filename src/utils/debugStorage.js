import { supabase } from '../lib/supabase';

const BUCKET_NAME = 'blogimages'; // Updated to match the correct bucket name

export const checkStorageConfig = async () => {
  try {
    console.log('Checking Supabase storage configuration...');
    
    // List all buckets
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('Error listing buckets:', bucketsError);
      return { success: false, error: bucketsError };
    }
    
    console.log('Available buckets:', buckets);
    
    // Check if our target bucket exists
    const targetBucket = buckets.find(b => b.name === BUCKET_NAME);
    
    if (!targetBucket) {
      console.error(`Bucket '${BUCKET_NAME}' not found in storage`);
      return { success: false, error: `Bucket '${BUCKET_NAME}' not found` };
    }
    
    console.log(`Bucket '${BUCKET_NAME}' found:`, targetBucket);
    
    // List files in the bucket
    const { data: files, error: filesError } = await supabase.storage
      .from(BUCKET_NAME)
      .list();
    
    if (filesError) {
      console.error('Error listing files in bucket:', filesError);
      return { success: false, error: filesError };
    }
    
    console.log(`Files in bucket '${BUCKET_NAME}':`, files);
    
    // Test getting public URL for a file (if any exists)
    if (files.length > 0) {
      const testFile = files[0];
      const { data: { publicUrl } } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(testFile.name);
      
      console.log(`Test file '${testFile.name}' public URL:`, publicUrl);
      
      // Test if the URL is accessible
      try {
        const response = await fetch(publicUrl, { method: 'HEAD' });
        console.log(`Test file access - Status: ${response.status} ${response.statusText}`);
        
        if (!response.ok) {
          console.error('Failed to access test file. The file might not be publicly accessible.');
          return { 
            success: false, 
            error: `File access failed with status ${response.status}`,
            publicUrlTest: {
              url: publicUrl,
              accessible: false,
              status: response.status
            }
          };
        }
        
        return { 
          success: true, 
          bucket: targetBucket,
          fileCount: files.length,
          publicUrlTest: {
            url: publicUrl,
            accessible: true,
            status: response.status
          }
        };
      } catch (error) {
        console.error('Error testing file access:', error);
        return { 
          success: false, 
          error: error.message,
          publicUrlTest: {
            url: publicUrl,
            accessible: false,
            error: error.message
          }
        };
      }
    }
    
    return { 
      success: true, 
      bucket: targetBucket,
      fileCount: 0,
      message: 'Bucket is empty. No files to test.'
    };
    
  } catch (error) {
    console.error('Error checking storage configuration:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
};

// Run the check when this module is imported
console.log('Running storage configuration check...');
checkStorageConfig().then(result => {
  console.log('Storage configuration check complete:', result);
});

export default checkStorageConfig;
