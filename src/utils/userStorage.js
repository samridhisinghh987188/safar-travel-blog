// User-specific localStorage utility
// This ensures each user's data is completely isolated

export const getUserStorageKey = (key, userId) => {
  if (!userId) return null;
  return `user_${userId}_${key}`;
};

export const setUserData = (key, data, userId) => {
  if (!userId) {
    console.warn('No user ID provided for setUserData');
    return;
  }
  
  const storageKey = getUserStorageKey(key, userId);
  try {
    localStorage.setItem(storageKey, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving user data:', error);
  }
};

export const getUserData = (key, userId, defaultValue = null) => {
  if (!userId) {
    console.warn('No user ID provided for getUserData');
    return defaultValue;
  }
  
  const storageKey = getUserStorageKey(key, userId);
  try {
    const data = localStorage.getItem(storageKey);
    return data ? JSON.parse(data) : defaultValue;
  } catch (error) {
    console.error('Error loading user data:', error);
    return defaultValue;
  }
};

export const removeUserData = (key, userId) => {
  if (!userId) {
    console.warn('No user ID provided for removeUserData');
    return;
  }
  
  const storageKey = getUserStorageKey(key, userId);
  try {
    localStorage.removeItem(storageKey);
  } catch (error) {
    console.error('Error removing user data:', error);
  }
};

export const clearAllUserData = (userId) => {
  if (!userId) {
    console.warn('No user ID provided for clearAllUserData');
    return;
  }
  
  try {
    const keysToRemove = [];
    const userPrefix = `user_${userId}_`;
    
    // Find all keys for this user
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(userPrefix)) {
        keysToRemove.push(key);
      }
    }
    
    // Remove all user-specific keys
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    console.log(`Cleared ${keysToRemove.length} items for user ${userId}`);
  } catch (error) {
    console.error('Error clearing user data:', error);
  }
};

export const clearGlobalData = () => {
  try {
    // Clear old global keys that should be user-specific
    const globalKeysToRemove = [
      'savedTrips',
      'currentTrip',
      'blogPosts',
      'userPreferences'
    ];
    
    globalKeysToRemove.forEach(key => {
      if (localStorage.getItem(key)) {
        localStorage.removeItem(key);
        console.log(`Removed global key: ${key}`);
      }
    });
  } catch (error) {
    console.error('Error clearing global data:', error);
  }
};

export const migrateGlobalDataToUser = (userId) => {
  if (!userId) return;
  
  try {
    // Migrate old global data to user-specific storage
    const globalKeys = ['savedTrips', 'currentTrip'];
    
    globalKeys.forEach(key => {
      const globalData = localStorage.getItem(key);
      if (globalData) {
        // Move to user-specific storage
        setUserData(key, JSON.parse(globalData), userId);
        // Remove global version
        localStorage.removeItem(key);
        console.log(`Migrated ${key} to user-specific storage`);
      }
    });
  } catch (error) {
    console.error('Error migrating global data:', error);
  }
};
