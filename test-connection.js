// Test Supabase Connection
// Run this in browser console at http://localhost:3000

// Test 1: Check if Supabase client is loaded
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);

// Test 2: Try to connect to Supabase
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ivhhpuubrnxptgabnjxj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2aGhwdXVicm54cHRnYWJuanhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzNDc5NDUsImV4cCI6MjA3NjkyMzk0NX0.iYnNNUhrlnAzmgWC8IzII2eQkZudUdK2qRWQp8LVDUo';

const supabase = createClient(supabaseUrl, supabaseKey);

// Test 3: Try to fetch admin data
supabase.from('admins').select('*').then(result => {
  console.log('Admin data:', result);
}).catch(error => {
  console.error('Supabase error:', error);
});

