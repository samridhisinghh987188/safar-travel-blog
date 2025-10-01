import { supabase } from '../lib/supabase';
import { deleteImage } from '../utils/storage';

// Make sure this matches exactly with your Supabase storage bucket name
const BUCKET_NAME = 'blogimage';  // Matches the bucket name in Supabase storage

// Get all blog posts
export const getBlogPosts = async () => {
  try {
    console.log('Fetching posts from Supabase');
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    console.log(`Fetched ${data?.length || 0} posts from database`);
    
    // Process each post for cover image
    const processedPosts = await Promise.all((data || []).map(async (post) => {
      // For backward compatibility
      const imagePath = post.cover_image || post.image;
      let imageUrl = null;
      
      if (imagePath) {
        try {
          // Import getImageUrl dynamically to avoid circular dependencies
          const { getImageUrl } = await import('../utils/storage');
          
          if (imagePath.startsWith('http')) {
            imageUrl = imagePath;
          } else {
            imageUrl = getImageUrl(imagePath);
          }
        } catch (err) {
          console.error('Error generating image URL:', err);
        }
      }
      
      return {
        ...post,
        // For backward compatibility
        image: imagePath,
        coverImage: imagePath,
        // Include full URLs
        imageUrl: imageUrl,
        coverImageUrl: imageUrl,
        description: post.description || ''
      };
    }));
    
    console.log('Successfully processed', processedPosts.length, 'posts');
    return processedPosts;
  } catch (error) {
    console.error('Error in getBlogPosts:', error);
    return [];
  }
};

// Add a new blog post
export const addBlogPost = async (post) => {
  // Get the current session first
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    throw new Error('No active session. Please log in to create a post.');
  }
  
  console.log('Starting to add blog post with data:', {
    title: post.title,
    location: post.location,
    description: post.description,
    rating: post.rating,
    hasImage: !!post.image,
    hasContentImage: !!post.content_image,
    allPostKeys: Object.keys(post)
  });
  
  try {
    // Create the post data - start with minimal required fields
    const postData = {
      title: post.title,
      description: post.description || '',
      image: post.image || null
    };
    
    // Add optional fields only if they exist
    if (post.location) postData.location = post.location;
    if (post.rating) postData.rating = post.rating;
    if (post.content_image) postData.content_image = post.content_image;
    if (post.author) postData.author = post.author;
    if (post.isPrivate !== undefined) postData.isPrivate = post.isPrivate;
    
    // Add user_id if we have a session
    if (session?.user?.id) {
      postData.user_id = session.user.id;
    }
    
    console.log('Inserting post data:', postData);
    
    // First, let's check the actual table structure by getting an existing post
    const { data: existingPosts, error: existingError } = await supabase
      .from('blog_posts')
      .select('*')
      .limit(1);
    
    if (!existingError && existingPosts?.length > 0) {
      console.log('Existing post structure:', Object.keys(existingPosts[0]));
      console.log('Sample existing post:', existingPosts[0]);
    } else {
      console.log('Error fetching existing posts or no posts found:', existingError);
    }
    
    // Try inserting with different approaches
    console.log('Attempting to insert post...');
    
    // First try: Simple insert without select
    const { data: insertResult, error: insertError } = await supabase
      .from('blog_posts')
      .insert(postData);
    
    if (insertError) {
      console.error('Simple insert failed:', insertError);
      
      // Second try: Insert with select
      const { data: savedPost, error: saveError } = await supabase
        .from('blog_posts')
        .insert([postData])
        .select()
        .single();
        
      if (saveError) {
        console.error('Insert with select failed:', saveError);
        throw saveError;
      }
      
      console.log('Insert with select succeeded:', savedPost);
      return savedPost;
    }
    
    console.log('Simple insert succeeded:', insertResult);
    
    // Get the inserted post
    const { data: savedPost, error: fetchError } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('title', postData.title)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
      
    if (fetchError) {
      console.error('Error fetching inserted post:', fetchError);
      // Return a basic response if we can't fetch
      return { id: 'temp', ...postData };
    }
    
    console.log('Successfully saved post:', savedPost.id);
    
    // Return the saved post with proper image URLs
    let imageUrl = null;
    if (savedPost.image) {
      try {
        const { getImageUrl } = await import('../utils/storage');
        imageUrl = getImageUrl(savedPost.image);
      } catch (err) {
        console.error('Error generating image URL:', err);
      }
    }
    
    return {
      ...savedPost,
      coverImage: savedPost.image,  // For backward compatibility
      imageUrl: imageUrl,
      coverImageUrl: imageUrl
    };
    
  } catch (error) {
    console.error('Error in addBlogPost:', error);
    throw error;
  }
};

