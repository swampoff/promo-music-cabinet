/**
 * Environment Configuration
 * Автоматически переключается между локальным Docker и production Supabase
 */

// Проверяем, используется ли локальный Docker
const isLocalDocker = 
  import.meta.env.VITE_SUPABASE_URL?.includes('localhost') || 
  import.meta.env.VITE_USE_LOCAL_SUPABASE === 'true';

// Production credentials (из utils/supabase/info.tsx)
const PRODUCTION_PROJECT_ID = "qzpmiiqfwkcnrhvubdgt";
const PRODUCTION_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6cG1paXFmd2tjbnJodnViZGd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkzMzUzMzMsImV4cCI6MjA4NDkxMTMzM30.N3nzO5WooZSPS6U_b4_KEqD1ZIA-82q5_yMHKy-Jsg0";

// Local Docker credentials
const LOCAL_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0";
const LOCAL_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU";

export const config = {
  // Environment mode
  isLocal: isLocalDocker,
  isProduction: !isLocalDocker,
  mode: isLocalDocker ? 'local' : 'production',
  
  // Supabase URLs
  supabaseUrl: isLocalDocker 
    ? (import.meta.env.VITE_SUPABASE_URL || 'http://localhost:8000')
    : `https://${PRODUCTION_PROJECT_ID}.supabase.co`,
  
  // Supabase Keys
  supabaseAnonKey: isLocalDocker
    ? (import.meta.env.VITE_SUPABASE_ANON_KEY || LOCAL_ANON_KEY)
    : PRODUCTION_ANON_KEY,
  
  // Project ID
  projectId: isLocalDocker
    ? 'local-docker'
    : PRODUCTION_PROJECT_ID,
  
  // Service Role Key (только для сервера!)
  serviceRoleKey: isLocalDocker
    ? LOCAL_SERVICE_ROLE_KEY
    : undefined, // В production не используем на клиенте
    
  // Edge Functions URL
  functionsUrl: isLocalDocker
    ? 'http://localhost:9000'
    : `https://${PRODUCTION_PROJECT_ID}.supabase.co/functions/v1`,
    
  // Storage URL
  storageUrl: isLocalDocker
    ? 'http://localhost:5000'
    : `https://${PRODUCTION_PROJECT_ID}.supabase.co/storage/v1`,
};

// Логирование конфигурации (только в dev режиме)
if (import.meta.env.DEV) {
  console.log('🔧 Environment Configuration:', {
    mode: config.mode,
    supabaseUrl: config.supabaseUrl,
    projectId: config.projectId,
    functionsUrl: config.functionsUrl,
  });
}

export default config;
