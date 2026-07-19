CREATE TABLE IF NOT EXISTS profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  country VARCHAR(100) DEFAULT 'Ethiopia',
  city VARCHAR(100),
  education_level VARCHAR(50),
  profession VARCHAR(150),
  experience_level VARCHAR(50),
  industry VARCHAR(100),
  bio TEXT,
  preferred_locations JSONB NOT NULL DEFAULT '[]',
  employment_types JSONB NOT NULL DEFAULT '[]',
  work_arrangement JSONB NOT NULL DEFAULT '[]',
  profile_completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(150) UNIQUE NOT NULL,
  category VARCHAR(100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_skills_name ON skills(name);

CREATE TABLE IF NOT EXISTS user_skills (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  proficiency_level VARCHAR(20) NOT NULL DEFAULT 'INTERMEDIATE',
  years_experience NUMERIC(4,1) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, skill_id)
);

CREATE INDEX IF NOT EXISTS idx_profiles_profession ON profiles(profession);
