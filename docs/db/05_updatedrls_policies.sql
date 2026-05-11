CREATE OR REPLACE FUNCTION get_my_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$;

-- ── Step 2: profiles ─────────────────────────────────────────

DROP POLICY IF EXISTS "Authenticated users can view profiles" ON profiles;
DROP POLICY IF EXISTS "Students can view own profile" ON profiles;
DROP POLICY IF EXISTS "Officers and admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

CREATE POLICY "Students can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Officers and admins can view all profiles"
  ON profiles FOR SELECT
  USING (get_my_role() IN ('officer', 'admin'));

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Authenticated users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ── Step 3: student_violations ───────────────────────────────

DROP POLICY IF EXISTS "Officers and admins can insert violations" ON student_violations;
DROP POLICY IF EXISTS "Officers and admins can view all violations" ON student_violations;
DROP POLICY IF EXISTS "Officers and admins can update violations" ON student_violations;
DROP POLICY IF EXISTS "Students can appeal own violations" ON student_violations;

CREATE POLICY "Officers and admins can view all violations"
  ON student_violations FOR SELECT
  USING (get_my_role() IN ('admin', 'officer'));

CREATE POLICY "Officers and admins can insert violations"
  ON student_violations FOR INSERT
  WITH CHECK (get_my_role() IN ('officer', 'admin'));

CREATE POLICY "Officers and admins can update violations"
  ON student_violations FOR UPDATE
  USING (get_my_role() IN ('officer', 'admin'))
  WITH CHECK (get_my_role() IN ('officer', 'admin'));

-- Students can only update their own violation to set status = 'appealed'
CREATE POLICY "Students can appeal own violations"
  ON student_violations FOR UPDATE
  USING (auth.uid() = student_id)
  WITH CHECK (auth.uid() = student_id AND status = 'appealed');

-- ── Step 4: sanctions ────────────────────────────────────────

DROP POLICY IF EXISTS "Admins can insert sanctions" ON sanctions;
DROP POLICY IF EXISTS "Admins can update sanctions" ON sanctions;
DROP POLICY IF EXISTS "Admins can delete sanctions" ON sanctions;

CREATE POLICY "Admins can insert sanctions"
  ON sanctions FOR INSERT
  WITH CHECK (get_my_role() = 'admin');

CREATE POLICY "Admins can update sanctions"
  ON sanctions FOR UPDATE
  USING (get_my_role() = 'admin');

CREATE POLICY "Admins can delete sanctions"
  ON sanctions FOR DELETE
  USING (get_my_role() = 'admin');

-- ── Step 5: violation_types ──────────────────────────────────

DROP POLICY IF EXISTS "Admins can insert violation types" ON violation_types;
DROP POLICY IF EXISTS "Admins can update violation types" ON violation_types;
DROP POLICY IF EXISTS "Admins can delete violation types" ON violation_types;

CREATE POLICY "Admins can insert violation types"
  ON violation_types FOR INSERT
  WITH CHECK (get_my_role() = 'admin');

CREATE POLICY "Admins can update violation types"
  ON violation_types FOR UPDATE
  USING (get_my_role() = 'admin');

CREATE POLICY "Admins can delete violation types"
  ON violation_types FOR DELETE
  USING (get_my_role() = 'admin');

-- ── Step 6: violation_type_sanctions ────────────────────────

DROP POLICY IF EXISTS "Admins can insert violation type sanctions" ON violation_type_sanctions;
DROP POLICY IF EXISTS "Admins can delete violation type sanctions" ON violation_type_sanctions;

CREATE POLICY "Admins can insert violation type sanctions"
  ON violation_type_sanctions FOR INSERT
  WITH CHECK (get_my_role() = 'admin');

CREATE POLICY "Admins can delete violation type sanctions"
  ON violation_type_sanctions FOR DELETE
  USING (get_my_role() = 'admin');

-- ── Step 7: appeals ──────────────────────────────────────────

DROP POLICY IF EXISTS "Officers can manage all appeals" ON appeals;
DROP POLICY IF EXISTS "Students can manage own appeals" ON appeals;
DROP POLICY IF EXISTS "Officers and admins can view all appeals" ON appeals;
DROP POLICY IF EXISTS "Officers and admins can update appeals" ON appeals;
DROP POLICY IF EXISTS "Students can view own appeals" ON appeals;
DROP POLICY IF EXISTS "Students can insert own appeals" ON appeals;

CREATE POLICY "Officers and admins can view all appeals"
  ON appeals FOR SELECT
  USING (get_my_role() IN ('officer', 'admin'));

CREATE POLICY "Officers and admins can update appeals"
  ON appeals FOR UPDATE
  USING (get_my_role() IN ('officer', 'admin'))
  WITH CHECK (get_my_role() IN ('officer', 'admin'));

CREATE POLICY "Students can view own appeals"
  ON appeals FOR SELECT
  USING (student_id = auth.uid());

CREATE POLICY "Students can insert own appeals"
  ON appeals FOR INSERT
  WITH CHECK (student_id = auth.uid());

-- ── Step 8: violation_sanctions ──────────────────────────────

DROP POLICY IF EXISTS "Students can view own violation sanctions" ON violation_sanctions;
DROP POLICY IF EXISTS "Officers can manage violation sanctions" ON violation_sanctions;

-- Fixed: was joining against orphaned violations table, now joins student_violations
CREATE POLICY "Students can view own violation sanctions"
  ON violation_sanctions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM student_violations sv
      WHERE sv.id = violation_sanctions.violation_id
        AND sv.student_id = auth.uid()
    )
  );

CREATE POLICY "Officers can manage violation sanctions"
  ON violation_sanctions FOR ALL
  USING (get_my_role() IN ('officer', 'admin'));

-- ── Step 9: Drop orphaned violations table ───────────────────
-- Confirmed 0 rows before dropping.
-- CASCADE removes the 4 stale RLS policies attached to it.

DROP TABLE IF EXISTS violations CASCADE;