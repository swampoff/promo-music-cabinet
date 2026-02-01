/**
 * Import Email Subscribers from CSV
 * Импорт подписчиков из файла Исполнители.csv
 */

const fs = require('fs');
const path = require('path');

// Supabase config
const SUPABASE_URL = 'https://qzpmiiqfwkcnrhvubdgt.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6cG1paXFmd2tjbnJodnViZGd0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTMzNTMzMywiZXhwIjoyMDg0OTExMzMzfQ.ik9Us-02grJpARn_f4bhEjRt7Afy753TS-DhynxleK8';

const CSV_FILE = '/Users/nikita/Desktop/БАЗЫ ПРОМО 2/Исполнители.csv';

async function supabaseRequest(endpoint, method = 'GET', body = null) {
  const url = `${SUPABASE_URL}/rest/v1/${endpoint}`;
  const options = {
    method,
    headers: {
      'apikey': SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal'
    }
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Supabase error: ${response.status} - ${text}`);
  }

  if (method === 'GET') {
    return response.json();
  }

  return { success: true };
}

function parseCSV(content) {
  const lines = content.split('\n');
  const headers = lines[0].split(';').map(h => h.trim());

  console.log('Headers:', headers);

  const records = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = line.split(';');

    const record = {};
    headers.forEach((header, index) => {
      record[header] = values[index] ? values[index].trim() : '';
    });

    records.push(record);
  }

  return records;
}

function mapEmailStatus(status) {
  if (!status) return 'unknown';

  const statusLower = status.toLowerCase();

  if (statusLower.includes('active')) return 'active';
  if (statusLower.includes('unsubscribed')) return 'unsubscribed';
  if (statusLower.includes("can't send") || statusLower.includes('invalid')) return 'invalid';
  if (statusLower.includes('bounced')) return 'bounced';

  return 'unknown';
}

async function importSubscribers() {
  console.log('📧 Starting subscribers import...\n');

  // Read CSV
  console.log(`Reading: ${CSV_FILE}`);
  const content = fs.readFileSync(CSV_FILE, 'utf-8');
  const records = parseCSV(content);

  console.log(`Found ${records.length} records\n`);

  // Transform to Supabase format
  const subscribers = records.map(r => ({
    external_id: r.subscriber_id || null,
    email: r.email ? r.email.toLowerCase().trim() : null,
    phone: r.phone || null,
    name: r['имя'] || null,
    email_status: mapEmailStatus(r.email_status),
    phone_status: r.phone_status || null,
    subscriber_type: 'artist',
    source: 'import',
    imported_at: r.Added ? new Date(r.Added).toISOString() : null,
    marketing_consent: !r.email_status?.toLowerCase().includes('unsubscribed'),
    unsubscribed_at: r.email_status?.toLowerCase().includes('unsubscribed') ? new Date().toISOString() : null
  })).filter(s => s.email && s.email.includes('@')); // Filter valid emails only

  console.log(`Valid emails: ${subscribers.length}\n`);

  // Deduplicate by email
  const uniqueEmails = new Map();
  for (const sub of subscribers) {
    if (!uniqueEmails.has(sub.email)) {
      uniqueEmails.set(sub.email, sub);
    }
  }

  const uniqueSubscribers = Array.from(uniqueEmails.values());
  console.log(`Unique emails: ${uniqueSubscribers.length}\n`);

  // Import in batches
  const BATCH_SIZE = 100;
  let imported = 0;
  let skipped = 0;
  let errors = 0;

  for (let i = 0; i < uniqueSubscribers.length; i += BATCH_SIZE) {
    const batch = uniqueSubscribers.slice(i, i + BATCH_SIZE);

    try {
      // Use upsert to handle duplicates
      await supabaseRequest(
        'email_subscribers?on_conflict=email',
        'POST',
        batch
      );

      imported += batch.length;
      process.stdout.write(`\rImported: ${imported}/${uniqueSubscribers.length}`);
    } catch (error) {
      // Try one by one if batch fails
      for (const sub of batch) {
        try {
          await supabaseRequest(
            'email_subscribers?on_conflict=email',
            'POST',
            [sub]
          );
          imported++;
        } catch (e) {
          if (e.message.includes('duplicate') || e.message.includes('unique')) {
            skipped++;
          } else {
            errors++;
            console.error(`\nError for ${sub.email}: ${e.message}`);
          }
        }
      }
      process.stdout.write(`\rImported: ${imported}/${uniqueSubscribers.length}`);
    }
  }

  console.log('\n');
  console.log('='.repeat(50));
  console.log('📊 Import Results:');
  console.log(`   ✅ Imported: ${imported}`);
  console.log(`   ⏭️  Skipped (duplicates): ${skipped}`);
  console.log(`   ❌ Errors: ${errors}`);
  console.log('='.repeat(50));
}

// Run
importSubscribers().catch(console.error);
