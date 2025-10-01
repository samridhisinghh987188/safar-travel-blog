import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Calendar, Star, ArrowUp } from 'lucide-react';
import { getBlogPostById } from '../services/blogService';
import { getImageUrl } from '../utils/storage';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix leaflet icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export default function BlogPostPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Process the post data to extract content image and generate URLs
  const processedPost = useMemo(() => {
    if (!post) return null;
    
    console.log('Processing post data:', {
      id: post.id,
      hasContentImage: !!(post.content_image || post.contentImage),
      hasContentImageInDescription: post.description?.includes('[CONTENT_IMAGE:'),
      descriptionLength: post.description?.length,
      postKeys: Object.keys(post)
    });
    
    try {
      // Extract content image and clean description
      let contentImage = post.content_image || post.contentImage;
      let description = post.description || '';
      
      // Check if the description contains a content image URL with our special marker
      const contentImageMatch = description.match(/^\s*\[CONTENT_IMAGE:(.*?)\](.*)/s);
      if (contentImageMatch) {
        contentImage = contentImageMatch[1].trim();
        description = contentImageMatch[2].trim();
        console.log('Extracted content image from description:', contentImage);
      }
      
      // Generate URLs for both cover and content images
      let imageUrl = null;
      let contentImageUrl = null;
      
      // Process cover image
      const coverPath = post.coverImage || post.image || post.cover_image;
      if (coverPath) {
        try {
          imageUrl = coverPath.startsWith('http') ? coverPath : getImageUrl(coverPath);
          console.log('Generated cover image URL:', imageUrl);
        } catch (err) {
          console.error('Error generating cover image URL:', err);
        }
      }
      
      // Process content image
      if (contentImage) {
        try {
          // Clean the content image path (remove any leading/trailing slashes and spaces)
          const cleanPath = contentImage.replace(/^\/+|\/+$/g, '').trim();
          
          // Generate the full public URL for the content image
          contentImageUrl = getImageUrl(cleanPath);
          
          console.log('Processed content image:', {
            originalPath: contentImage,
            cleanPath,
            url: contentImageUrl,
            bucket: 'blogimage',
            isFullUrl: contentImage.startsWith('http')
          });
        } catch (err) {
          console.error('Error processing content image:', {
            error: err.message,
            contentImage,
            stack: err.stack
          });
        }
      }
      
      const result = {
        ...post,
        description,
        contentImage,
        contentImageUrl,
        imageUrl
      };
      
      console.log('Processed post result:', result);
      return result;
      
    } catch (error) {
      console.error('Error processing post data:', error);
      return {
        ...post,
        description: post.description || '',
        contentImage: null,
        contentImageUrl: null,
        imageUrl: null
      };
    }
  }, [post]);

  // State for map location
  const [mapLocation, setMapLocation] = useState(null);

  // Geocode location name to coordinates
  useEffect(() => {
    const geocodeLocation = async () => {
      if (!processedPost?.location) {
        setMapLocation(null);
        return;
      }

      try {
        // Use OpenStreetMap Nominatim API for geocoding (free)
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(processedPost.location)}&limit=1`
        );
        const data = await response.json();
        
        if (data && data.length > 0) {
          setMapLocation({
            lat: parseFloat(data[0].lat),
            lng: parseFloat(data[0].lon),
            displayName: data[0].display_name
          });
        } else {
          setMapLocation(null);
        }
      } catch (error) {
        console.error('Error geocoding location:', error);
        setMapLocation(null);
      }
    };

    geocodeLocation();
  }, [processedPost?.location]);
  
  // Fetch post data when component mounts or ID changes
  useEffect(() => {
    let isMounted = true;
    
    const fetchPost = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        console.log('Fetching post with ID:', id);
        const postData = await getBlogPostById(id);
        
        if (!isMounted) return;
        
        if (!postData) {
          throw new Error('Post not found');
        }
        
        console.log('Fetched post data:', {
          ...postData,
          // Don't log the full description as it can be very long
          description: postData.description ? `[${postData.description.length} characters]` : 'No description',
          // Include a list of all keys to help with debugging
          keys: Object.keys(postData)
        });
        
        setPost(postData);
        
      } catch (err) {
        console.error('Error fetching post:', {
          error: err,
          message: err.message,
          stack: err.stack,
          postId: id
        });
        if (isMounted) {
          setError(`Failed to load post: ${err.message}. Please try again.`);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    
    if (id) {
      fetchPost();
    } else {
      setError('No post ID provided');
      setIsLoading(false);
    }
    
    return () => {
      isMounted = false;
    };
  }, [id]);
  
  // Function to render star ratings
  const renderStars = (rating) => {
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (!processedPost) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Post not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Full Width Image at the top */}
      <div className="w-full relative">
        {/* Back Button */}
        <div className="absolute top-4 left-4 z-10">
          <button
            onClick={() => navigate(-1)}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full p-2 shadow-lg hover:bg-white dark:hover:bg-gray-700 transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5 text-gray-800 dark:text-gray-200" />
          </button>
        </div>
        
        {/* Cover Image */}
        <div className="w-full h-64 md:h-96 bg-gray-200 dark:bg-gray-800 overflow-hidden">
          {processedPost.imageUrl ? (
            <img
              src={processedPost.imageUrl}
              alt={processedPost.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                console.error('Error loading cover image:', processedPost.imageUrl);
                e.target.style.display = 'none';
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <ImageIcon className="w-16 h-16" />
            </div>
          )}
        </div>
      </div>
      
      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Post Header - No Box */}
          <div className="mb-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {processedPost.title}
                </h1>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 mb-4">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span>{processedPost.location}</span>
                  <span className="mx-2">•</span>
                  <Calendar className="w-4 h-4 mr-1" />
                  <span>{new Date(processedPost.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              {processedPost.rating > 0 && (
                <div className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 text-sm font-medium px-3 py-1 rounded-full">
                  {processedPost.rating.toFixed(1)} ★
                </div>
              )}
            </div>
            
            {/* Star Rating */}
            {processedPost.rating > 0 && (
              <div className="mb-6">
                {renderStars(processedPost.rating)}
              </div>
            )}
            
            {/* Content Image */}
            {processedPost.contentImageUrl && (
              <div className="mb-6 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                <img
                  src={processedPost.contentImageUrl}
                  alt="Content"
                  className="w-full h-auto max-h-96 object-contain"
                  onError={(e) => {
                    console.error('Error loading content image:', processedPost.contentImageUrl);
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            )}
            
            {/* Description - With Box Styling */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
              <div className="prose dark:prose-invert max-w-none">
                <p className="whitespace-pre-line text-gray-700 dark:text-gray-300">
                  {processedPost.description}
                </p>
              </div>
            </div>

            {/* Location Map */}
            {processedPost.location && (
              <div className="mt-8">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-blue-500" />
                  Location: {processedPost.location}
                </h3>
                {mapLocation ? (
                  <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 shadow-lg">
                    <MapContainer
                      center={[mapLocation.lat, mapLocation.lng]}
                      zoom={12}
                      style={{ height: '300px', width: '100%' }}
                      className="z-0"
                    >
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      />
                      <Marker position={[mapLocation.lat, mapLocation.lng]}>
                        <Popup>
                          <div className="text-center">
                            <strong>{processedPost.location}</strong>
                            <br />
                            <small>{mapLocation.displayName}</small>
                          </div>
                        </Popup>
                      </Marker>
                    </MapContainer>
                  </div>
                ) : (
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 text-center">
                    <MapPin className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-gray-600 dark:text-gray-400">
                      Loading map for "{processedPost.location}"...
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
