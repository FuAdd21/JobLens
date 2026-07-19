import { pool, query } from '../../database/pool.js';

export const getProfileByUserId = async (userId) => {
  const { rows } = await query(
    `SELECT p.*, u.email
     FROM profiles p
     JOIN users u ON u.id = p.user_id
     WHERE p.user_id = $1`,
    [userId]
  );
  return rows[0] || null;
};

export const ensureProfileExists = async (userId) => {
  await query(
    `INSERT INTO profiles (user_id) VALUES ($1)
     ON CONFLICT (user_id) DO NOTHING`,
    [userId]
  );
};

const camelToSnakeMap = {
  firstName: 'first_name',
  lastName: 'last_name',
  country: 'country',
  city: 'city',
  educationLevel: 'education_level',
  profession: 'profession',
  experienceLevel: 'experience_level',
  industry: 'industry',
  bio: 'bio',
  preferredLocations: 'preferred_locations',
  employmentTypes: 'employment_types',
  workArrangement: 'work_arrangement',
};

const JSONB_FIELDS = new Set(['preferred_locations', 'employment_types', 'work_arrangement']);

export const updateProfile = async (userId, updates) => {
  await ensureProfileExists(userId);

  const setClauses = [];
  const values = [];
  let i = 1;

  for (const [camelKey, value] of Object.entries(updates)) {
    const column = camelToSnakeMap[camelKey];
    if (!column) continue;

    setClauses.push(`${column} = $${i}`);
    values.push(JSONB_FIELDS.has(column) ? JSON.stringify(value) : value);
    i += 1;
  }

  if (setClauses.length > 0) {
    setClauses.push('updated_at = now()');
    values.push(userId);

    await query(
      `UPDATE profiles SET ${setClauses.join(', ')} WHERE user_id = $${i}`,
      values
    );
  }

  await recalculateProfileCompleteness(userId);
  return getProfileByUserId(userId);
};

const recalculateProfileCompleteness = async (userId) => {
  const profile = await getProfileByUserId(userId);
  const isComplete = Boolean(
    profile?.profession && profile.education_level && profile.experience_level
  );

  await query(
    'UPDATE profiles SET profile_completed = $1, updated_at = now() WHERE user_id = $2',
    [isComplete, userId]
  );
};

const findOrCreateSkill = async (client, name, category = null) => {
  const normalized = name.trim();
  const existing = await client.query('SELECT * FROM skills WHERE name = $1', [normalized]);
  if (existing.rows[0]) return existing.rows[0];

  const inserted = await client.query(
    'INSERT INTO skills (name, category) VALUES ($1, $2) RETURNING *',
    [normalized, category]
  );
  return inserted.rows[0];
};

export const getUserSkills = async (userId) => {
  const { rows } = await query(
    `SELECT s.id, s.name, s.category, us.proficiency_level, us.years_experience
     FROM user_skills us
     JOIN skills s ON s.id = us.skill_id
     WHERE us.user_id = $1
     ORDER BY s.name`,
    [userId]
  );
  return rows;
};

export const setUserSkills = async (userId, skills) => {
  await ensureProfileExists(userId);

  const uniqueSkills = Array.from(
    new Map(
      skills
        .map((skill) => ({ ...skill, name: skill.name.trim() }))
        .filter((skill) => skill.name)
        .map((skill) => [skill.name.toLowerCase(), skill])
    ).values()
  );

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('DELETE FROM user_skills WHERE user_id = $1', [userId]);

    for (const skill of uniqueSkills) {
      const skillRow = await findOrCreateSkill(client, skill.name, skill.category);
      await client.query(
        `INSERT INTO user_skills (user_id, skill_id, proficiency_level, years_experience)
         VALUES ($1, $2, $3, $4)`,
        [
          userId,
          skillRow.id,
          skill.proficiencyLevel || 'INTERMEDIATE',
          skill.yearsExperience ?? 0,
        ]
      );
    }

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }

  await recalculateProfileCompleteness(userId);
  return getUserSkills(userId);
};

export const searchSkills = async (searchTerm = '', limit = 10) => {
  const safeLimit = Math.min(Math.max(Number(limit) || 10, 1), 50);
  const { rows } = await query(
    `SELECT id, name, category FROM skills
     WHERE name ILIKE $1
     ORDER BY name
     LIMIT $2`,
    [`%${searchTerm}%`, safeLimit]
  );
  return rows;
};
