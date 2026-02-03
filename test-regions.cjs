const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');
const { Client } = require('pg');

const regions = [
  'aws-0-eu-west-1',
  'aws-0-eu-west-2',
  'aws-0-eu-west-3',
  'aws-0-us-east-1',
  'aws-0-us-east-2',
  'aws-0-us-west-1',
  'aws-0-us-west-2',
  'aws-0-eu-central-1',
  'aws-0-eu-central-2',
  'aws-0-ap-southeast-1',
  'aws-0-ap-northeast-1'
];

async function testRegions() {
  for (const region of regions) {
    const client = new Client({
      connectionString: `postgresql://postgres.qzpmiiqfwkcnrhvubdgt:vGotNvENkLVBq1j9@${region}.pooler.supabase.com:5432/postgres`,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 5000
    });

    try {
      await client.connect();
      console.log(`✓ SUCCESS: ${region}`);
      await client.end();
      return region;
    } catch (e) {
      console.log(`✗ ${region}: ${e.message.split('\n')[0]}`);
    }
  }
  return null;
}

testRegions().then(r => {
  if (r) console.log(`\nUse region: ${r}`);
  else console.log('\nNo working region found');
});
