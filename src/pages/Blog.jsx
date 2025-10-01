import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, Plus, Trash2, Star, X, ImageIcon, Lock, Globe, User } from 'lucide-react';
import { getBlogPosts, addBlogPost, deleteBlogPost } from '../services/blogService';
import { getImageUrl, uploadImage } from '../utils/storage';
import { setupStorage } from '../utils/setupStorage';
import BlogForm from '../components/BlogForm';
import { toast } from 'react-hot-toast';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { setUserData, getUserData } from '../utils/userStorage';

// Initialize storage when the module loads
let storageInitialized = true; // Set to true since storage was working before
setupStorage().then(result => {
  console.log('Storage Initialization:', result);
  if (result.success) {
    storageInitialized = true;
    console.log('Storage is ready for use');
  } else {
    console.warn('Storage check failed, but proceeding anyway since bucket exists:', result.error);
    // Keep storageInitialized as true since you have existing posts
  }
});

const Blog = () => {
  const { user } = useAuth();
  
  // State management
  const [privateBlogPosts, setPrivateBlogPosts] = useState([]);
  const [publicBlogPosts, setPublicBlogPosts] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [activeSection, setActiveSection] = useState('private');

  // Star rating component
  const renderStars = (rating) => {
    if (!rating) return null;
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star 
            key={star} 
            className={`w-4 h-4 ${star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
          />
        ))}
      </div>
    );
  };

  // Handle post deletion
  const handleDeletePost = async (postId, isPrivate) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        if (isPrivate) {
          // Delete from user-specific private storage
          if (user?.id) {
            const updatedPrivatePosts = privateBlogPosts.filter(post => post.id !== postId);
            setPrivateBlogPosts(updatedPrivatePosts);
            setUserData('privateBlogPosts', updatedPrivatePosts, user.id);
          }
        } else {
          // Delete from public storage (Supabase)
          await deleteBlogPost(postId);
          setPublicBlogPosts(publicBlogPosts.filter(post => post.id !== postId));
        }
        toast.success('Post deleted successfully');
      } catch (error) {
        console.error('Error deleting post:', error);
        toast.error('Failed to delete post');
      }
    }
  };

  // Load blog posts based on user
  useEffect(() => {
    const loadBlogPosts = async () => {
      try {
        setIsLoading(true);
        
        // Load private posts for current user
        if (user?.id) {
          const userPrivatePosts = getUserData('privateBlogPosts', user.id, []);
          setPrivateBlogPosts(userPrivatePosts);
        } else {
          setPrivateBlogPosts([]);
        }
        
        // Load public posts from Supabase
        console.log('Fetching public blog posts from Supabase...');
        const publicPosts = await getBlogPosts();
        
        if (publicPosts && publicPosts.length > 0) {
          // Filter only public posts
          const filteredPublicPosts = publicPosts.filter(post => !post.isPrivate);
          setPublicBlogPosts(filteredPublicPosts);
          console.log('Loaded public posts:', filteredPublicPosts.length);
        } else {
          setPublicBlogPosts([]);
        }
        
      } catch (err) {
        console.error('Failed to load blog posts:', err);
        setError('Failed to load blog posts. Please refresh the page.');
      } finally {
        setIsLoading(false);
      }
    };

    loadBlogPosts();
  }, [user]);

  const handleAddBlogPost = async (newPost) => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!user?.id) {
        throw new Error('Please sign in to create blog posts.');
      }
      
      console.log('Adding new post:', newPost.title, 'Private:', newPost.isPrivate);
      
      if (newPost.isPrivate) {
        // Handle private post - store in user-specific localStorage
        const privatePostData = {
          id: Date.now().toString(),
          title: newPost.title,
          location: newPost.location,
          description: newPost.description,
          rating: newPost.rating || 0,
          image: newPost.coverPreview, // Use preview URL for private posts
          isPrivate: true,
          author: user.username || user.email,
          created_at: new Date().toISOString()
        };
        
        const updatedPrivatePosts = [...privateBlogPosts, privatePostData];
        setPrivateBlogPosts(updatedPrivatePosts);
        setUserData('privateBlogPosts', updatedPrivatePosts, user.id);
        
        toast.success('Private blog post created successfully!');
      } else {
        // Handle public post - store in Supabase
        let coverImagePath = newPost.coverImage;
        
        // Upload cover image if it's a file
        if (newPost.coverImage && typeof newPost.coverImage !== 'string') {
          try {
            console.log('Uploading cover image...');
            const uploadedPath = await uploadImage(newPost.coverImage);
            coverImagePath = uploadedPath;
            console.log('Cover image uploaded successfully:', uploadedPath);
          } catch (uploadError) {
            console.error('Error in cover image upload:', uploadError);
            throw new Error('Failed to process cover image. Please try again.');
          }
        }
        
        // Prepare post data for Supabase
        const postData = {
          title: newPost.title,
          location: newPost.location,
          description: newPost.description,
          rating: newPost.rating || 0,
          image: coverImagePath,
          isPrivate: false,
          author: user.username || user.email,
          created_at: new Date().toISOString()
        };
        
        // Add the post to Supabase
        const addedPost = await addBlogPost(postData);
        
        if (addedPost) {
          // Refresh public posts
          const updatedPublicPosts = await getBlogPosts();
          const filteredPublicPosts = updatedPublicPosts.filter(post => !post.isPrivate);
          setPublicBlogPosts(filteredPublicPosts);
          
          toast.success('Public blog post created successfully!');
        }
      }
      
      setIsFormOpen(false);
    } catch (err) {
      console.error('Failed to add blog post:', err);
      setError(err.message || 'Failed to add blog post. Please try again.');
      toast.error(err.message || 'Failed to add blog post');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && privateBlogPosts.length === 0 && publicBlogPosts.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            {typeof error === 'string' ? (
              <div className="text-red-500 text-center">
                <p className="text-xl font-semibold">Error loading blog posts</p>
                <p className="mt-2">{error}</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Refresh Page
                </button>
              </div>
            ) : (
              <div className="text-gray-900 dark:text-gray-100">
                {error}
                <div className="mt-6 flex gap-3">
                  <button 
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Refresh Page
                  </button>
                  <button 
                    onClick={() => setError(null)}
                    className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Render blog card component
  const renderBlogCard = (story, isPrivate = false) => (
    <Card key={story.id} className="group hover:shadow-lg transition-all duration-300 h-full flex flex-col overflow-hidden relative">
      {/* Privacy indicator */}
      <div className="absolute top-2 left-2 z-10">
        {isPrivate ? (
          <div className="flex items-center space-x-1 bg-gray-800/80 text-white px-2 py-1 rounded-full text-xs">
            <Lock className="w-3 h-3" />
            <span>Private</span>
          </div>
        ) : (
          <div className="flex items-center space-x-1 bg-blue-600/80 text-white px-2 py-1 rounded-full text-xs">
            <Globe className="w-3 h-3" />
            <span>Public</span>
          </div>
        )}
      </div>
      
      {/* Delete Button */}
      {user?.id && (isPrivate || story.author === (user.username || user.email)) && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleDeletePost(story.id, isPrivate);
          }}
          className="absolute top-2 right-2 z-10 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
          title="Delete post"
        >
          <X className="w-4 h-4" />
        </button>
      )}
      
      <Link to={`/blog/${story.id}`} className="flex flex-col h-full">
        {/* Cover Image Section */}
        <div className="w-full h-48 overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          {story.image ? (
            <img
              src={story.image}
              alt={story.title || 'Blog post cover'}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={(e) => {
                e.target.style.display = 'none';
                const placeholder = e.target.nextSibling;
                if (placeholder) placeholder.style.display = 'flex';
              }}
            />
          ) : null}
          <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800" style={{display: story.image ? 'none' : 'flex'}}>
            <div className="text-center p-4">
              <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50 text-gray-400" />
              <p className="text-sm text-gray-500 dark:text-gray-400">No image</p>
            </div>
          </div>
        </div>
        
        {/* Content Section */}
        <div className="p-6 flex-grow flex flex-col">
          {/* Title */}
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 transition-colors">
            {story.title}
          </h3>
          
          {/* Location and Date */}
          <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 mb-3">
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>{story.location}</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{new Date(story.created_at).toLocaleDateString()}</span>
            </div>
          </div>
          
          {/* Author */}
          {story.author && (
            <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 mb-3">
              <User className="h-4 w-4" />
              <span>by {story.author}</span>
            </div>
          )}
          
          {/* Rating */}
          <div className="mb-4">
            {renderStars(story.rating)}
          </div>
          
          {/* Description */}
          <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
            {story.description}
          </p>
          
          {/* Read More Link */}
          <div className="mt-auto pt-3 border-t border-gray-100 dark:border-gray-700">
            <div className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium inline-flex items-center">
              Read more
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      </Link>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Travel Blog</h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">Share your travel experiences</p>
          </div>
          {user && (
            <Button 
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => setIsFormOpen(true)}
              disabled={isLoading}
            >
              {isLoading ? 'Loading...' : (
                <><Plus className="mr-2 h-4 w-4" /> New Post</>
              )}
            </Button>
          )}
        </div>

        {!user && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-8">
            <p className="text-blue-800 dark:text-blue-200">
              Sign in to create and manage your own blog posts, or use the demo account to explore the features.
            </p>
          </div>
        )}

        {/* Section Tabs */}
        {user && (
          <div className="flex space-x-1 mb-8 bg-gray-200 dark:bg-gray-800 p-1 rounded-lg w-fit">
            <button
              onClick={() => setActiveSection('private')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeSection === 'private'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Lock className="w-4 h-4 inline mr-2" />
              My Private Posts ({privateBlogPosts.length})
            </button>
            <button
              onClick={() => setActiveSection('public')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeSection === 'public'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Globe className="w-4 h-4 inline mr-2" />
              Public Posts ({publicBlogPosts.length})
            </button>
          </div>
        )}

        {/* Private Posts Section */}
        {user && activeSection === 'private' && (
          <div className="mb-12">
            <div className="flex items-center mb-6">
              <Lock className="w-5 h-5 text-gray-600 dark:text-gray-400 mr-2" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Private Posts</h2>
            </div>
            
            {privateBlogPosts.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <Lock className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No private posts yet</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">Create your first private blog post to get started.</p>
                <Button onClick={() => setIsFormOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Private Post
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {privateBlogPosts.map((post) => renderBlogCard(post, true))}
              </div>
            )}
          </div>
        )}

        {/* Public Posts Section */}
        {(!user || activeSection === 'public') && (
          <div>
            <div className="flex items-center mb-6">
              <Globe className="w-5 h-5 text-blue-600 mr-2" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Public Posts</h2>
            </div>
            
            {publicBlogPosts.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <Globe className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No public posts yet</h3>
                <p className="text-gray-500 dark:text-gray-400">Be the first to share a public travel story!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {publicBlogPosts.map((post) => renderBlogCard(post, false))}
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Blog Form Modal */}
      <BlogForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleAddBlogPost}
        isSubmitting={isLoading}
      />
    </div>
  );
};

export default Blog;
