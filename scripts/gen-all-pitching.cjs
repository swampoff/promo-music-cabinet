const fs = require('fs');
const XLSX = require('xlsx');
const BASE = '/Users/nikita/Desktop/БАЗЫ ПРОМО 2/';

function esc(s) { return s ? String(s).replace(/'/g, "''").trim() : ''; }

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

let sql = '';

// === pitching_tv ===
sql += 'DROP TABLE IF EXISTS pitching_tv;\n';
sql += 'CREATE TABLE pitching_tv (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT, email TEXT, editor_name TEXT, created_at TIMESTAMPTZ DEFAULT NOW());\n\n';

const tvEmails = new Set();
const tvRows = [];

// тв.csv
try {
  parseCSV('тв.csv').forEach(r => {
    const email = (r.email || '').toLowerCase().trim();
    if (email && email.includes('@') && !tvEmails.has(email)) {
      tvEmails.add(email);
      tvRows.push("('" + esc(email.split('@')[0]) + "', '" + esc(email) + "', 'tv')");
    }
  });
  console.log('тв.csv:', tvEmails.size);
} catch(e) { console.log('Error тв.csv:', e.message); }

// ноая база тв.csv
try {
  parseCSV('ноая база тв.csv').forEach(r => {
    const email = (r.email || '').toLowerCase().trim();
    if (email && email.includes('@') && !tvEmails.has(email)) {
      tvEmails.add(email);
      tvRows.push("('" + esc(email.split('@')[0]) + "', '" + esc(email) + "', 'tv')");
    }
  });
  console.log('ноая база тв.csv: +' + (tvEmails.size - tvRows.length + tvRows.length));
} catch(e) { console.log('Error ноая база тв.csv:', e.message); }

if (tvRows.length > 0) {
  sql += 'INSERT INTO pitching_tv (name, email, editor_name) VALUES\n' + tvRows.join(',\n') + ';\n\n';
}

// === pitching_media ===
sql += 'DROP TABLE IF EXISTS pitching_media;\n';
sql += 'CREATE TABLE pitching_media (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT, email TEXT, media_type TEXT DEFAULT \'online\', created_at TIMESTAMPTZ DEFAULT NOW());\n\n';

const mediaRows = [];
const mediaEmails = new Set();

try {
  parseCSV('сми.csv').forEach(r => {
    const email = (r.email || '').toLowerCase().trim();
    if (email && email.includes('@') && !mediaEmails.has(email)) {
      mediaEmails.add(email);
      const name = email.split('@')[1]?.split('.')[0] || email;
      mediaRows.push("('" + esc(name) + "', '" + esc(email) + "', 'online')");
    }
  });
  console.log('сми.csv:', mediaRows.length);
} catch(e) { console.log('Error сми.csv:', e.message); }

if (mediaRows.length > 0) {
  sql += 'INSERT INTO pitching_media (name, email, media_type) VALUES\n' + mediaRows.join(',\n') + ';\n\n';
}

sql += "SELECT 'Done! TV: " + tvRows.length + ", Media: " + mediaRows.length + "' as result;";

fs.writeFileSync('/tmp/all_pitching.sql', sql);
console.log('\nTotal TV:', tvRows.length);
console.log('Total Media:', mediaRows.length);
console.log('Written to /tmp/all_pitching.sql');
