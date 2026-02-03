const fs = require('fs');
const path = require('path');

const PROJECT_REF = 'qzpmiiqfwkcnrhvubdgt';
const ACCESS_TOKEN = 'sbp_8654237cc54bc0d995b421db1b38b23bed922c82';

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

async function executeSql(sql) {
  const response = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query: sql })
  });

  const text = await response.text();

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${text}`);
  }

  return text;
}

async function run() {
  console.log('Starting SQL migrations via Supabase Management API...\n');

  for (const file of files) {
    const filePath = path.join(__dirname, 'database', file);

    if (!fs.existsSync(filePath)) {
      console.log(`⚠ Skipping ${file} - not found`);
      continue;
    }

    console.log(`Applying ${file}...`);
    const sql = fs.readFileSync(filePath, 'utf8');

    try {
      const result = await executeSql(sql);
      console.log(`✓ ${file} applied successfully`);
    } catch (err) {
      console.log(`✗ ${file} - ${err.message.substring(0, 200)}`);
    }
  }

  console.log('\nDone!');
}

run().catch(console.error);
