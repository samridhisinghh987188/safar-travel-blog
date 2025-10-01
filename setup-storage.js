#!/usr/bin/env node

/**
 * Storage Setup Script for Travel Blog
 * 
 * This script creates the required Supabase storage bucket for the travel blog application.
 * Run this script if you're getting "Bucket 'blogimage' does not exist" errors.
 * 
 * Usage: node setup-storage.js
 */

import { createClient } from '@supabase/supabase-js';

// Supabase configuration - same as in the app
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://eoayrogsrkcvyinasvol.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVvYXlyb2dzcmtjdnlpbmFzdm9sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2NjAyNjksImV4cCI6MjA3NDIzNjI2OX0.jZPfSEkvf--4z5XRwjPt7N8HZrNe8StVwzcUVsqWp8A';

const BUCKET_NAME = 'blogimage';

async function setupStorage() {
  console.log('🚀 Setting up storage for Travel Blog...');
  console.log(`📡 Connecting to Supabase: ${supabaseUrl}`);
  
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  
  try {
    // Test connection
    console.log('🔍 Testing Supabase connection...');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError && authError.message !== 'Invalid JWT') {
      console.warn('⚠️  Auth warning:', authError.message);
    }
    console.log('✅ Connection established');
    
    // List existing buckets
    console.log('📋 Checking existing storage buckets...');
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('❌ Error listing buckets:', listError.message);
      process.exit(1);
    }
    
    console.log('📦 Available buckets:', buckets.map(b => b.name).join(', ') || 'none');
    
    // Check if our bucket exists
    const bucketExists = buckets.some(bucket => bucket.name === BUCKET_NAME);
    
    if (bucketExists) {
      console.log(`✅ Bucket '${BUCKET_NAME}' already exists!`);
      console.log('🎉 Storage is ready to use.');
      return;
    }
    
    // Create the bucket
    console.log(`🔨 Creating bucket '${BUCKET_NAME}'...`);
    const { data: createData, error: createError } = await supabase.storage.createBucket(BUCKET_NAME, {
      public: true,
      allowedMimeTypes: ['image/*'],
      fileSizeLimit: 5 * 1024 * 1024 // 5MB
    });
    
    if (createError) {
      console.error('❌ Error creating bucket:', createError.message);
      console.log('\n💡 Possible solutions:');
      console.log('   1. Make sure you have the correct Supabase credentials');
      console.log('   2. Check that your Supabase project has storage enabled');
      console.log('   3. Verify you have the necessary permissions');
      console.log('   4. Try running the SQL migrations manually in your Supabase dashboard');
      process.exit(1);
    }
    
    console.log(`✅ Successfully created bucket '${BUCKET_NAME}'!`);
    
    // Verify the bucket was created
    console.log('🔍 Verifying bucket creation...');
    const { data: verifyBuckets, error: verifyError } = await supabase.storage.listBuckets();
    
    if (verifyError) {
      console.warn('⚠️  Could not verify bucket creation:', verifyError.message);
    } else {
      const newBucketExists = verifyBuckets.some(bucket => bucket.name === BUCKET_NAME);
      if (newBucketExists) {
        console.log('✅ Bucket verification successful!');
      } else {
        console.warn('⚠️  Bucket may not have been created properly');
      }
    }
    
    console.log('\n🎉 Storage setup complete!');
    console.log('📝 You can now upload images in your travel blog application.');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    console.log('\n💡 Troubleshooting:');
    console.log('   1. Check your internet connection');
    console.log('   2. Verify your Supabase URL and API key');
    console.log('   3. Make sure your Supabase project is active');
    console.log('   4. Check the Supabase dashboard for any issues');
    process.exit(1);
  }
}

// Run the setup
setupStorage().catch(console.error);
