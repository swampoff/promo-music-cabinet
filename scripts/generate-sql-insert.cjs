const fs = require('fs');

const csv = fs.readFileSync('/Users/nikita/Desktop/БАЗЫ ПРОМО 2/Исполнители.csv', 'utf-8');
const lines = csv.split('\n').slice(1).filter(l => l.trim());

console.log(`Total lines: ${lines.length}`);

const values = [];
for (const line of lines) {
  const parts = line.split(';');
  const email = parts[1];
  const status = parts[2] || '';

  if (!email || !email.includes('@')) continue;

  const safeEmail = email.toLowerCase().trim().replace(/'/g, "''");
  const safeStatus = status.toLowerCase().includes('active') ? 'active' : 'inactive';

  values.push(`('${safeEmail}', '${safeStatus}', 'artist', 'import')`);
}

console.log(`Valid emails: ${values.length}`);

// Split into batches of 500
const batchSize = 500;
for (let i = 0; i < values.length; i += batchSize) {
  const batch = values.slice(i, i + batchSize);
  const batchNum = Math.floor(i / batchSize) + 1;

  const sql = `INSERT INTO email_subscribers (email, email_status, subscriber_type, source) VALUES
${batch.join(',\n')}
ON CONFLICT (email) DO NOTHING;`;

  fs.writeFileSync(`/tmp/insert_batch_${batchNum}.sql`, sql);
  console.log(`Batch ${batchNum}: ${batch.length} records -> /tmp/insert_batch_${batchNum}.sql`);
}
