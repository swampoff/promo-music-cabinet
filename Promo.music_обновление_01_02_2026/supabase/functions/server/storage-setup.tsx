/**
 * STORAGE SETUP
 * Инициализация Supabase Storage buckets для Figma Make
 */

import { getSupabaseClient } from './supabase-client.tsx';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// Supabase client - используем singleton
const supabase = getSupabaseClient();

// Bucket configurations
const BUCKETS = {
  CONCERT_BANNERS: {
    name: 'make-84730125-concert-banners',
    public: true,
    fileSizeLimit: 5 * 1024 * 1024, // 5MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  },
  ARTIST_AVATARS: {
    name: 'make-84730125-artist-avatars',
    public: true,
    fileSizeLimit: 2 * 1024 * 1024, // 2MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
  },
  TRACK_COVERS: {
    name: 'make-84730125-track-covers',
    public: true,
    fileSizeLimit: 3 * 1024 * 1024, // 3MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
  },
  AUDIO_FILES: {
    name: 'make-84730125-audio-files',
    public: false, // Private bucket
    fileSizeLimit: 50 * 1024 * 1024, // 50MB
    allowedMimeTypes: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/flac'],
  },
  VIDEO_FILES: {
    name: 'make-84730125-video-files',
    public: false, // Private bucket
    fileSizeLimit: 200 * 1024 * 1024, // 200MB
    allowedMimeTypes: ['video/mp4', 'video/webm', 'video/ogg'],
  },
  CAMPAIGN_ATTACHMENTS: {
    name: 'make-84730125-campaign-attachments',
    public: false,
    fileSizeLimit: 10 * 1024 * 1024, // 10MB
    allowedMimeTypes: ['application/pdf', 'image/jpeg', 'image/png'],
  },
  BANNER_IMAGES: {
    name: 'make-84730125-banners',
    public: true,
    fileSizeLimit: 5 * 1024 * 1024, // 5MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
  },
};

/**
 * Initialize all storage buckets
 * Creates buckets if they don't exist
 */
export async function initializeStorage(): Promise<{
  success: boolean;
  bucketsCreated: string[];
  errors: string[];
}> {
  const bucketsCreated: string[] = [];
  const errors: string[] = [];

  try {
    // Get existing buckets with timeout
    const { data: existingBuckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('Error listing buckets:', listError);
      
      // If it's a timeout or network error, don't fail initialization
      // Storage will be lazily initialized on first use
      if (listError.message?.includes('timeout') || 
          listError.message?.includes('Gateway Timeout') ||
          listError.message?.includes('Timeout') ||
          listError.statusCode === '504' ||
          listError.status === 504) {
        console.warn('⚠️ Storage initialization deferred due to timeout - will initialize on first use');
        return { success: true, bucketsCreated, errors: [] };
      }
      
      errors.push(`Failed to list buckets: ${listError.message}`);
      return { success: false, bucketsCreated, errors };
    }

    const existingBucketNames = new Set(existingBuckets?.map(b => b.name) || []);

    // Create each bucket if it doesn't exist
    for (const [key, config] of Object.entries(BUCKETS)) {
      if (!existingBucketNames.has(config.name)) {
        // Note: fileSizeLimit and allowedMimeTypes are not supported in createBucket API
        // These limits are enforced at application level
        const { data, error } = await supabase.storage.createBucket(config.name, {
          public: config.public,
        });

        if (error) {
          // Ignore "already exists" errors (409 conflict)
          if (error.message?.includes('already exists') || error.statusCode === '409') {
            console.log(`ℹ️ Bucket already exists (ignored error): ${config.name}`);
          } else {
            console.error(`Error creating bucket ${config.name}:`, error);
            errors.push(`${config.name}: ${error.message}`);
          }
        } else {
          console.log(`✅ Created bucket: ${config.name}`);
          bucketsCreated.push(config.name);
        }
      } else {
        console.log(`ℹ️ Bucket already exists: ${config.name}`);
      }
    }

    return {
      success: errors.length === 0,
      bucketsCreated,
      errors,
    };
  } catch (error) {
    console.error('Storage initialization error:', error);
    
    // Check if it's a timeout error
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes('timeout') || 
        errorMessage.includes('Timeout') || 
        errorMessage.includes('Gateway Timeout')) {
      console.warn('⚠️ Storage initialization deferred due to timeout - will initialize on first use');
      return { success: true, bucketsCreated, errors: [] };
    }
    
    return {
      success: false,
      bucketsCreated,
      errors: [errorMessage],
    };
  }
}

/**
 * Upload file to storage bucket
 */
