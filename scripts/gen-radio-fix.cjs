const fs = require('fs');
const XLSX = require('xlsx');
const BASE = '/Users/nikita/Desktop/БАЗЫ ПРОМО 2/';

function esc(s) {
  if (!s) return '';
  return String(s).replace(/'/g, "''").replace(/\n/g, ' ').trim().substring(0, 200);
}

function parseCSV(file) {
  const content = fs.readFileSync(BASE + file, 'utf-8');
  const lines = content.split('\n');
  return lines.slice(1).filter(l => l.trim()).map(line => {
    const vals = line.split(';');
    return { email: vals[1] || '' };
  });
}

function parseXLSX(file) {
  const wb = XLSX.readFile(BASE + file);
  return XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], {defval: ''});
}

const seen = new Set();
const rows = [];

// Tophit - FM.xlsx
console.log('Tophit - FM.xlsx...');
try {
  const records = parseXLSX('Tophit - FM.xlsx');
  let count = 0;
  for (const r of records) {
    const email = String(r.email || '').toLowerCase().trim();
    if (email && email.includes('@') && !seen.has(email)) {
      seen.add(email);
      const name = email.split('@')[0];
      rows.push(`('${esc(name)}', '${esc(email)}', 'fm', 'Россия')`);
      count++;
    }
  }
  console.log(`  Added: ${count}`);
} catch(e) { console.log('  Error:', e.message); }

// фм россия.csv
console.log('фм россия.csv...');
try {
  const records = parseCSV('фм россия.csv');
  let count = 0;
  for (const r of records) {
    const email = String(r.email || '').toLowerCase().trim();
    if (email && email.includes('@') && !seen.has(email)) {
      seen.add(email);
      const name = email.split('@')[0];
      rows.push(`('${esc(name)}', '${esc(email)}', 'fm', 'Россия')`);
      count++;
    }
  }
  console.log(`  Added: ${count}`);
} catch(e) { console.log('  Error:', e.message); }

// Радио самая самая полная.xlsx - только email
console.log('Радио самая самая полная.xlsx...');
try {
  const records = parseXLSX('Радио самая самая полная.xlsx');
  let count = 0;
  for (const r of records) {
    const email = String(r['email'] || '').toLowerCase().trim();
    if (email && email.includes('@') && !seen.has(email)) {
      seen.add(email);
      const name = email.split('@')[0];
      rows.push(`('${esc(name)}', '${esc(email)}', 'fm', 'Россия')`);
      count++;
    }
  }
  console.log(`  Added: ${count}`);
} catch(e) { console.log('  Error:', e.message); }

// Generate SQL - all rows have exactly 4 values
const sql = `-- Radio import (all 4 columns)
INSERT INTO pitching_radio (name, email, radio_type, country) VALUES
${rows.join(',\n')}
ON CONFLICT DO NOTHING;

SELECT 'Added ${rows.length} radio stations' as result;`;

fs.writeFileSync('/tmp/radio_fixed.sql', sql);
console.log(`\nTotal: ${rows.length} rows`);
console.log('Saved to /tmp/radio_fixed.sql');
