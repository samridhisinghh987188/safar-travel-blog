import { setupStorage } from './utils/setupStorage';

// Initialize storage when this module is imported
export const initStorage = async () => {
  console.log('Initializing storage...');
  const result = await setupStorage();
  
  if (result.success) {
    if (result.warning || result.skipStorage) {
      // Reduce console noise - only show important info
      console.info('Storage: Image uploads disabled (permissions required)');
      // Uncomment the line below if you need setup instructions
      // if (result.instructions) console.log('Setup instructions:', result.instructions);
    } else {
      console.log('Storage initialized successfully');
      if (result.created) {
        console.log(`Created new bucket: ${result.bucketName}`);
      }
    }
  } else {
    console.warn('Storage initialization failed - app will work without image uploads');
  }
  
  return result;
};

// Run the initialization
export default initStorage();
