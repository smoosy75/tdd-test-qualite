import fs from 'node:fs';
import path from 'node:path';
import { query } from './db';

async function runMigrations() {
  const dir = path.join(__dirname, '..', 'migrations');
  const files = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  for (const file of files) {
    const sql = fs.readFileSync(path.join(dir, file), 'utf8');
    console.log(`🧩 Running migration: ${file}`);
    await query(sql);
  }

  console.log('✅ All migrations applied');
  process.exit(0);
}

runMigrations().catch((err) => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
