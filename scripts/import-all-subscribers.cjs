/**
 * Import all email subscribers from БАЗЫ ПРОМО 2
 */

const fs = require('fs');
const XLSX = require('xlsx');

const BASE_PATH = '/Users/nikita/Desktop/БАЗЫ ПРОМО 2/';

// Files with email subscriber format
const subscriberFiles = [
  { file: 'Tophit - FM.xlsx', type: 'radio', format: 'xlsx' },
  { file: 'ноая база тв.csv', type: 'tv', format: 'csv' },
  { file: 'сми.csv', type: 'media', format: 'csv' },
  { file: 'тв.csv', type: 'tv', format: 'csv' },
  { file: 'фм россия.csv', type: 'radio', format: 'csv' },
];

function parseCSV(content) {
  const lines = content.split('\n');
  const headers = lines[0].split(';').map(h => h.trim());
  const records = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const values = line.split(';');
    const record = {};
    headers.forEach((h, idx) => record[h] = values[idx]?.trim() || '');
    records.push(record);
  }
  return records;
}

function parseXLSX(filePath) {
  const wb = XLSX.readFile(filePath);
  const sheet = wb.Sheets[wb.SheetNames[0]];
  return XLSX.utils.sheet_to_json(sheet);
}

function extractEmail(record) {
  return record.email || record.Email || record['email'] || '';
}

function extractStatus(record) {
  const status = record.email_status || record.status || '';
  if (status.toLowerCase().includes('active')) return 'active';
  if (status.toLowerCase().includes('unsubscribed')) return 'unsubscribed';
  return 'unknown';
}

function generateSQL(records, subscriberType) {
  const values = [];
  const seen = new Set();

  for (const r of records) {
    const email = extractEmail(r).toLowerCase().trim();
    if (!email || !email.includes('@') || seen.has(email)) continue;
    seen.add(email);

    const safeEmail = email.replace(/'/g, "''");
    const status = extractStatus(r);
    values.push(`('${safeEmail}', '${status}', '${subscriberType}', 'import')`);
  }

  if (values.length === 0) return null;

  return `INSERT INTO email_subscribers (email, email_status, subscriber_type, source) VALUES
${values.join(',\n')}
ON CONFLICT (email) DO NOTHING;`;
}

// Process all files
let allSQL = [];
let totalRecords = 0;

for (const { file, type, format } of subscriberFiles) {
  const filePath = BASE_PATH + file;
  console.log(`Processing: ${file}`);

  let records;
  try {
    if (format === 'csv') {
      const content = fs.readFileSync(filePath, 'utf-8');
      records = parseCSV(content);
    } else {
      records = parseXLSX(filePath);
    }

    console.log(`  Found ${records.length} records`);
    totalRecords += records.length;

    const sql = generateSQL(records, type);
    if (sql) {
      allSQL.push(`-- ${file}\n${sql}`);
    }
  } catch (e) {
    console.log(`  Error: ${e.message}`);
  }
}

// Write combined SQL
const outputPath = '/tmp/import_all_subscribers.sql';
fs.writeFileSync(outputPath, allSQL.join('\n\n'));
console.log(`\nTotal records: ${totalRecords}`);
console.log(`SQL written to: ${outputPath}`);

// Show preview
console.log('\nPreview:');
console.log(fs.readFileSync(outputPath, 'utf-8').substring(0, 500) + '...');
