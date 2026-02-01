/**
 * MIGRATION API ROUTES
 * Endpoints для выполнения SQL миграций
 */

import { Hono } from 'npm:hono';
import { runAllMigrations, checkTablesStatus } from './migration-runner.tsx';
import { initializeStorage, getStorageStats } from './storage-setup.tsx';

const migrations = new Hono();

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

export default migrations;
