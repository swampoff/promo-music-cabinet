/**
 * MIGRATION API ROUTES
 * Endpoints для выполнения SQL миграций
 */

import { Hono } from 'npm:hono';
import { runAllMigrations, checkTablesStatus } from './migration-runner.tsx';
import { initializeStorage, getStorageStats } from './storage-setup.tsx';
import { executeSQL, executeSQLStatements } from './sql-executor.tsx';

const migrations = new Hono();

// SQL для создания pitching таблиц
const PITCHING_TABLES_SQL = `
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TABLE IF NOT EXISTS pitching_playlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  platform TEXT NOT NULL DEFAULT 'other',
  playlist_url TEXT,
  curator_name TEXT,
  curator_email TEXT,
  curator_phone TEXT,
  curator_social JSONB DEFAULT '{}'::jsonb,
  genres TEXT[] DEFAULT '{}',
  moods TEXT[] DEFAULT '{}',
  followers_count INTEGER DEFAULT 0,
  tracks_count INTEGER DEFAULT 0,
  accepts_submissions BOOLEAN DEFAULT true,
  submission_fee INTEGER DEFAULT 0,
  average_response_days INTEGER DEFAULT 7,
  requirements TEXT,
  total_pitches INTEGER DEFAULT 0,
  successful_pitches INTEGER DEFAULT 0,
  success_rate DECIMAL(5,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  priority INTEGER DEFAULT 0,
  admin_notes TEXT,
  last_contacted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pitching_venues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  venue_type TEXT NOT NULL DEFAULT 'club',
  city TEXT NOT NULL DEFAULT '',
  address TEXT,
  region TEXT,
  country TEXT DEFAULT 'Россия',
  contact_name TEXT,
  contact_position TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  contact_social JSONB DEFAULT '{}'::jsonb,
  music_genres TEXT[] DEFAULT '{}',
  capacity INTEGER,
  working_hours JSONB DEFAULT '{}'::jsonb,
  has_live_music BOOLEAN DEFAULT false,
  has_dj BOOLEAN DEFAULT false,
  accepts_music BOOLEAN DEFAULT true,
  collaboration_type TEXT[] DEFAULT '{}',
  payment_terms TEXT,
  average_budget INTEGER DEFAULT 0,
  total_pitches INTEGER DEFAULT 0,
  successful_pitches INTEGER DEFAULT 0,
  success_rate DECIMAL(5,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  priority INTEGER DEFAULT 0,
  admin_notes TEXT,
  last_contacted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pitching_radio (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  slogan TEXT,
  radio_type TEXT NOT NULL DEFAULT 'other',
  frequency TEXT,
  city TEXT,
  region TEXT,
  country TEXT DEFAULT 'Россия',
  coverage TEXT,
  listeners_count INTEGER DEFAULT 0,
  website TEXT,
  email TEXT,
  phone TEXT,
  editor_name TEXT,
  editor_email TEXT,
  editor_phone TEXT,
  editor_social JSONB DEFAULT '{}'::jsonb,
  music_genres TEXT[] DEFAULT '{}',
  target_audience TEXT,
  format TEXT,
  programs JSONB DEFAULT '[]'::jsonb,
  accepts_submissions BOOLEAN DEFAULT true,
  submission_email TEXT,
  submission_requirements TEXT,
  average_response_days INTEGER DEFAULT 14,
  total_pitches INTEGER DEFAULT 0,
  successful_pitches INTEGER DEFAULT 0,
  added_to_rotation INTEGER DEFAULT 0,
  success_rate DECIMAL(5,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  priority INTEGER DEFAULT 0,
  admin_notes TEXT,
  last_contacted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pitching_campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pitching_request_id TEXT,
  name TEXT NOT NULL,
  campaign_type TEXT NOT NULL DEFAULT 'mixed',
  recipients_playlists UUID[] DEFAULT '{}',
  recipients_venues UUID[] DEFAULT '{}',
  recipients_radio UUID[] DEFAULT '{}',
  total_recipients INTEGER DEFAULT 0,
  subject TEXT,
  message_template TEXT,
  attachments JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'draft',
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  sent_count INTEGER DEFAULT 0,
  delivered_count INTEGER DEFAULT 0,
  opened_count INTEGER DEFAULT 0,
  responded_count INTEGER DEFAULT 0,
  positive_responses INTEGER DEFAULT 0,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pitching_campaign_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES pitching_campaigns(id) ON DELETE CASCADE,
  recipient_type TEXT NOT NULL DEFAULT 'venue',
  recipient_id UUID NOT NULL,
  recipient_name TEXT,
  response_type TEXT NOT NULL DEFAULT 'no_response',
  response_text TEXT,
  sent_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pitching_playlists_platform ON pitching_playlists(platform);
CREATE INDEX IF NOT EXISTS idx_pitching_playlists_active ON pitching_playlists(is_active);
CREATE INDEX IF NOT EXISTS idx_pitching_venues_type ON pitching_venues(venue_type);
CREATE INDEX IF NOT EXISTS idx_pitching_venues_city ON pitching_venues(city);
CREATE INDEX IF NOT EXISTS idx_pitching_venues_active ON pitching_venues(is_active);
CREATE INDEX IF NOT EXISTS idx_pitching_radio_type ON pitching_radio(radio_type);
CREATE INDEX IF NOT EXISTS idx_pitching_radio_city ON pitching_radio(city);
CREATE INDEX IF NOT EXISTS idx_pitching_radio_active ON pitching_radio(is_active);
CREATE INDEX IF NOT EXISTS idx_pitching_campaigns_status ON pitching_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaign_responses_campaign ON pitching_campaign_responses(campaign_id);

ALTER TABLE pitching_playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE pitching_venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE pitching_radio ENABLE ROW LEVEL SECURITY;
ALTER TABLE pitching_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE pitching_campaign_responses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view active playlists" ON pitching_playlists;
CREATE POLICY "Public can view active playlists" ON pitching_playlists FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Public can view active venues" ON pitching_venues;
CREATE POLICY "Public can view active venues" ON pitching_venues FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Public can view active radio" ON pitching_radio;
CREATE POLICY "Public can view active radio" ON pitching_radio FOR SELECT USING (is_active = true);
`;

