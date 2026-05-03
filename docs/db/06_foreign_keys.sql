-- ── 1. Drop duplicate FK on student_violations.violation_type_id ──
-- fk_sv_violation_type (added manually) and
-- student_violations_violation_type_id_fkey (original) both
-- existed on the same column. Keeping fk_sv_violation_type
-- since it has the explicit RESTRICT rule and clearer name.

ALTER TABLE student_violations
  DROP CONSTRAINT student_violations_violation_type_id_fkey;

-- ── 2. Fix violation_sanctions.sanction_id delete rule ───────
-- Was SET NULL — silently nulled sanction references when a
-- sanction was deleted. Changed to RESTRICT to prevent deleting
-- sanctions that are actively assigned to violations.

ALTER TABLE violation_sanctions
  DROP CONSTRAINT IF EXISTS violation_sanctions_sanction_id_fkey,
  ADD CONSTRAINT violation_sanctions_sanction_id_fkey
    FOREIGN KEY (sanction_id)
    REFERENCES sanctions(id)
    ON DELETE RESTRICT;

-- ── 3. Add missing FK — appeals.violation_id ─────────────────
-- appeals.violation_id had no FK constraint, allowing appeals
-- to reference non-existent violations. CASCADE so appeals are
-- cleaned up if their violation is deleted.

ALTER TABLE appeals
  ADD CONSTRAINT fk_appeals_violation_id
    FOREIGN KEY (violation_id)
    REFERENCES student_violations(id)
    ON DELETE CASCADE;

-- ── 4. Add missing FK — violation_sanctions.violation_id ─────
-- violation_sanctions.violation_id had no FK constraint, allowing
-- assigned sanctions to reference non-existent violations.
-- CASCADE so assigned sanctions are cleaned up if the violation
-- is deleted.

ALTER TABLE violation_sanctions
  ADD CONSTRAINT fk_vsanctions_violation_id
    FOREIGN KEY (violation_id)
    REFERENCES student_violations(id)
    ON DELETE CASCADE;