import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { clearGlobalData, migrateGlobalDataToUser } from '../utils/userStorage';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    
    const checkSession = async () => {
      try {
        console.log('AuthContext: Checking session...');
        
        // First check for demo session
        const isDemoMode = localStorage.getItem('isDemoMode') === 'true';
        const demoSession = localStorage.getItem('demoSession');
        
        console.log('AuthContext: isDemoMode =', isDemoMode);
        console.log('AuthContext: demoSession =', demoSession);
        
        if (isDemoMode && demoSession) {
          // Use demo session
          const demoUser = JSON.parse(demoSession);
          console.log('AuthContext: Setting demo user:', demoUser);
          if (mounted) {
            setUser(demoUser);
            // Clear any global data when switching to demo
            clearGlobalData();
          }
        } else {
          // Check regular Supabase session
          console.log('AuthContext: Checking Supabase session...');
          const { data: { session }, error } = await supabase.auth.getSession();
          if (error) throw error;
          
          console.log('AuthContext: Supabase session:', session);
          if (mounted) {
            const newUser = session?.user ?? null;
            setUser(newUser);
            
            // If user just logged in, migrate any global data to user-specific storage
            if (newUser && newUser.id) {
              migrateGlobalDataToUser(newUser.id);
            }
          }
        }
      } catch (error) {
        console.error('Error getting session:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    checkSession();

    // Listen for changes in auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (mounted) {
          // Don't override demo session with Supabase auth changes
          const isDemoMode = localStorage.getItem('isDemoMode') === 'true';
          if (!isDemoMode) {
            setUser(session?.user ?? null);
          }
          setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    const isDemoMode = localStorage.getItem('isDemoMode') === 'true';
    
    if (isDemoMode) {
      // Clear demo session
      localStorage.removeItem('demoSession');
      localStorage.removeItem('isDemoMode');
      // Clear any global data
      clearGlobalData();
      setUser(null);
    } else {
      // Regular Supabase sign out
      await supabase.auth.signOut();
      // Clear any global data
      clearGlobalData();
    }
  };

  const refreshSession = async () => {
    console.log('AuthContext: Refreshing session...');
    const isDemoMode = localStorage.getItem('isDemoMode') === 'true';
    const demoSession = localStorage.getItem('demoSession');
    
    if (isDemoMode && demoSession) {
      const demoUser = JSON.parse(demoSession);
      console.log('AuthContext: Refreshing with demo user:', demoUser);
      setUser(demoUser);
    }
  };

  const value = {
    user,
    loading,
    signOut,
    refreshSession,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};

export default AuthContext;
