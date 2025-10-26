-- School Management Database Schema
-- Run this in Supabase SQL Editor

-- 1. Enable Row Level Security
ALTER TABLE parents ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- 2. Create admin table
CREATE TABLE admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Enable RLS for admins table
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- 4. Create policies for admins (allow all operations for authenticated users)
CREATE POLICY "Admins can do everything" ON admins FOR ALL USING (true);
CREATE POLICY "Admins can do everything on parents" ON parents FOR ALL USING (true);
CREATE POLICY "Admins can do everything on classes" ON classes FOR ALL USING (true);
CREATE POLICY "Admins can do everything on students" ON students FOR ALL USING (true);

-- 5. Parents table
CREATE TABLE parents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Classes table
CREATE TABLE classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Students table
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  parent_id UUID REFERENCES parents(id) ON DELETE CASCADE,
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  fee NUMERIC DEFAULT 10,
  discount NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Create indexes for better performance
CREATE INDEX idx_students_parent_id ON students(parent_id);
CREATE INDEX idx_students_class_id ON students(class_id);
CREATE INDEX idx_students_status ON students(status);
CREATE INDEX idx_admins_email ON admins(email);

-- 9. Create a view for monthly income by class
CREATE OR REPLACE VIEW monthly_income_by_class AS
SELECT 
  c.name as class_name,
  COUNT(s.id) as total_students,
  SUM(s.fee) as total_fee,
  SUM(s.discount) as total_discount,
  SUM(s.fee - s.discount) as net_income
FROM classes c
LEFT JOIN students s ON c.id = s.class_id AND s.status = 'active'
GROUP BY c.id, c.name
ORDER BY net_income DESC;

-- 10. Create a function to get dashboard stats
CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_students', (SELECT COUNT(*) FROM students),
    'active_students', (SELECT COUNT(*) FROM students WHERE status = 'active'),
    'inactive_students', (SELECT COUNT(*) FROM students WHERE status = 'inactive'),
    'total_classes', (SELECT COUNT(*) FROM classes),
    'total_parents', (SELECT COUNT(*) FROM parents),
    'monthly_income', (SELECT COALESCE(SUM(fee - discount), 0) FROM students WHERE status = 'active')
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 11. Create a function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS(SELECT 1 FROM admins WHERE email = user_email);
END;
$$ LANGUAGE plpgsql;

-- 12. Payments table
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  month TEXT NOT NULL, -- e.g., "October 2025"
  amount NUMERIC NOT NULL,
  status TEXT DEFAULT 'unpaid' CHECK (status IN ('paid', 'unpaid')),
  payment_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 13. Finance summary table
CREATE TABLE finance_summary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  month TEXT NOT NULL,
  total_expected NUMERIC NOT NULL,
  total_paid NUMERIC DEFAULT 0,
  balance NUMERIC NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(class_id, month)
);

-- 14. Enable RLS for new tables
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_summary ENABLE ROW LEVEL SECURITY;

-- 15. Create policies for new tables
CREATE POLICY "Admins can do everything on payments" ON payments FOR ALL USING (true);
CREATE POLICY "Admins can do everything on finance_summary" ON finance_summary FOR ALL USING (true);

-- 16. Create indexes for new tables
CREATE INDEX idx_payments_student_id ON payments(student_id);
CREATE INDEX idx_payments_month ON payments(month);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_finance_summary_class_id ON finance_summary(class_id);
CREATE INDEX idx_finance_summary_month ON finance_summary(month);

-- 17. Function to generate monthly fees
CREATE OR REPLACE FUNCTION generate_monthly_fees(target_month TEXT)
RETURNS JSON AS $$
DECLARE
  result JSON;
  payment_count INT := 0;
  finance_count INT := 0;
BEGIN
  -- Insert payment records for all active students
  INSERT INTO payments (student_id, month, amount, status)
  SELECT 
    s.id,
    target_month,
    (s.fee - s.discount),
    'unpaid'
  FROM students s
  WHERE s.status = 'active'
    AND NOT EXISTS (
      SELECT 1 FROM payments p 
      WHERE p.student_id = s.id AND p.month = target_month
    );
  
  GET DIAGNOSTICS payment_count = ROW_COUNT;
  
  -- Create or update finance summary by class
  INSERT INTO finance_summary (class_id, month, total_expected, total_paid, balance, status)
  SELECT 
    s.class_id,
    target_month,
    SUM(s.fee - s.discount),
    0,
    SUM(s.fee - s.discount),
    'pending'
  FROM students s
  WHERE s.status = 'active'
    AND EXISTS (
      SELECT 1 FROM payments p 
      WHERE p.student_id = s.id AND p.month = target_month
    )
  GROUP BY s.class_id
  ON CONFLICT (class_id, month) DO UPDATE SET
    total_expected = EXCLUDED.total_expected,
    balance = EXCLUDED.total_expected - finance_summary.total_paid;
    
  GET DIAGNOSTICS finance_count = ROW_COUNT;
  
  SELECT json_build_object(
    'payments_created', payment_count,
    'finance_records_updated', finance_count,
    'month', target_month
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 18. Function to update payment status and recalculate finance
CREATE OR REPLACE FUNCTION update_payment_status(payment_id UUID, new_status TEXT)
RETURNS JSON AS $$
DECLARE
  result JSON;
  student_class_id UUID;
  payment_month TEXT;
  payment_amount NUMERIC;
BEGIN
  -- Get payment details
  SELECT s.class_id, p.month, p.amount
  INTO student_class_id, payment_month, payment_amount
  FROM payments p
  JOIN students s ON s.id = p.student_id
  WHERE p.id = payment_id;
  
  -- Update payment status
  UPDATE payments 
  SET 
    status = new_status,
    payment_date = CASE WHEN new_status = 'paid' THEN NOW() ELSE NULL END
  WHERE id = payment_id;
  
  -- Recalculate finance summary
  UPDATE finance_summary f
  SET 
    total_paid = (
      SELECT COALESCE(SUM(p.amount), 0)
      FROM payments p
      JOIN students s ON s.id = p.student_id
      WHERE s.class_id = f.class_id 
        AND p.month = f.month 
        AND p.status = 'paid'
    )
  WHERE f.class_id = student_class_id AND f.month = payment_month;
  
  -- Update balance and status
  UPDATE finance_summary 
  SET 
    balance = total_expected - total_paid,
    status = CASE WHEN total_expected = total_paid THEN 'completed' ELSE 'pending' END
  WHERE class_id = student_class_id AND month = payment_month;
  
  SELECT json_build_object(
    'success', true,
    'payment_id', payment_id,
    'status', new_status
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 19. View for payment details with student and parent info
CREATE OR REPLACE VIEW payment_details AS
SELECT 
  p.id,
  p.student_id,
  p.month,
  p.amount,
  p.status,
  p.payment_date,
  s.name as student_name,
  s.fee as student_fee,
  s.discount as student_discount,
  c.name as class_name,
  c.id as class_id,
  par.name as parent_name,
  par.phone as parent_phone
FROM payments p
JOIN students s ON s.id = p.student_id
JOIN classes c ON c.id = s.class_id
JOIN parents par ON par.id = s.parent_id;

-- 20. Insert default admin user (you'll need to replace with actual email)
INSERT INTO admins (email, name, role) VALUES 
('admin@school.com', 'School Administrator', 'super_admin');
