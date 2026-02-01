/**
 * IMPORT PITCHING DATABASES TO SUPABASE
 *
 * Импортирует данные из Excel файлов в таблицы:
 * - pitching_venues (клубы и заведения)
 * - pitching_radio (радио и телеканалы)
 */

const XLSX = require('xlsx');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');

// Supabase config
const SUPABASE_URL = 'https://qzpmiiqfwkcnrhvubdgt.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6cG1paXFmd2tjbnJodnViZGd0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTMzNTMzMywiZXhwIjoyMDg0OTExMzMzfQ.ik9Us-02grJpARn_f4bhEjRt7Afy753TS-DhynxleK8';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// File paths
const BASE_PATH = '/Users/nikita/Desktop/БАЗЫ ПРОМО';
const FILES = {
  booking: path.join(BASE_PATH, 'BAZA_MFC_BOOKING.xlsx'),
  clubs: path.join(BASE_PATH, 'База ночных клубов.xlsx'),
  tv: path.join(BASE_PATH, 'Телеканалы База.xlsx'),
  dubai: path.join(BASE_PATH, 'База Дубаи Global Dance.xlsx'),
  kazakhstan: path.join(BASE_PATH, 'База Казахстан Global Dance.xls'),
  belarus: path.join(BASE_PATH, 'Беларусь Global Dance.xlsx'),
};

// Parse city and timezone from string like "Абакан (4:40)"
function parseCityTimezone(str) {
  if (!str) return { city: '', timezone: null };
  const match = str.match(/^([^(]+)(?:\s*\(([^)]+)\))?/);
  if (match) {
    return {
      city: match[1].trim(),
      timezone: match[2] || null
    };
  }
  return { city: str.trim(), timezone: null };
}

// Clean phone number
function cleanPhone(phone) {
  if (!phone) return null;
  return String(phone).replace(/\s+/g, ' ').trim();
}

// Clean email
function cleanEmail(email) {
  if (!email) return null;
  const str = String(email).trim().toLowerCase();
  // Extract email from string if contains other text
  const match = str.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  return match ? match[0] : null;
}

// Import BAZA_MFC_BOOKING.xlsx - main clubs database
async function importBookingDatabase() {
  console.log('\n📥 Importing BAZA_MFC_BOOKING.xlsx...');

  const wb = XLSX.readFile(FILES.booking);
  const ws = wb.Sheets[wb.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(ws, { header: ['city', 'club', 'phone', 'email'] });

  // Skip header row
  const rows = data.slice(1).filter(row => row.club);
  console.log(`Found ${rows.length} clubs`);

  const venues = rows.map(row => {
    const { city, timezone } = parseCityTimezone(row.city);
    return {
      name: String(row.club || '').trim(),
      venue_type: 'club',
      city: city,
      country: city.includes('КЗ') ? 'Казахстан' : 'Россия',
      contact_phone: cleanPhone(row.phone),
      contact_email: cleanEmail(row.email),
      admin_notes: timezone ? `Часовой пояс: ${timezone}` : null,
      is_active: true,
      accepts_music: true,
    };
  }).filter(v => v.name);

  console.log(`Prepared ${venues.length} venues for import`);

  // Insert in batches
  const BATCH_SIZE = 100;
  let imported = 0;

  for (let i = 0; i < venues.length; i += BATCH_SIZE) {
    const batch = venues.slice(i, i + BATCH_SIZE);
    const { error } = await supabase.from('pitching_venues').insert(batch);
    if (error) {
      console.error(`Error at batch ${i}:`, error.message);
    } else {
      imported += batch.length;
      console.log(`Imported ${imported}/${venues.length} venues`);
    }
  }

  return imported;
}

// Import TV channels
async function importTVChannels() {
  console.log('\n📥 Importing Телеканалы База.xlsx...');

  const wb = XLSX.readFile(FILES.tv);
  const ws = wb.Sheets[wb.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(ws, { header: ['_', 'channel', 'contact', 'email'] });

  // Filter valid rows (skip headers and section titles)
  const rows = data.filter(row =>
    row.channel &&
    row.email &&
    !['Россия', 'Музыкальные', 'Украина', 'Беларусь', 'Казахстан'].includes(row.channel)
  );

  console.log(`Found ${rows.length} TV channels`);

  const channels = rows.map(row => ({
    name: String(row.channel || '').trim(),
    radio_type: 'other', // TV channel
    editor_name: String(row.contact || '').trim() || null,
    editor_email: cleanEmail(row.email),
    country: 'Россия',
    is_active: true,
    accepts_submissions: true,
    admin_notes: 'Телеканал',
  })).filter(c => c.name);

  console.log(`Prepared ${channels.length} channels for import`);

  // Insert in batches
  const BATCH_SIZE = 100;
  let imported = 0;

  for (let i = 0; i < channels.length; i += BATCH_SIZE) {
    const batch = channels.slice(i, i + BATCH_SIZE);
    const { error } = await supabase.from('pitching_radio').insert(batch);
    if (error) {
      console.error(`Error at batch ${i}:`, error.message);
    } else {
      imported += batch.length;
      console.log(`Imported ${imported}/${channels.length} channels`);
    }
  }

  return imported;
}

// Import regional databases (Dubai, Kazakhstan, Belarus)
async function importRegionalDatabases() {
  console.log('\n📥 Importing regional databases...');

  let totalImported = 0;

  const regional = [
    { file: FILES.dubai, country: 'ОАЭ', city: 'Дубай' },
    { file: FILES.kazakhstan, country: 'Казахстан', city: null },
    { file: FILES.belarus, country: 'Беларусь', city: null },
  ];

  for (const region of regional) {
    try {
      console.log(`Processing ${path.basename(region.file)}...`);
      const wb = XLSX.readFile(region.file);
      const ws = wb.Sheets[wb.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

      // Skip header
      const rows = data.slice(1).filter(row => row && row.length > 0);
      console.log(`Found ${rows.length} rows`);

      // Try to detect column structure
      const headers = data[0] || [];
      console.log('Headers:', headers);

      const venues = rows.map(row => {
        // Assume: Name, Contact/Phone, Email or similar
        return {
          name: String(row[0] || row[1] || '').trim(),
          venue_type: 'club',
          city: region.city || String(row[0] || '').trim(),
          country: region.country,
          contact_phone: cleanPhone(row[2] || row[1]),
          contact_email: cleanEmail(row[3] || row[2]),
          is_active: true,
          accepts_music: true,
        };
      }).filter(v => v.name && v.name.length > 1);

      if (venues.length > 0) {
        const { error } = await supabase.from('pitching_venues').insert(venues);
        if (error) {
          console.error(`Error importing ${region.country}:`, error.message);
        } else {
          console.log(`✅ Imported ${venues.length} venues from ${region.country}`);
          totalImported += venues.length;
        }
      }
    } catch (e) {
      console.error(`Failed to import ${region.file}:`, e.message);
    }
  }

  return totalImported;
}

// Main
async function main() {
  console.log('🚀 Starting pitching data import...\n');

  let total = 0;

  // Import main booking database
  total += await importBookingDatabase();

  // Import TV channels
  total += await importTVChannels();

  // Import regional databases
  total += await importRegionalDatabases();

  console.log(`\n✅ Import complete! Total records: ${total}`);
}

main().catch(console.error);
