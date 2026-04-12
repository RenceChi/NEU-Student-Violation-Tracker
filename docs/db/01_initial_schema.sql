-- Drop existing tables
DROP TABLE IF EXISTS violations CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Profiles
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  student_id TEXT UNIQUE,
  role TEXT CHECK (role IN ('student', 'officer', 'admin')) NOT NULL,
  section TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Violation Types library
CREATE TABLE violation_types (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  default_severity TEXT CHECK (default_severity IN ('Minor', 'Major', 'Severe')) NOT NULL,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sanctions library
CREATE TABLE sanctions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  duration TEXT,
  recommended_for TEXT CHECK (recommended_for IN ('Minor', 'Major', 'Severe')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Violations
CREATE TABLE violations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  officer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  violation_type_id UUID REFERENCES violation_types(id) ON DELETE SET NULL,
  severity TEXT CHECK (severity IN ('Minor', 'Major', 'Severe')) NOT NULL,
  description TEXT,
  location TEXT,
  date_committed TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT CHECK (status IN ('Open', 'Sanction Assigned', 'Resolved', 'Appealed')) DEFAULT 'Open',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Violation Sanctions (links sanctions to violations)
CREATE TABLE violation_sanctions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  violation_id UUID REFERENCES violations(id) ON DELETE CASCADE NOT NULL,
  sanction_id UUID REFERENCES sanctions(id) ON DELETE SET NULL,
  assigned_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  start_date DATE,
  end_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Appeals
CREATE TABLE appeals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  violation_id UUID REFERENCES violations(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  reason TEXT NOT NULL,
  explanation TEXT,
  preferred_resolution TEXT,
  status TEXT CHECK (status IN ('Pending', 'Under Review', 'Approved', 'Rejected')) DEFAULT 'Pending',
  reviewed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);