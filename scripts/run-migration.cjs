/**
 * Run SQL Migration directly via Supabase Database
 */

const fs = require('fs');

// Supabase Database URL (Transaction pooler)
const DATABASE_URL = 'postgresql://postgres.qzpmiiqfwkcnrhvubdgt:Promo2024FM!@aws-0-eu-central-1.pooler.supabase.com:6543/postgres';

async function runMigration() {
  // Dynamic import for ES module
  const { default: postgres } = await import('postgres');

  const sql = postgres(DATABASE_URL, {
    ssl: 'require',
    max: 1,
    idle_timeout: 20
  });

  try {
    console.log('📦 Connecting to database...');

    // Read migration file
    const migrationSQL = fs.readFileSync(
      '/Users/nikita/Desktop/Стильный кабинет артиста2/supabase/migrations/008_email_subscribers.sql',
      'utf-8'
    );

    console.log('🚀 Running migration...\n');

    // Execute
    await sql.unsafe(migrationSQL);

    console.log('✅ Migration completed successfully!');

    // Verify table exists
    const tables = await sql`
      SELECT tablename FROM pg_tables
      WHERE schemaname = 'public' AND tablename = 'email_subscribers'
    `;

    if (tables.length > 0) {
      console.log('✅ Table email_subscribers created!');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sql.end();
  }
}

runMigration();
