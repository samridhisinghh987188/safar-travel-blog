import { createClient } from '@supabase/supabase-js';

// Supabase configuration - using Vite environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://eoayrogsrkcvyinasvol.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVvYXlyb2dzcmtjdnlpbmFzdm9sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2NjAyNjksImV4cCI6MjA3NDIzNjI2OX0.jZPfSEkvf--4z5XRwjPt7N8HZrNe8StVwzcUVsqWp8A';

// Log configuration for debugging
console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key:', supabaseAnonKey ? '*** Key loaded ***' : 'No key found');

// Create a single supabase client for interacting with your database
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    storage: window.localStorage
  }
});

// Test the connection
async function testConnection() {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    console.log('Supabase connected successfully');
    console.log('Session:', data.session ? 'User is logged in' : 'No active session');
    return true;
  } catch (error) {
    console.error('Supabase connection error:', error.message);
    return false;
  }
}

// Run the connection test
testConnection();

export { supabase };
