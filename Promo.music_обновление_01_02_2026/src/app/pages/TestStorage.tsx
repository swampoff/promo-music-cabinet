import { useState, useEffect } from 'react';
import { projectId, publicAnonKey } from '@/utils/supabase/info';

export function TestStorage() {
  const [status, setStatus] = useState<any>(null);
  const [buckets, setBuckets] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkStorage();
  }, []);

  const checkStorage = async () => {
    setLoading(true);
    setError(null);

    try {
      // Check health
      const healthUrl = `https://${projectId}.supabase.co/functions/v1/make-server-84730125/health`;
      const healthRes = await fetch(healthUrl, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });
      const healthData = await healthRes.json();
      
      console.log('✅ Health Check:', healthData);

      // Check storage status
      const statusUrl = `https://${projectId}.supabase.co/functions/v1/make-server-84730125/storage/status`;
      const statusRes = await fetch(statusUrl, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });
      const statusData = await statusRes.json();
      
      console.log('✅ Storage Status:', statusData);
      setStatus(statusData);

      // Check buckets
      const bucketsUrl = `https://${projectId}.supabase.co/functions/v1/make-server-84730125/storage/buckets`;
      const bucketsRes = await fetch(bucketsUrl, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });
      const bucketsData = await bucketsRes.json();
      
      console.log('✅ Buckets:', bucketsData);
      setBuckets(bucketsData);

    } catch (err) {
      console.error('❌ Error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '20px' }}>🧪 Storage Test</h1>

      <button
        onClick={checkStorage}
        style={{
          padding: '10px 20px',
          background: '#8b5cf6',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          marginBottom: '20px',
        }}
      >
        🔄 Refresh
      </button>

      {loading && <p>⏳ Loading...</p>}

      {error && (
        <div style={{
          padding: '20px',
          background: '#fee',
          border: '1px solid #fcc',
          borderRadius: '8px',
          marginBottom: '20px',
        }}>
          <h3>❌ Error</h3>
          <pre>{error}</pre>
        </div>
      )}

      {status && (
        <div style={{
          padding: '20px',
          background: status.success ? '#efe' : '#fee',
          border: `1px solid ${status.success ? '#cfc' : '#fcc'}`,
          borderRadius: '8px',
          marginBottom: '20px',
        }}>
          <h3>{status.success ? '✅' : '❌'} Storage Status</h3>
          <pre style={{ overflow: 'auto' }}>
            {JSON.stringify(status, null, 2)}
          </pre>
        </div>
      )}

      {buckets && (
        <div style={{
          padding: '20px',
          background: buckets.success ? '#efe' : '#fee',
          border: `1px solid ${buckets.success ? '#cfc' : '#fcc'}`,
          borderRadius: '8px',
        }}>
          <h3>{buckets.success ? '✅' : '❌'} Buckets</h3>
          
          {buckets.buckets && buckets.buckets.length > 0 ? (
            <ul>
              {buckets.buckets.map((bucket: any) => (
                <li key={bucket.name || bucket}>
                  <strong>{bucket.name || bucket}</strong>
                  {bucket.public !== undefined && (
                    <span style={{ marginLeft: '10px' }}>
                      ({bucket.public ? 'public' : 'private'})
                    </span>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p>No buckets found</p>
          )}
        </div>
      )}

      <div style={{ marginTop: '40px', padding: '20px', background: '#f5f5f5', borderRadius: '8px' }}>
        <h3>📊 Expected Result</h3>
        <p><strong>Storage Status:</strong></p>
        <ul>
          <li>✅ success: true</li>
          <li>✅ initialized: true</li>
          <li>✅ buckets: array of 6 buckets</li>
        </ul>
        
        <p style={{ marginTop: '20px' }}><strong>Buckets (6 total):</strong></p>
        <ol>
          <li>make-84730125-concert-banners (public)</li>
          <li>make-84730125-artist-avatars (public)</li>
          <li>make-84730125-track-covers (public)</li>
          <li>make-84730125-audio-files (private)</li>
          <li>make-84730125-video-files (private)</li>
          <li>make-84730125-campaign-attachments (private)</li>
        </ol>
      </div>
    </div>
  );
}