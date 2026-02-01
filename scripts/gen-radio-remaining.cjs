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
  const headers = lines[0].split(';').map(h => h.trim());
  return lines.slice(1).filter(l => l.trim()).map(line => {
    const vals = line.split(';');
    const r = {};
    headers.forEach((h, i) => r[h] = vals[i]?.trim() || '');
    return r;
  });
}

function parseXLSX(file) {
  const wb = XLSX.readFile(BASE + file);
  return XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], {defval: ''});
}

const seen = new Set();
const rows = [];

// === Tophit - FM.xlsx ===
console.log('Processing Tophit - FM.xlsx...');
try {
  const records = parseXLSX('Tophit - FM.xlsx');
  for (const r of records) {
    const email = (r.email || '').toLowerCase().trim();
    if (!email || !email.includes('@') || seen.has(email)) continue;
    seen.add(email);
    const name = email.split('@')[1]?.split('.')[0] || 'FM';
    rows.push(`('${esc(name)}', '${esc(email)}', 'fm', 'Россия')`);
  }
  console.log(`  Added: ${rows.length}`);
} catch(e) { console.log('Error:', e.message); }

// === фм россия.csv ===
console.log('Processing фм россия.csv...');
const beforeFm = rows.length;
try {
  const records = parseCSV('фм россия.csv');
  for (const r of records) {
    const email = (r.email || '').toLowerCase().trim();
    if (!email || !email.includes('@') || seen.has(email)) continue;
    seen.add(email);
    const name = email.split('@')[1]?.split('.')[0] || 'FM';
    rows.push(`('${esc(name)}', '${esc(email)}', 'fm', 'Россия')`);
  }
  console.log(`  Added: ${rows.length - beforeFm}`);
} catch(e) { console.log('Error:', e.message); }

// === Радио самая самая полная.xlsx ===
console.log('Processing Радио самая самая полная.xlsx...');
const beforeFull = rows.length;
try {
  const records = parseXLSX('Радио самая самая полная.xlsx');
  for (const r of records) {
    const city = String(r['Город'] || '');
    const station = String(r['станция'] || '');
    const email = String(r['email'] || '').toLowerCase().trim();
    const contact = String(r['обращение SMTP'] || '');

    if (!email || !email.includes('@') || seen.has(email)) continue;
    seen.add(email);

    const name = station.substring(0, 100) || email.split('@')[0];
    rows.push(`('${esc(name)}', '${esc(email)}', 'fm', 'Россия', '${esc(city)}', '${esc(contact)}')`);
  }
  console.log(`  Added: ${rows.length - beforeFull}`);
} catch(e) { console.log('Error:', e.message); }

// Generate SQL
let sql = `-- Remaining radio files
INSERT INTO pitching_radio (name, email, radio_type, country, city, editor_name) VALUES
${rows.join(',\n')}
ON CONFLICT DO NOTHING;

SELECT 'Imported ${rows.length} radio stations!' as result;`;

fs.writeFileSync('/tmp/import_radio_all.sql', sql);
console.log(`\nTotal: ${rows.length} records`);
console.log('Written to /tmp/import_radio_all.sql');
