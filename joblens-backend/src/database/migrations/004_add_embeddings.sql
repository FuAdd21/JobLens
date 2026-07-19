-- pgvector was already enabled in migration 001

ALTER TABLE jobs ADD COLUMN IF NOT EXISTS embedding vector(768);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS embedding vector(768);

-- ivfflat index for fast approximate nearest-neighbor search once you have real volume
-- (skip building this until you have a few hundred+ jobs — it's not useful on tiny tables)
CREATE INDEX IF NOT EXISTS idx_jobs_embedding ON jobs
  USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

CREATE TABLE IF NOT EXISTS matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  similarity_score NUMERIC(5,4) NOT NULL, -- raw cosine similarity, 0-1
  skill_overlap_score NUMERIC(5,4) NOT NULL DEFAULT 0,
  final_score NUMERIC(5,4) NOT NULL, -- weighted hybrid score used for ranking
  notified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, job_id)
);

CREATE INDEX IF NOT EXISTS idx_matches_user_score ON matches(user_id, final_score DESC);
CREATE INDEX IF NOT EXISTS idx_matches_notified ON matches(notified);