export async function uploadFile(
  bucketName: string,
  filePath: string,
  fileData: Uint8Array | ArrayBuffer | Blob,
  contentType: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    // Get bucket config for validation
    const bucketConfig = Object.values(BUCKETS).find(b => b.name === bucketName);
    
    if (!bucketConfig) {
      return { success: false, error: 'Invalid bucket name' };
    }
    
    // Validate file size
    const fileSize = fileData instanceof Blob ? fileData.size : fileData.byteLength;
    if (fileSize > bucketConfig.fileSizeLimit) {
      const maxSizeMB = (bucketConfig.fileSizeLimit / (1024 * 1024)).toFixed(0);
      const fileSizeMB = (fileSize / (1024 * 1024)).toFixed(2);
      return { 
        success: false, 
        error: `File size ${fileSizeMB}MB exceeds limit of ${maxSizeMB}MB` 
      };
    }
    
    // Validate content type
    if (!bucketConfig.allowedMimeTypes.includes(contentType)) {
      return { 
        success: false, 
        error: `File type ${contentType} is not allowed for this bucket` 
      };
    }

    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, fileData, {
        contentType,
        upsert: true,
      });

    if (error) {
      console.error(`Upload error for ${filePath}:`, error);
      return { success: false, error: error.message };
    }

    // Get public URL (for public buckets)
    if (bucketConfig?.public) {
      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);
      
      return { success: true, url: publicUrl };
    } else {
      // For private buckets, return the path (will create signed URL later)
      return { success: true, url: filePath };
    }
  } catch (error) {
    console.error('Upload exception:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get signed URL for private file (expires in 1 hour)
 */
export async function getSignedUrl(
  bucketName: string,
  filePath: string,
  expiresIn: number = 3600 // 1 hour
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(filePath, expiresIn);

    if (error) {
      console.error(`Signed URL error for ${filePath}:`, error);
      return { success: false, error: error.message };
    }

    return { success: true, url: data.signedUrl };
  } catch (error) {
    console.error('Signed URL exception:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Delete file from storage
 */
export async function deleteFile(
  bucketName: string,
  filePath: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.storage
      .from(bucketName)
      .remove([filePath]);

    if (error) {
      console.error(`Delete error for ${filePath}:`, error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Delete exception:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get bucket info
 */
export async function getBucketInfo(bucketName: string) {
  try {
    const { data, error } = await supabase.storage.getBucket(bucketName);
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * List files in bucket
 */
export async function listFiles(
  bucketName: string,
  path: string = '',
  options?: {
    limit?: number;
    offset?: number;
    sortBy?: { column: string; order: string };
  }
) {
  try {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .list(path, options);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, files: data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get storage statistics
 */
export async function getStorageStats() {
  try {
    const stats: Record<string, any> = {};
    
    for (const [key, config] of Object.entries(BUCKETS)) {
      const filesResult = await listFiles(config.name);
      
      if (filesResult.success && filesResult.files) {
        const totalSize = filesResult.files.reduce((sum, file) => {
          return sum + (file.metadata?.size || 0);
        }, 0);
        
        stats[key] = {
          name: config.name,
          fileCount: filesResult.files.length,
          totalSize,
          totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2),
          public: config.public,
        };
      }
    }
    
    return { success: true, stats };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Generate unique filename
 */
export function generateUniqueFilename(
  originalName: string,
  prefix: string = ''
): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  const extension = originalName.split('.').pop();
  const baseName = originalName.split('.').slice(0, -1).join('.');
  const sanitizedName = baseName.replace(/[^a-zA-Z0-9-_]/g, '_');
  
  return prefix
    ? `${prefix}/${timestamp}_${random}_${sanitizedName}.${extension}`
    : `${timestamp}_${random}_${sanitizedName}.${extension}`;
}

/**
 * Validate file type
 */
export function validateFileType(
  filename: string,
  allowedTypes: string[]
): boolean {
  const extension = filename.split('.').pop()?.toLowerCase();
  
  const mimeTypeMap: Record<string, string[]> = {
    'image/jpeg': ['jpg', 'jpeg'],
    'image/png': ['png'],
    'image/webp': ['webp'],
    'image/gif': ['gif'],
    'audio/mpeg': ['mp3'],
    'audio/wav': ['wav'],
    'audio/ogg': ['ogg'],
    'audio/flac': ['flac'],
    'video/mp4': ['mp4'],
    'video/webm': ['webm'],
    'video/ogg': ['ogv'],
    'application/pdf': ['pdf'],
  };
  
  for (const mimeType of allowedTypes) {
    const extensions = mimeTypeMap[mimeType] || [];
    if (extension && extensions.includes(extension)) {
      return true;
    }
  }
  
  return false;
}

/**
 * Get bucket config by name
 */
export function getBucketConfig(bucketName: string) {
  return Object.values(BUCKETS).find(b => b.name === bucketName);
}

// Export bucket names for easy reference
export const BUCKET_NAMES = Object.fromEntries(
  Object.entries(BUCKETS).map(([key, config]) => [key, config.name])
);