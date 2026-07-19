import { pool } from '../src/database/pool.js';

const email = process.argv[2];

if (!email) {
  console.error('Usage: node scripts/promoteAdmin.js <email>');
  process.exit(1);
}

const run = async () => {
  const { rowCount } = await pool.query(
    "UPDATE users SET role = 'ADMIN', updated_at = now() WHERE email = $1",
    [email]
  );

  console.log(rowCount ? `Promoted ${email} to ADMIN.` : `No user found with email ${email}.`);
  await pool.end();
};

run().catch(async (err) => {
  console.error('Failed to promote admin:', err);
  await pool.end();
  process.exit(1);
});
