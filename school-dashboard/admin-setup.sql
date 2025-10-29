-- Admin Setup for School Management Dashboard
-- Run this in Supabase SQL Editor AFTER the main schema is already set up

-- 1. Enable Row Level Security on existing tables
ALTER TABLE parents ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- 2. Create admin table
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Enable RLS for admins table
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- 4. Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Admins can do everything" ON admins;
DROP POLICY IF EXISTS "Admins can do everything on parents" ON parents;
DROP POLICY IF EXISTS "Admins can do everything on classes" ON classes;
DROP POLICY IF EXISTS "Admins can do everything on students" ON students;

-- 5. Create policies for admins (allow all operations for authenticated users)
CREATE POLICY "Admins can do everything" ON admins FOR ALL USING (true);
CREATE POLICY "Admins can do everything on parents" ON parents FOR ALL USING (true);
CREATE POLICY "Admins can do everything on classes" ON classes FOR ALL USING (true);
CREATE POLICY "Admins can do everything on students" ON students FOR ALL USING (true);

-- 6. Create index for admin email lookup
CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);

-- 7. Create a function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS(SELECT 1 FROM admins WHERE email = user_email);
END;
$$ LANGUAGE plpgsql;

-- 8. Insert default admin user (replace with your email)
INSERT INTO admins (email, name, role) VALUES 
('admin@school.com', 'School Administrator', 'super_admin')
ON CONFLICT (email) DO NOTHING;
