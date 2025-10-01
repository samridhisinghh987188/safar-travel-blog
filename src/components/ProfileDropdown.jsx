import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, User, Loader2 } from 'lucide-react';

const ProfileDropdown = () => {
  const { user, loading, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const handleSignOut = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await signOut();
      setIsOpen(false);
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (loading) {
    return (
      <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
        <Loader2 className="w-5 h-5 text-white animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center space-x-4">
        <Link 
          to="/?auth=signin" 
          className="px-4 py-2 text-sm font-medium text-white hover:text-blue-200 transition-colors"
        >
          Sign In
        </Link>
        <Link 
          to="/?auth=signup"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
        >
          Sign Up
        </Link>
      </div>
    );
  }

  return (
    <div className="relative z-50" ref={dropdownRef}>
      <div className="relative">
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
          className="flex items-center justify-center w-10 h-10 rounded-full bg-white/20 text-white font-medium text-lg hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-blue-600 transition-all duration-200 border border-white/20"
          aria-haspopup="true"
          aria-expanded={isOpen}
        >
          {user.username?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
        </button>

        {isOpen && (
          <div 
            className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-xl py-1 ring-1 ring-black/5 z-50"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 py-2 border-b border-gray-200">
              <p className="text-sm font-medium text-gray-700">
                Welcome, {user.username || 'User'}
                {user.isDemo && (
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                    Demo
                  </span>
                )}
              </p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
              {user.isDemo && (
                <p className="text-xs text-green-600 mt-1">
                  🚀 Exploring with demo account
                </p>
              )}
            </div>
            <Link
              to="/profile"
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={() => setIsOpen(false)}
            >
              <User className="w-4 h-4 mr-2" />
              Your Profile
            </Link>
            <button
              onClick={handleSignOut}
              className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign out
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileDropdown;
