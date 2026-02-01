/**
 * Import all pitching data from БАЗЫ ПРОМО 2
 */

const fs = require('fs');
const XLSX = require('xlsx');

const BASE_PATH = '/Users/nikita/Desktop/БАЗЫ ПРОМО 2/';

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

function parseXLSX(filePath, sheetIndex = 0) {
  const wb = XLSX.readFile(filePath);
  const sheet = wb.Sheets[wb.SheetNames[sheetIndex]];
  return XLSX.utils.sheet_to_json(sheet, { defval: '' });
}

function escapeSQL(str) {
  if (!str) return '';
  return String(str).replace(/'/g, "''").trim();
}

// ============ TV DATA ============
function importTV() {
  const sqls = [];

  // тв.csv - subscriber format, extract emails
  try {
    const content = fs.readFileSync(BASE_PATH + 'тв.csv', 'utf-8');
    const records = parseCSV(content);
    console.log(`тв.csv: ${records.length} records`);

    for (const r of records) {
      const email = r.email?.toLowerCase().trim();
      if (!email || !email.includes('@')) continue;
      sqls.push(`('${escapeSQL(email)}', '${escapeSQL(email.split('@')[0])}', 'tv')`);
    }
  } catch(e) { console.log('Error тв.csv:', e.message); }

  // ноая база тв.csv
  try {
    const content = fs.readFileSync(BASE_PATH + 'ноая база тв.csv', 'utf-8');
    const records = parseCSV(content);
    console.log(`ноая база тв.csv: ${records.length} records`);

    for (const r of records) {
      const email = r.email?.toLowerCase().trim();
      if (!email || !email.includes('@')) continue;
      sqls.push(`('${escapeSQL(email)}', '${escapeSQL(email.split('@')[0])}', 'tv')`);
    }
  } catch(e) { console.log('Error ноая база тв.csv:', e.message); }

  // Телеканалы База.xlsx - structured data
  try {
    const records = parseXLSX(BASE_PATH + 'Телеканалы База.xlsx');
    console.log(`Телеканалы База.xlsx: ${records.length} records`);

    for (const r of records) {
      const name = r['Каналы'] || r['__EMPTY_1'] || '';
      const contact = r['Контактное лицо'] || r['__EMPTY_2'] || '';
      const email = r['Почта'] || r['__EMPTY_3'] || '';
      if (!name || name === 'Каналы') continue;
      sqls.push(`('${escapeSQL(email)}', '${escapeSQL(name)}', '${escapeSQL(contact)}')`);
    }
  } catch(e) { console.log('Error Телеканалы База.xlsx:', e.message); }

  return sqls;
}

// ============ MEDIA DATA ============
function importMedia() {
  const sqls = [];

  // сми.csv
  try {
    const content = fs.readFileSync(BASE_PATH + 'сми.csv', 'utf-8');
    const records = parseCSV(content);
    console.log(`сми.csv: ${records.length} records`);

    for (const r of records) {
      const email = r.email?.toLowerCase().trim();
      if (!email || !email.includes('@')) continue;
      const name = email.split('@')[1]?.split('.')[0] || email;
      sqls.push(`('${escapeSQL(name)}', '${escapeSQL(email)}', 'online')`);
    }
  } catch(e) { console.log('Error сми.csv:', e.message); }

  return sqls;
}

// ============ RADIO DATA ============
function importRadio() {
  const sqls = [];

  // фм россия.csv
  try {
    const content = fs.readFileSync(BASE_PATH + 'фм россия.csv', 'utf-8');
    const records = parseCSV(content);
    console.log(`фм россия.csv: ${records.length} records`);

    for (const r of records) {
      const email = r.email?.toLowerCase().trim();
      if (!email || !email.includes('@')) continue;
      const name = email.split('@')[1]?.split('.')[0] || 'FM Station';
      sqls.push(`('${escapeSQL(name)}', '${escapeSQL(email)}', 'fm', 'Россия')`);
    }
  } catch(e) { console.log('Error фм россия.csv:', e.message); }

  // Tophit - FM.xlsx
  try {
    const records = parseXLSX(BASE_PATH + 'Tophit - FM.xlsx');
    console.log(`Tophit - FM.xlsx: ${records.length} records`);

    for (const r of records) {
      const email = (r.email || '').toLowerCase().trim();
      if (!email || !email.includes('@')) continue;
      const name = email.split('@')[1]?.split('.')[0] || 'FM Station';
      sqls.push(`('${escapeSQL(name)}', '${escapeSQL(email)}', 'fm', 'Россия')`);
    }
  } catch(e) { console.log('Error Tophit - FM.xlsx:', e.message); }

  // Радио Мск.xlsx - structured
  try {
    const records = parseXLSX(BASE_PATH + 'Радио Мск.xlsx');
    console.log(`Радио Мск.xlsx: ${records.length} records`);

    for (const r of records) {
      const holding = r['Холдинг'] || '';
      const name = r['Радио'] || '';
      const contacts = r['Контакты'] || '';
      const notes = r['Примечания'] || '';
      if (!name) continue;

      // Extract email from contacts
      const emailMatch = contacts.match(/[\w.-]+@[\w.-]+\.\w+/);
      const email = emailMatch ? emailMatch[0] : '';

      sqls.push(`('${escapeSQL(name)}', '${escapeSQL(email)}', 'fm', 'Россия', 'Москва', '${escapeSQL(contacts)}', '${escapeSQL(notes)}')`);
    }
  } catch(e) { console.log('Error Радио Мск.xlsx:', e.message); }

  // Радио самая самая полная.xlsx
  try {
    const records = parseXLSX(BASE_PATH + 'Радио самая самая полная.xlsx');
    console.log(`Радио самая самая полная.xlsx: ${records.length} records`);

    for (const r of records) {
      const country = r['Страна'] || 'RU';
      const city = r['Город'] || '';
      const station = r['станция'] || '';
      const email = (r['email'] || '').toLowerCase().trim();
      const contact = r['обращение SMTP'] || '';
      const phone = r['Телефон'] || '';

      if (!station && !email) continue;
      const name = station || email.split('@')[1]?.split('.')[0] || 'Station';

      sqls.push(`('${escapeSQL(name)}', '${escapeSQL(email)}', 'fm', '${country === 'RU' ? 'Россия' : escapeSQL(country)}', '${escapeSQL(city)}', '${escapeSQL(contact)}', '${escapeSQL(phone)}')`);
    }
  } catch(e) { console.log('Error Радио самая самая полная.xlsx:', e.message); }

  return sqls;
}

// ============ VENUES DATA ============
function importVenues() {
  const sqls = [];

  // 123 базы bs.xlsx
  try {
    const records = parseXLSX(BASE_PATH + '123 базы bs.xlsx');
    console.log(`123 базы bs.xlsx: ${records.length} records`);

    for (const r of records) {
      const city = r['Город'] || '';
      const name = r['Клуб, Ресторан,Орг, Ивент'] || '';
      const contact = r['Имя/Должность'] || '';
      const phone = r['Телефон, Smm'] || '';
      const email = (r['Email'] || '').toLowerCase().trim();

      if (!name) continue;

      sqls.push(`('${escapeSQL(name)}', '${escapeSQL(city)}', '${escapeSQL(email)}', '${escapeSQL(phone)}', '${escapeSQL(contact)}')`);
    }
  } catch(e) { console.log('Error 123 базы bs.xlsx:', e.message); }

  return sqls;
}

// Generate SQL files
console.log('=== Processing files ===\n');

// TV
const tvData = importTV();
const tvSQL = `-- pitching_tv data
INSERT INTO pitching_tv (email, name, editor_name) VALUES
${[...new Set(tvData)].slice(0, 500).join(',\n')}
ON CONFLICT DO NOTHING;`;
fs.writeFileSync('/tmp/import_tv.sql', tvSQL);
console.log(`\nTV: ${tvData.length} records -> /tmp/import_tv.sql`);

// Media
const mediaData = importMedia();
const mediaSQL = `-- pitching_media data
INSERT INTO pitching_media (name, email, media_type) VALUES
${[...new Set(mediaData)].join(',\n')}
ON CONFLICT DO NOTHING;`;
fs.writeFileSync('/tmp/import_media.sql', mediaSQL);
console.log(`Media: ${mediaData.length} records -> /tmp/import_media.sql`);

// Radio (additional)
const radioData = importRadio();
const radioSQL = `-- pitching_radio additional data
INSERT INTO pitching_radio (name, email, radio_type, country, city, editor_name, admin_notes) VALUES
${[...new Set(radioData)].slice(0, 1000).join(',\n')}
ON CONFLICT DO NOTHING;`;
fs.writeFileSync('/tmp/import_radio_new.sql', radioSQL);
console.log(`Radio: ${radioData.length} records -> /tmp/import_radio_new.sql`);

// Venues (additional)
const venueData = importVenues();
const venueSQL = `-- pitching_venues additional data
INSERT INTO pitching_venues (name, city, email, phone, contact_name) VALUES
${[...new Set(venueData)].join(',\n')}
ON CONFLICT DO NOTHING;`;
fs.writeFileSync('/tmp/import_venues_new.sql', venueSQL);
console.log(`Venues: ${venueData.length} records -> /tmp/import_venues_new.sql`);

console.log('\n=== Done! ===');
