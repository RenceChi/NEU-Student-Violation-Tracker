-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE violations ENABLE ROW LEVEL SECURITY;
ALTER TABLE violation_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE sanctions ENABLE ROW LEVEL SECURITY;
ALTER TABLE violation_sanctions ENABLE ROW LEVEL SECURITY;
ALTER TABLE appeals ENABLE ROW LEVEL SECURITY;

-- PROFILES
-- Users can read their own profile
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

-- Officers and admins can view all profiles
CREATE POLICY "Officers can view all profiles"
ON profiles FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role IN ('officer', 'admin')
  )
);

-- VIOLATIONS
-- Students can only see their own violations
CREATE POLICY "Students can view own violations"
ON violations FOR SELECT
USING (
  student_id = auth.uid()
);

-- Officers and admins can view all violations
CREATE POLICY "Officers can view all violations"
ON violations FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role IN ('officer', 'admin')
  )
);

-- Only officers and admins can insert violations
CREATE POLICY "Officers can insert violations"
ON violations FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role IN ('officer', 'admin')
  )
);

-- Only officers and admins can update violations
CREATE POLICY "Officers can update violations"
ON violations FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role IN ('officer', 'admin')
  )
);

-- VIOLATION TYPES
-- Everyone can read violation types
CREATE POLICY "Anyone can view violation types"
ON violation_types FOR SELECT
USING (true);

-- Only admins can modify violation types
CREATE POLICY "Admins can manage violation types"
ON violation_types FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);

-- SANCTIONS
-- Everyone can read sanctions
CREATE POLICY "Anyone can view sanctions"
ON sanctions FOR SELECT
USING (true);

-- Only admins can modify sanctions
CREATE POLICY "Admins can manage sanctions"
ON sanctions FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);

-- VIOLATION SANCTIONS
-- Students can see sanctions assigned to their violations
CREATE POLICY "Students can view own violation sanctions"
ON violation_sanctions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM violations
    WHERE violations.id = violation_id
    AND violations.student_id = auth.uid()
  )
);

-- Officers can view and manage all violation sanctions
CREATE POLICY "Officers can manage violation sanctions"
ON violation_sanctions FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role IN ('officer', 'admin')
  )
);

-- APPEALS
-- Students can view and create their own appeals
CREATE POLICY "Students can manage own appeals"
ON appeals FOR ALL
USING (student_id = auth.uid());

-- Officers can view and update all appeals
CREATE POLICY "Officers can manage all appeals"
ON appeals FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role IN ('officer', 'admin')
  )
);