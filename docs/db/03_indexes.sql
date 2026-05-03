-- student_violations: every screen that lists or filters violations hits these
CREATE INDEX IF NOT EXISTS idx_sv_student_id       ON student_violations (student_id);
CREATE INDEX IF NOT EXISTS idx_sv_status           ON student_violations (status);
CREATE INDEX IF NOT EXISTS idx_sv_severity         ON student_violations (severity);
CREATE INDEX IF NOT EXISTS idx_sv_date_of_incident ON student_violations (date_of_incident DESC);
CREATE INDEX IF NOT EXISTS idx_sv_recorded_by      ON student_violations (recorded_by);
 
-- appeals: looked up by violation and by student
CREATE INDEX IF NOT EXISTS idx_appeals_violation_id ON appeals (violation_id);
CREATE INDEX IF NOT EXISTS idx_appeals_student_id   ON appeals (student_id);
CREATE INDEX IF NOT EXISTS idx_appeals_status       ON appeals (status);
 
-- profiles: role is used in EVERY RLS subquery via get_my_role()
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles (role);
 
-- violation_sanctions: looked up by violation
CREATE INDEX IF NOT EXISTS idx_vsanctions_violation_id ON violation_sanctions (violation_id);
 
-- violation_type_sanctions: looked up by violation type
CREATE INDEX IF NOT EXISTS idx_vts_violation_type_id ON violation_type_sanctions (violation_type_id);
 