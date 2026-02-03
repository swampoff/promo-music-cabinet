const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const client = new Client({
  connectionString: 'postgresql://postgres.qzpmiiqfwkcnrhvubdgt:vGotNvENkLVBq1j9@aws-0-eu-central-1.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

const files = [
  '00_extensions.sql',
  '01_users_module.sql',
  '02_pitching_module.sql',
  '03_finance_module.sql',
  '04_partners_support_modules.sql',
  '05_analytics_marketing_system.sql',
  '06_functions_triggers.sql',
  '07_views_rls.sql',
  '08_optimization_indexes.sql',
  '09_admin_settings.sql',
  '10_admin_settings_seed.sql'
];

async function run() {
  try {
    await client.connect();
    console.log('Connected to database');

    for (const file of files) {
      const filePath = path.join(__dirname, 'database', file);
      if (!fs.existsSync(filePath)) {
        console.log(`Skipping ${file} - not found`);
        continue;
      }

      console.log(`\nApplying ${file}...`);
      const sql = fs.readFileSync(filePath, 'utf8');

      try {
        await client.query(sql);
        console.log(`✓ ${file} applied successfully`);
      } catch (err) {
        console.log(`⚠ ${file} - ${err.message.split('\n')[0]}`);
      }
    }

    console.log('\nDone!');
  } catch (err) {
    console.error('Connection error:', err.message);
  } finally {
    await client.end();
  }
}

run();
