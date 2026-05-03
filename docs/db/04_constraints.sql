-- profiles.role
ALTER TABLE profiles
  DROP CONSTRAINT IF EXISTS chk_profiles_role,
  ADD CONSTRAINT chk_profiles_role
    CHECK (role IN ('admin', 'officer', 'student'));

-- student_violations.severity
ALTER TABLE student_violations
  DROP CONSTRAINT IF EXISTS chk_sv_severity,
  ADD CONSTRAINT chk_sv_severity
    CHECK (severity IN ('Minor', 'Major', 'Severe'));

-- student_violations.status
ALTER TABLE student_violations
  DROP CONSTRAINT IF EXISTS chk_sv_status,
  ADD CONSTRAINT chk_sv_status
    CHECK (status IN ('pending', 'resolved', 'appealed'));

-- violation_types.default_severity
ALTER TABLE violation_types
  DROP CONSTRAINT IF EXISTS chk_vt_default_severity,
  ADD CONSTRAINT chk_vt_default_severity
    CHECK (default_severity IN ('Minor', 'Major', 'Severe'));

-- violation_types.category
ALTER TABLE violation_types
  DROP CONSTRAINT IF EXISTS chk_vt_category,
  ADD CONSTRAINT chk_vt_category
    CHECK (category IN ('Conduct', 'Attendance', 'Facilities', 'Safety'));

-- sanctions.recommended_for
ALTER TABLE sanctions
  DROP CONSTRAINT IF EXISTS chk_sanctions_recommended_for,
  ADD CONSTRAINT chk_sanctions_recommended_for
    CHECK (recommended_for IN ('Minor', 'Major', 'Severe'));

-- appeals.status
ALTER TABLE appeals
  DROP CONSTRAINT IF EXISTS chk_appeals_status,
  ADD CONSTRAINT chk_appeals_status
    CHECK (status IN ('pending', 'approved', 'rejected'));