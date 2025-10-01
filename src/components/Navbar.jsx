import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import ProfileDropdown from './ProfileDropdown';
import { MapPin } from 'lucide-react';

const Navbar = () => {
  const [currentTitle, setCurrentTitle] = useState('SAFAR');
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const { user, loading } = useAuth();

  // Toggle between SAFAR and सफर every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTitle(prev => prev === 'SAFAR' ? 'सफर' : 'SAFAR');
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Handle scroll to show/hide navbar
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY < lastScrollY || currentScrollY < 100) {
        // Scrolling up or near top - show navbar
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down and past 100px - hide navbar
        setIsVisible(false);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const scrollToHeroSection = (e) => {
    e.preventDefault();
    const heroSection = document.getElementById('hero-section');
    
    if (window.location.pathname !== '/home') {
      // If not on home page, navigate to home first
      window.location.href = '/home';
      // The actual scrolling will happen after the page loads
      sessionStorage.setItem('shouldScrollToHero', 'true');
    } else if (heroSection) {
      // If already on home page, just scroll to hero section
      heroSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <motion.nav 
      className="fixed top-0 left-0 right-0 z-[100] bg-transparent"
      initial={{ y: 0 }}
      animate={{ y: isVisible ? 0 : -100 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <Link to="/home" className="flex items-center">
              <motion.div
                className="text-2xl font-bold"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <motion.span 
                  key={currentTitle}
                  className="font-['Pacifico'] text-3xl text-white block min-w-[120px] text-center text-shadow"
                >
                  {currentTitle}
                </motion.span>
              </motion.div>
            </Link>
          </div>

          <div className="hidden md:block">
            <div className="flex items-center space-x-8">
              <Link to="/home" className="text-white hover:text-gray-200 text-sm font-medium">
                Home
              </Link>
              <Link to="/blog" className="text-white hover:text-gray-200 text-sm font-medium">
                Blog
              </Link>
              <Link to="/calendar" className="text-white hover:text-gray-200 text-sm font-medium">
                Calendar
              </Link>
              <Link to="/trip-planning" className="text-white hover:text-gray-200 text-sm font-medium">
                Trip Planning
              </Link>
              <Link to="/map" className="text-white hover:text-gray-200 text-sm font-medium">Map</Link>
              <Link to="/profile" className="text-white hover:text-gray-200 text-sm font-medium">Profile</Link>
              
            </div>
          </div>
          
          <div className="flex items-center">
            <div className="relative">
              {!loading ? (
                <ProfileDropdown />
              ) : (
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white/50 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
