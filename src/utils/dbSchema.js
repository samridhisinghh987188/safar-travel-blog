import { supabase } from '../lib/supabase';

export const checkTableSchema = async (tableName) => {
  try {
    // This will only work if you have the necessary permissions
    const { data, error } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type')
      .eq('table_name', tableName);

    if (error) {
      console.error('Error checking table schema:', error);
      return { error };
    }

    console.log(`Columns in ${tableName}:`, data);
    return { columns: data };
  } catch (error) {
    console.error('Failed to check table schema:', error);
    return { error };
  }
};

// Check if content_image column exists
export const checkContentImageColumn = async () => {
  try {
    // Try to insert a test record with content_image
    const { data, error } = await supabase
      .from('blog_posts')
      .insert([{
        title: 'Test Post - Can be deleted',
        description: 'This is a test post to check schema',
        content_image: 'test/path.jpg',
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      if (error.message.includes('column "content_image" of relation "blog_posts" does not exist')) {
        console.error('ERROR: content_image column does not exist in blog_posts table');
        return { exists: false };
      }
      throw error;
    }

    // Clean up the test record
    if (data?.id) {
      await supabase
        .from('blog_posts')
        .delete()
        .eq('id', data.id);
    }

    console.log('content_image column exists in blog_posts table');
    return { exists: true };
  } catch (error) {
    console.error('Error checking content_image column:', error);
    return { error };
  }
};
