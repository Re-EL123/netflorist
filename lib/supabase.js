// lib/supabase.js
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = 'https://xaikxueachrjydabuueb.supabase.co';
const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhaWt4dWVhY2hyanlkYWJ1dWViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEyMzkyNjUsImV4cCI6MjA4NjgxNTI2NX0.OmdiEby0PMJ6Bdnk22ilg2VvysfU7SE9JduIJ8gdKQk';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export { supabaseUrl, supabaseAnonKey };
