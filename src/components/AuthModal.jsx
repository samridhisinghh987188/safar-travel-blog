import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export default function AuthModal({ isOpen, onClose, onSuccess, mode = 'signin' }) {
  const { refreshSession } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isSignUp, setIsSignUp] = useState(mode === 'signup');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Update isSignUp when mode prop changes
  useEffect(() => {
    setIsSignUp(mode === 'signup');
  }, [mode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      if (isSignUp) {
        // Handle sign up
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username,
            },
          },
        });
        
        if (signUpError) throw signUpError;
        
        // If email confirmation is required, show success message
        if (data?.user?.identities?.length === 0) {
          setError('User already registered');
          return;
        }
      } else {
        // Handle sign in
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (signInError) throw signInError;
      }
      
      if (onSuccess) onSuccess();
    } catch (error) {
      setError(error.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDemoLogin = async () => {
    setLoading(true);
    setError('');
    
    try {
      console.log('Starting demo login...');
      
      // Create a demo session without Supabase authentication
      // Store demo user data in localStorage
      const demoUser = {
        id: 'demo-user-' + Date.now(),
        email: 'demo@safar.com',
        username: 'Demo User',
        full_name: 'Demo User',
        avatar_url: '',
        created_at: new Date().toISOString(),
        isDemo: true
      };
      
      console.log('Demo user created:', demoUser);
      
      // Store demo session in localStorage
      localStorage.setItem('demoSession', JSON.stringify(demoUser));
      localStorage.setItem('isDemoMode', 'true');
      
      console.log('Demo session stored in localStorage');
      
      // Small delay to ensure localStorage is set
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Refresh the auth context to pick up the demo session
      if (refreshSession) {
        console.log('Refreshing auth session...');
        await refreshSession();
      }
      
      // Trigger success callback
      if (onSuccess) {
        console.log('Calling onSuccess callback');
        onSuccess();
      } else {
        console.log('No onSuccess callback provided');
      }
    } catch (error) {
      console.error('Demo login error:', error);
      setError('Failed to start demo session. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const toggleAuthMode = () => {
    setIsSignUp(!isSignUp);
    setError('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      
      {/* Modal */}
      <div className="relative bg-gray-900/95 backdrop-blur-md rounded-2xl shadow-2xl p-8 w-full max-w-md mx-auto border border-gray-700">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex flex-col justify-center">
          <h2 className="text-3xl font-bold text-white mb-6 text-center">
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-white mb-1">
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  placeholder="Choose a username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-2 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/90"
                  required={isSignUp}
                />
              </div>
            )}
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/90"
                required
              />
            </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-white mb-1">Password</label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/90"
              required
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-white">
                Remember me
              </label>
            </div>
            <div className="text-sm">
              <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                Forgot password?
              </a>
            </div>
          </div>
          {error && (
            <div className="text-red-500 text-sm text-center">
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-base font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors duration-200"
          >
            {loading 
              ? isSignUp 
                ? 'Creating Account...' 
                : 'Signing in...' 
              : isSignUp 
                ? 'Sign Up' 
                : 'Sign In'}
          </button>
          
          {/* Demo Account Button */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300/30"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-transparent text-gray-300">or</span>
            </div>
          </div>
          
          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-green-500 rounded-lg shadow-sm text-base font-semibold text-green-400 bg-green-500/10 hover:bg-green-500/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 transition-colors duration-200"
          >
            {loading ? 'Starting Demo...' : '🚀 Try Demo Account'}
          </button>
        </form>
        
        <p className="mt-6 text-center text-base text-white">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button 
            onClick={toggleAuthMode}
            className="font-semibold text-blue-200 hover:text-white transition-colors duration-200"
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </p>
        
        <p className="mt-2 text-center text-xs text-gray-400">
          Demo account lets you explore all features without registration
        </p>
        </div>
      </div>
    </div>
  );
}
