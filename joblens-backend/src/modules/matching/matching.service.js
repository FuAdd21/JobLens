import { query } from '../../database/pool.js';
import { embedJobText, embedProfileText } from './embeddingService.js';
import { getProfileByUserId, getUserSkills } from '../profile/profile.service.js';

// Weights: semantic similarity carries most of the signal, skill overlap is a boost/tiebreaker.
const SEMANTIC_WEIGHT = 0.7;
const SKILL_WEIGHT = 0.3;

const toVectorLiteral = (arr) => `[${arr.join(',')}]`;

// --- Embedding new/changed records ---

export const embedAndStoreJob = async (job) => {
  const embedding = await embedJobText(job);
  if (!embedding) return false;
  await query('UPDATE jobs SET embedding = $1 WHERE id = $2', [
    toVectorLiteral(embedding),
    job.id,
  ]);
  return true;
};

export const embedAndStoreProfile = async (userId) => {
  const profile = await getProfileByUserId(userId);
  const skills = await getUserSkills(userId);
  if (!profile) return false;

  const embedding = await embedProfileText(profile, skills);
  if (!embedding) return false;

  await query('UPDATE profiles SET embedding = $1 WHERE user_id = $2', [
    toVectorLiteral(embedding),
    userId,
  ]);
  return true;
};

// Batch-embed any jobs that don't have an embedding yet (run after each ingestion)
export const embedPendingJobs = async (limit = 100) => {
  const { rows } = await query(
    `SELECT id, title, description, skills FROM jobs WHERE embedding IS NULL LIMIT $1`,
    [limit]
  );

  let succeeded = 0;
  for (const job of rows) {
    // Gemini free tier is rate-limited — small delay avoids 429s (same fix as the forum chatbot)
    await new Promise((r) => setTimeout(r, 300));
    const ok = await embedAndStoreJob(job);
    if (ok) succeeded += 1;
  }
  return { attempted: rows.length, succeeded };
};

// --- Skill overlap (deterministic, cheap, complements the semantic score) ---

const computeSkillOverlap = async (userId, jobSkills) => {
  if (!jobSkills || jobSkills.length === 0) return 0;

  const userSkills = await getUserSkills(userId);
  const userSkillNames = new Set(userSkills.map((s) => s.name.toLowerCase()));
  const jobSkillNames = jobSkills.map((s) => s.toLowerCase());

  const overlapCount = jobSkillNames.filter((s) => userSkillNames.has(s)).length;
  return jobSkillNames.length > 0 ? overlapCount / jobSkillNames.length : 0;
};

// --- Core matching: find best jobs for one user using pgvector cosine distance ---

export const computeMatchesForUser = async (userId, limit = 30) => {
  const profileEmbedded = await embedAndStoreProfile(userId);
  if (!profileEmbedded) {
    throw Object.assign(new Error('Profile is incomplete — add profession and skills first.'), {
      status: 400,
    });
  }

  const { rows: candidates } = await query(
    `SELECT j.id, j.title, j.skills, j.source_url, j.location, j.deadline_at, j.posted_at,
            1 - (j.embedding <=> (SELECT embedding FROM profiles WHERE user_id = $1)) AS similarity
     FROM jobs j
     JOIN job_sources js ON js.id = j.source_id
     WHERE j.embedding IS NOT NULL
       AND j.status = 'ACTIVE'
       AND j.posted_at >= now() - interval '45 days'
       AND js.reliability_score >= 20
     ORDER BY j.embedding <=> (SELECT embedding FROM profiles WHERE user_id = $1)
     LIMIT $2`,
    [userId, limit]
  );

  const results = [];
  for (const job of candidates) {
    const skillScore = await computeSkillOverlap(userId, job.skills);

    // Small recency boost — up to +5% for something posted today, tapering to 0 at 45 days
    const ageDays = (Date.now() - new Date(job.posted_at).getTime()) / (1000 * 60 * 60 * 24);
    const recencyBoost = Math.max(0, (1 - ageDays / 45)) * 0.05;

    const finalScore = SEMANTIC_WEIGHT * job.similarity + SKILL_WEIGHT * skillScore + recencyBoost;

    await query(
      `INSERT INTO matches (user_id, job_id, similarity_score, skill_overlap_score, final_score)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (user_id, job_id)
       DO UPDATE SET similarity_score = $3, skill_overlap_score = $4, final_score = $5`,
      [userId, job.id, job.similarity, skillScore, finalScore]
    );

    results.push({ ...job, similarity: job.similarity, skillScore, finalScore });
  }

  return results.sort((a, b) => b.finalScore - a.finalScore);
};

export const getStoredMatches = async (userId, limit = 20) => {
  const { rows } = await query(
    `SELECT m.similarity_score, m.skill_overlap_score, m.final_score, m.created_at,
            j.id, j.title, j.location, j.employment_type, j.source_url, j.deadline_at,
            o.name as organization_name
     FROM matches m
     JOIN jobs j ON j.id = m.job_id
     LEFT JOIN organizations o ON o.id = j.organization_id
     WHERE m.user_id = $1 AND j.status = 'ACTIVE'
     ORDER BY m.final_score DESC
     LIMIT $2`,
    [userId, limit]
  );
  return rows;
};