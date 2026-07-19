CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) DEFAULT 'UNKNOWN',
  website VARCHAR(500),
  country VARCHAR(100) DEFAULT 'Ethiopia',
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS job_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  identifier VARCHAR(255) NOT NULL,
  reliability_score INT NOT NULL DEFAULT 50,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  last_successful_sync TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_job_sources_identifier ON job_sources(type, identifier);

CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(500) NOT NULL,
  description TEXT,
  organization_id UUID REFERENCES organizations(id),
  location VARCHAR(255),
  employment_type VARCHAR(50),
  experience_level VARCHAR(50),
  education_requirement VARCHAR(50),
  industry VARCHAR(150),
  skills JSONB NOT NULL DEFAULT '[]',
  source_id UUID NOT NULL REFERENCES job_sources(id),
  source_url TEXT,
  raw_content TEXT NOT NULL,
  deadline_at TIMESTAMPTZ,
  posted_at TIMESTAMPTZ,
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
  quality_score INT DEFAULT 50,
  dedup_hash VARCHAR(64),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_jobs_title ON jobs(title);
CREATE INDEX IF NOT EXISTS idx_jobs_location ON jobs(location);
CREATE INDEX IF NOT EXISTS idx_jobs_deadline ON jobs(deadline_at);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_dedup_hash ON jobs(dedup_hash);
CREATE INDEX IF NOT EXISTS idx_jobs_posted_at ON jobs(posted_at DESC);
