-- ── Step 1: Create get_my_role() ──────────────────────────────────────────────
-- Runs as the function owner (postgres) so it bypasses RLS entirely.
-- No recursion possible since RLS is not applied inside SECURITY DEFINER.

CREATE OR REPLACE FUNCTION get_my_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$;


-- ── Step 2: Fix profiles policies ────────────────────────────────────────────
-- The "Officers and admins can view all profiles" policy was subquerying
-- profiles FROM profiles — classic infinite recursion.

DROP POLICY IF EXISTS "Officers and admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Students can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON profiles;

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


-- ── Step 3: Fix student_violations policies ───────────────────────────────────

DROP POLICY IF EXISTS "Officers and admins can view all violations" ON student_violations;
DROP POLICY IF EXISTS "Officers and admins can insert violations" ON student_violations;
DROP POLICY IF EXISTS "Officers and admins can update violations" ON student_violations;

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


-- ── Step 4: Fix sanctions policies ───────────────────────────────────────────

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


-- ── Step 5: Fix violation_types policies ─────────────────────────────────────

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


-- ── Step 6: Fix violation_type_sanctions policies ─────────────────────────────

DROP POLICY IF EXISTS "Admins can insert violation type sanctions" ON violation_type_sanctions;
DROP POLICY IF EXISTS "Admins can delete violation type sanctions" ON violation_type_sanctions;

CREATE POLICY "Admins can insert violation type sanctions"
  ON violation_type_sanctions FOR INSERT
  WITH CHECK (get_my_role() = 'admin');

CREATE POLICY "Admins can delete violation type sanctions"
  ON violation_type_sanctions FOR DELETE
  USING (get_my_role() = 'admin');


-- ── Step 7: Fix appeals policies ─────────────────────────────────────────────

DROP POLICY IF EXISTS "Officers and admins can view all appeals" ON appeals;
DROP POLICY IF EXISTS "Officers and admins can update appeals" ON appeals;

CREATE POLICY "Officers and admins can view all appeals"
  ON appeals FOR SELECT
  USING (get_my_role() IN ('officer', 'admin'));

CREATE POLICY "Officers and admins can update appeals"
  ON appeals FOR UPDATE
  USING (get_my_role() IN ('officer', 'admin'))
  WITH CHECK (get_my_role() IN ('officer', 'admin'));


-- ── Step 8: Fix violation_sanctions policies ──────────────────────────────────

DROP POLICY IF EXISTS "Officers can manage violation sanctions" ON violation_sanctions;

CREATE POLICY "Officers can manage violation sanctions"
  ON violation_sanctions FOR ALL
  USING (get_my_role() IN ('officer', 'admin'));


-- ── Verify ────────────────────────────────────────────────────────────────────
-- SELECT tablename, policyname, cmd FROM pg_policies
-- WHERE schemaname = 'public' ORDER BY tablename, cmd;