// Run all migrations
migrations.post('/run', async (c) => {
  try {
    console.log('🚀 Starting migration process...');
    
    const result = await runAllMigrations();
    
    return c.json({
      success: result.success,
      message: result.success 
        ? 'All migrations completed successfully!' 
        : 'Some migrations failed',
      results: result.results,
      timestamp: result.timestamp,
    });
  } catch (error) {
    console.error('Migration error:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Migration failed',
    }, 500);
  }
});

// Check migration status
migrations.get('/status', async (c) => {
  try {
    const tablesStatus = await checkTablesStatus();
    
    return c.json({
      success: true,
      database: tablesStatus,
    });
  } catch (error) {
    console.error('Status check error:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Status check failed',
    }, 500);
  }
});

// Initialize everything (migrations + storage)
migrations.post('/initialize', async (c) => {
  try {
    console.log('🚀 Initializing full backend...');
    
    // Run SQL migrations
    console.log('1️⃣ Running SQL migrations...');
    const migrationResult = await runAllMigrations();
    
    // Initialize storage
    console.log('2️⃣ Initializing Storage buckets...');
    const storageResult = await initializeStorage();
    
    // Check final status
    console.log('3️⃣ Checking final status...');
    const tablesStatus = await checkTablesStatus();
    const storageStats = await getStorageStats();
    
    const allSuccess = migrationResult.success && storageResult.success;
    
    return c.json({
      success: allSuccess,
      message: allSuccess 
        ? '✅ Full backend initialized successfully!' 
        : '⚠️ Backend initialization completed with some issues',
      migrations: migrationResult,
      storage: storageResult,
      status: {
        tables: tablesStatus,
        storage: storageStats,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Initialization error:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Initialization failed',
    }, 500);
  }
});

// Health check
migrations.get('/health', (c) => {
  return c.json({
    success: true,
    message: 'Migration service is ready',
    timestamp: new Date().toISOString(),
  });
});

// Create pitching tables
migrations.post('/create-pitching-tables', async (c) => {
  try {
    console.log('🚀 Creating pitching tables...');

    const statements = PITCHING_TABLES_SQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`Found ${statements.length} SQL statements`);

    const result = await executeSQLStatements(statements);

    return c.json({
      success: result.success,
      message: result.success
        ? '✅ Pitching tables created successfully!'
        : `⚠️ Created with ${result.errors.length} errors`,
      successCount: result.successCount,
      totalCount: result.totalCount,
      errors: result.errors,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error creating pitching tables:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create tables',
    }, 500);
  }
});

// Execute custom SQL (admin only)
migrations.post('/exec-sql', async (c) => {
  try {
    const { sql } = await c.req.json();

    if (!sql) {
      return c.json({ success: false, error: 'SQL query required' }, 400);
    }

    console.log('Executing SQL:', sql.substring(0, 100) + '...');

    const result = await executeSQL(sql);

    return c.json({
      success: result.success,
      data: result.data,
      error: result.error,
    });
  } catch (error) {
    console.error('SQL execution error:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'SQL execution failed',
    }, 500);
  }
});

export default migrations;
