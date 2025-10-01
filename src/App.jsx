import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { ThemeProvider } from './components/theme-provider';
import { AuthProvider, useAuth } from './contexts/AuthContext';

import HomePage2 from './pages/HomePage2';
import Blog from './pages/Blog';
import BlogPostPage from './pages/BlogPostPage.new';
import ProfilePage from './pages/ProfilePage';
import Landing from './pages/Landing';
import Navbar from './components/Navbar';
import MyCalendar from './pages/MyCalendar';
import TripPlanning from './pages/TripPlanning';
import Herosection from './components/herosection';

// Layout component that includes the Navbar
const Layout = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-0">
        <Outlet />
      </main>
    </div>
  );
};

// Loading spinner component
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => {
    if (!loading) {
      setInitialLoad(false);
    }
  }, [loading]);

  if (loading || initialLoad) {
    return <LoadingSpinner />;
  }

  return user ? children : <Navigate to="/" replace state={{ from: window.location.pathname }} />;
};

// Public route component (for routes that should only be accessible when not logged in)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => {
    if (!loading) {
      setInitialLoad(false);
    }
  }, [loading]);

  if (loading || initialLoad) {
    return <LoadingSpinner />;
  }

  // If user is logged in, redirect to home, otherwise show the public content
  return user ? <Navigate to="/home" replace /> : children;
};

function AppContent() {
  const { user } = useAuth();
  
  return (
    <Routes>
      {/* Root path - redirect based on auth status */}
      <Route index element={
        user ? <Navigate to="/home" replace /> : <Landing />
      } />
      
      {/* Public routes */}
      <Route path="/landing" element={
        <PublicRoute>
          <Landing />
        </PublicRoute>
      } />
      
      {/* Protected routes */}
      <Route element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route path="/home" element={<HomePage2 />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:id" element={<BlogPostPage />} />
        <Route path="/calendar" element={<MyCalendar />} />
        <Route path="/trip-planning" element={<TripPlanning />} />
        <Route path="/map" element={<Herosection />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>
      
      {/* Auth redirects */}
      <Route path="/signin" element={<Navigate to="/?auth=signin" replace />} />
      <Route path="/signup" element={<Navigate to="/?auth=signup" replace />} />
      
      {/* Catch all other routes */}
      <Route path="*" element={
        <PublicRoute>
          <Navigate to="/" replace />
        </PublicRoute>
      } />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