// Get a single blog post by ID
export const getBlogPostById = async (id) => {
  try {
    console.log(`Fetching post with ID: ${id}`);
    
    // Get the post data with all fields
    const { data: post, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) throw error;
    if (!post) {
      console.log('No post found with ID:', id);
      return null;
    }
    
    console.log('Raw post data from database:', post);
    
    // Process the post data
    const processedPost = {
      ...post,
      // For backward compatibility
      image: post.cover_image || post.image,
      coverImage: post.cover_image || post.image,
      description: post.description || post.content || '',
      // Ensure all required fields have default values
      title: post.title || 'Untitled Post',
      location: post.location || '',
      rating: post.rating || 0,
      created_at: post.created_at || new Date().toISOString(),
      content: post.content || post.description || ''
    };
    
    // If we have a cover image, ensure the URL is properly formatted
    if (processedPost.coverImage) {
      try {
        // Import getImageUrl dynamically to avoid circular dependencies
        const { getImageUrl } = await import('../utils/storage');
        
        // If it's already a full URL, use it as is
        if (processedPost.coverImage.startsWith('http')) {
          console.log('Using direct URL for cover image');
          processedPost.imageUrl = processedPost.coverImage;
          processedPost.coverImageUrl = processedPost.coverImage;
        } else {
          // Generate the full URL
          const imageUrl = getImageUrl(processedPost.coverImage);
          console.log('Generated image URL:', {
            original: processedPost.coverImage,
            generated: imageUrl
          });
          processedPost.coverImageUrl = imageUrl;
          processedPost.imageUrl = imageUrl;
        }
      } catch (err) {
        console.error('Error processing cover image URL:', err);
        // Set fallback values if there's an error
        processedPost.coverImageUrl = null;
        processedPost.imageUrl = null;
      }
    } else {
      // Ensure these fields are always defined
      processedPost.coverImageUrl = null;
      processedPost.imageUrl = null;
    }
    
    
    console.log('Successfully processed post:', {
      id: processedPost.id,
      title: processedPost.title,
      hasCoverImage: !!processedPost.coverImage,
      coverImageUrl: processedPost.coverImageUrl
    });
    
    return processedPost;
  } catch (error) {
    console.error('Error in getBlogPostById:', error);
    throw error;
  }
};

// Delete a blog post by ID
export const deleteBlogPost = async (id) => {
  try {
    // First get the post to find the cover image
    const { data: post, error: fetchError } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('id', id)
      .single();
      
    if (fetchError) throw fetchError;
    
    // Delete the post from the database
    const { error: deleteError } = await supabase
      .from('blog_posts')
      .delete()
      .eq('id', id);
      
    if (deleteError) throw deleteError;
    
    // If the post had a cover image, delete it from storage
    if (post.cover_image) {
      try {
        await deleteImage(post.cover_image, BUCKET_NAME);
        console.log('Deleted cover image:', post.cover_image);
      } catch (imgError) {
        console.error('Error deleting cover image:', imgError);
        // Don't fail the operation if image deletion fails
      }
    }
    
    console.log('Successfully deleted post:', id);
    return true;
    
  } catch (error) {
    console.error('Error in deleteBlogPost:', error);
    throw error;
  }
};
