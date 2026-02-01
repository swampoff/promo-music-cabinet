const fs = require('fs');
const XLSX = require('xlsx');
const BASE = '/Users/nikita/Desktop/БАЗЫ ПРОМО 2/';

function esc(s) { return s ? String(s).replace(/'/g, "''").trim().substring(0, 200) : ''; }

function parseXLSX(file) {
  const wb = XLSX.readFile(BASE + file);
  return XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], {defval: ''});
}

let sql = '';

// === Радио Мск.xlsx → pitching_radio ===
console.log('Processing Радио Мск.xlsx...');
try {
  const records = parseXLSX('Радио Мск.xlsx');
  const rows = [];

  for (const r of records) {
    const name = r['Радио'] || '';
    const contacts = r['Контакты'] || '';
    const notes = r['Примечания'] || '';
    if (!name) continue;

    const emailMatch = contacts.match(/[\w.-]+@[\w.-]+\.\w+/);
    const email = emailMatch ? emailMatch[0].toLowerCase() : '';

    rows.push(`('${esc(name)}', '${esc(email)}', 'fm', 'Россия', 'Москва', '${esc(contacts)}', '${esc(notes)}')`);
  }

  if (rows.length > 0) {
    sql += `-- Радио Мск.xlsx\nINSERT INTO pitching_radio (name, email, radio_type, country, city, editor_name, admin_notes) VALUES\n${rows.join(',\n')}\nON CONFLICT DO NOTHING;\n\n`;
  }
  console.log(`  ${rows.length} records`);
} catch(e) { console.log('Error:', e.message); }

// === Радио самая самая полная.xlsx → pitching_radio ===
console.log('Processing Радио самая самая полная.xlsx...');
try {
  const records = parseXLSX('Радио самая самая полная.xlsx');
  const rows = [];
  const seen = new Set();

  for (const r of records) {
    const city = r['Город'] || '';
    const station = r['станция'] || '';
    const email = (r['email'] || '').toLowerCase().trim();
    const contact = r['обращение SMTP'] || '';

    if (!station && !email) continue;
    const name = station || email.split('@')[0];
    const key = name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);

    rows.push(`('${esc(name)}', '${esc(email)}', 'fm', 'Россия', '${esc(city)}', '${esc(contact)}')`);
  }

  if (rows.length > 0) {
    sql += `-- Радио самая полная.xlsx\nINSERT INTO pitching_radio (name, email, radio_type, country, city, editor_name) VALUES\n${rows.join(',\n')}\nON CONFLICT DO NOTHING;\n\n`;
  }
  console.log(`  ${rows.length} records`);
} catch(e) { console.log('Error:', e.message); }

// === 123 базы bs.xlsx → pitching_venues ===
console.log('Processing 123 базы bs.xlsx...');
try {
  const records = parseXLSX('123 базы bs.xlsx');
  const rows = [];

  for (const r of records) {
    const city = r['Город'] || '';
    const name = r['Клуб, Ресторан,Орг, Ивент'] || '';
    const contact = r['Имя/Должность'] || '';
    const phone = r['Телефон, Smm'] || '';
    const email = (r['Email'] || '').toLowerCase().trim();

    if (!name || name.length < 2) continue;

    rows.push(`('${esc(name)}', '${esc(city)}', '${esc(email)}', '${esc(phone)}', '${esc(contact)}')`);
  }

  if (rows.length > 0) {
    sql += `-- 123 базы bs.xlsx\nINSERT INTO pitching_venues (name, city, email, phone, contact_name) VALUES\n${rows.join(',\n')}\nON CONFLICT DO NOTHING;\n\n`;
  }
  console.log(`  ${rows.length} records`);
} catch(e) { console.log('Error:', e.message); }

// === Телеканалы База.xlsx → pitching_tv ===
console.log('Processing Телеканалы База.xlsx...');
try {
  const records = parseXLSX('Телеканалы База.xlsx');
  const rows = [];

  for (const r of records) {
    const name = r['Каналы'] || r['__EMPTY_1'] || '';
    const contact = r['Контактное лицо'] || r['__EMPTY_2'] || '';
    const email = (r['Почта'] || r['__EMPTY_3'] || '').toLowerCase().trim();

    if (!name || name === 'Каналы' || name.length < 2) continue;

    rows.push(`('${esc(name)}', '${esc(email)}', '${esc(contact)}')`);
  }

  if (rows.length > 0) {
    sql += `-- Телеканалы База.xlsx\nINSERT INTO pitching_tv (name, email, editor_name) VALUES\n${rows.join(',\n')}\nON CONFLICT DO NOTHING;\n\n`;
  }
  console.log(`  ${rows.length} records`);
} catch(e) { console.log('Error:', e.message); }

sql += "SELECT 'Import complete!' as result;";

fs.writeFileSync('/tmp/import_remaining.sql', sql);
console.log('\nWritten to /tmp/import_remaining.sql');
