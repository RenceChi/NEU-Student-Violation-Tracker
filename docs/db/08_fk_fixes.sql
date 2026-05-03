
-- ── 1. Drop duplicate FK on student_violations.violation_type_id ──────────────
-- fk_sv_violation_type (from migration 06) and
-- student_violations_violation_type_id_fkey (original) both exist on the same
-- column. Keep fk_sv_violation_type (explicit RESTRICT) and drop the original.

ALTER TABLE student_violations
  DROP CONSTRAINT IF EXISTS student_violations_violation_type_id_fkey;


-- ── 2. Fix violation_sanctions.sanction_id — SET NULL → RESTRICT ──────────────
-- Prevents deleting a sanction that is actively assigned to a violation record.

ALTER TABLE violation_sanctions
  DROP CONSTRAINT IF EXISTS violation_sanctions_sanction_id_fkey,
  ADD CONSTRAINT violation_sanctions_sanction_id_fkey
    FOREIGN KEY (sanction_id)
    REFERENCES sanctions(id)
    ON DELETE RESTRICT;


-- ── 3. Add missing FK — appeals.violation_id → student_violations ─────────────
-- Ensures every appeal references a real violation.
-- CASCADE: if a violation is deleted, its appeals are also deleted.

ALTER TABLE appeals
  ADD CONSTRAINT fk_appeals_violation_id
    FOREIGN KEY (violation_id)
    REFERENCES student_violations(id)
    ON DELETE CASCADE;


-- ── 4. Add missing FK — violation_sanctions.violation_id → student_violations ──
-- Ensures every assigned sanction references a real violation record.
-- CASCADE: if a violation is deleted, its assigned sanctions are also deleted.

ALTER TABLE violation_sanctions
  ADD CONSTRAINT fk_vsanctions_violation_id
    FOREIGN KEY (violation_id)
    REFERENCES student_violations(id)
    ON DELETE CASCADE;


-- ── Verify ────────────────────────────────────────────────────────────────────
-- SELECT tc.table_name, kcu.column_name, ccu.table_name AS foreign_table, rc.delete_rule
-- FROM information_schema.table_constraints tc
-- JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
-- JOIN information_schema.referential_constraints rc ON tc.constraint_name = rc.constraint_name
-- JOIN information_schema.constraint_column_usage ccu ON rc.unique_constraint_name = ccu.constraint_name
-- WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'public'
-- ORDER BY tc.table_name;