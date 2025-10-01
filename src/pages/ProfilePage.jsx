import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // Get the current authenticated user
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !authUser) {
          navigate('/?auth=signin');
          return;
        }

        // Try to get the user's profile
        try {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authUser.id)
            .single();

          if (profileError) throw profileError;

          setUser({
            ...authUser,
            username: profile?.username || authUser.email.split('@')[0],
            full_name: profile?.full_name || '',
            avatar_url: profile?.avatar_url || '',
            created_at: profile?.created_at || new Date().toISOString()
          });
        } catch (profileError) {
          console.warn('Profile not found, using auth user data:', profileError);
          // If profile doesn't exist, use auth user data
          setUser({
            ...authUser,
            username: authUser.email.split('@')[0],
            full_name: authUser.user_metadata?.full_name || '',
            avatar_url: authUser.user_metadata?.avatar_url || '',
            created_at: authUser.created_at
          });
        }
      } catch (error) {
        console.error('Error in fetchUser:', error);
        // If there's an error, still set basic user data from auth if available
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser) {
          setUser({
            ...authUser,
            username: authUser.email?.split('@')[0] || 'User',
            full_name: authUser.user_metadata?.full_name || '',
            avatar_url: authUser.user_metadata?.avatar_url || ''
          });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUser();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        navigate('/?auth=signin');
      } else if (event === 'SIGNED_IN' && session?.user) {
        fetchUser();
      }
    });

    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
        <div className="bg-gray-900 p-8 rounded-lg shadow-md max-w-md w-full text-center border border-gray-700">
          <h2 className="text-2xl font-bold text-white mb-4">Not Signed In</h2>
          <p className="text-gray-300 mb-6">You need to be signed in to view this page.</p>
          <button
            onClick={() => navigate('/?auth=signin')}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  // Format the account creation date
  const accountCreated = new Date(user.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="min-h-screen bg-black py-12 px-4 sm:px-6 lg:px-8 pt-20">
      <div className="max-w-3xl mx-auto">
        <div className="bg-gray-900 shadow-xl rounded-lg overflow-hidden border border-gray-700">
          {/* Profile Header */}
          <div className="px-6 py-8 bg-gradient-to-r from-gray-800 to-gray-900 text-white">
            <div className="flex items-center space-x-6">
              <div className="flex-shrink-0">
                <div className="h-20 w-20 rounded-full bg-blue-600 flex items-center justify-center text-3xl font-bold text-white">
                  {user.username?.charAt(0).toUpperCase() || 'U'}
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">{user.username || 'User'}</h1>
                <p className="text-gray-300">{user.email}</p>
                <p className="text-gray-400 text-sm mt-1">Member since {accountCreated}</p>
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="px-6 py-6">
            <h2 className="text-lg font-medium text-white mb-6">Account Information</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-400">Username</h3>
                <p className="mt-1 text-gray-200">{user.username || 'Not set'}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-400">Email Address</h3>
                <p className="mt-1 text-gray-200">{user.email}</p>
              </div>
              
              {user.full_name && (
                <div>
                  <h3 className="text-sm font-medium text-gray-400">Full Name</h3>
                  <p className="mt-1 text-gray-200">{user.full_name}</p>
                </div>
              )}
              
              <div className="pt-4 border-t border-gray-700">
                <h3 className="text-sm font-medium text-gray-400">Account Status</h3>
                <div className="mt-2 flex items-center">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900 text-green-300 border border-green-700">
                    Active
                  </span>
                  <span className="ml-2 text-sm text-gray-400">
                    Verified on {accountCreated}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-8 flex space-x-3">
              <button
                onClick={async () => {
                  await supabase.auth.signOut();
                  navigate('/');
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Sign out
              </button>
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="inline-flex items-center px-4 py-2 border border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-300 bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Back to top
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
