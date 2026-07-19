import { query } from '../../database/pool.js';
import { parseJobPosting } from './jobParser.js';
import { computeDedupHash, findDuplicateJob } from './dedup.js';

export const getActiveJobSources = async (type = null) => {
  const { rows } = await query(
    `SELECT * FROM job_sources WHERE active = TRUE ${type ? 'AND type = $1' : ''} ORDER BY reliability_score DESC`,
    type ? [type] : []
  );
  return rows;
};

export const getOrCreateJobSource = async (name, type, identifier) => {
  const { rows: existing } = await query(
    'SELECT * FROM job_sources WHERE type = $1 AND identifier = $2',
    [type, identifier]
  );
  if (existing[0]) return existing[0];

  const { rows } = await query(
    `INSERT INTO job_sources (name, type, identifier)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [name, type, identifier]
  );
  return rows[0];
};

const getOrCreateOrganization = async (name) => {
  if (!name) return null;

  const existing = await query('SELECT * FROM organizations WHERE name = $1', [name]);
  if (existing.rows[0]) return existing.rows[0].id;

  const { rows } = await query('INSERT INTO organizations (name) VALUES ($1) RETURNING id', [name]);
  return rows[0].id;
};

const getKnownSkillNames = async () => {
  const { rows } = await query('SELECT name FROM skills');
  return rows.map((row) => row.name);
};

export const ingestRawPosts = async (posts, sourceId) => {
  const knownSkillNames = await getKnownSkillNames();
  let created = 0;
  let duplicates = 0;
  let skipped = 0;

  for (const post of posts) {
    const parsed = parseJobPosting(post.rawContent, knownSkillNames);

    if (!parsed.title || parsed.title.length < 5) {
      skipped += 1;
      continue;
    }

    const dedupHash = computeDedupHash(parsed.title, parsed.organizationName, parsed.location);
    const duplicate = await findDuplicateJob(dedupHash);
    if (duplicate) {
      duplicates += 1;
      continue;
    }

    const organizationId = await getOrCreateOrganization(parsed.organizationName);

    await query(
      `INSERT INTO jobs (
        title, description, organization_id, location, employment_type,
        experience_level, education_requirement, skills, source_id, source_url,
        raw_content, deadline_at, posted_at, dedup_hash
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)`,
      [
        parsed.title,
        post.rawContent,
        organizationId,
        parsed.location,
        parsed.employmentType,
        parsed.experienceLevel,
        parsed.educationRequirement,
        JSON.stringify(parsed.skills),
        sourceId,
        post.sourceUrl || null,
        post.rawContent,
        parsed.deadlineAt,
        post.postedAt,
        dedupHash,
      ]
    );
    created += 1;
  }

  await query('UPDATE job_sources SET last_successful_sync = now() WHERE id = $1', [sourceId]);

  return { created, duplicates, skipped, total: posts.length };
};

export const listJobs = async ({ page = 1, limit = 20, keyword, location }) => {
  const safePage = Math.max(Number(page) || 1, 1);
  const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 100);
  const conditions = ["status = 'ACTIVE'"];
  const values = [];
  let i = 1;

  if (keyword) {
    conditions.push(`(title ILIKE $${i} OR description ILIKE $${i})`);
    values.push(`%${keyword}%`);
    i += 1;
  }

  if (location) {
    conditions.push(`location ILIKE $${i}`);
    values.push(`%${location}%`);
    i += 1;
  }

  const whereClause = conditions.join(' AND ');
  const offset = (safePage - 1) * safeLimit;

  const { rows } = await query(
    `SELECT j.*, o.name AS organization_name
     FROM jobs j
     LEFT JOIN organizations o ON o.id = j.organization_id
     WHERE ${whereClause}
     ORDER BY j.posted_at DESC NULLS LAST, j.created_at DESC
     LIMIT $${i} OFFSET $${i + 1}`,
    [...values, safeLimit, offset]
  );

  const { rows: countRows } = await query(
    `SELECT COUNT(*) FROM jobs j WHERE ${whereClause}`,
    values
  );

  return { jobs: rows, total: Number(countRows[0].count), page: safePage, limit: safeLimit };
};
