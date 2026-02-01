/**
 * Storage Service
 * Сервис для загрузки и управления файлами в Supabase Storage
 */

import { supabase } from '@/lib/supabase';
import { projectId } from '@/utils/supabase/info';

// Bucket names (должны совпадать с созданными в Supabase)
export const STORAGE_BUCKETS = {
  AUDIO: 'make-84730125-audio-files',
  TRACK_COVERS: 'make-84730125-track-covers',
  ARTIST_AVATARS: 'make-84730125-artist-avatars',
  CONCERT_BANNERS: 'make-84730125-concert-banners',
  VIDEO_FILES: 'make-84730125-video-files',
  CAMPAIGN_ATTACHMENTS: 'make-84730125-campaign-attachments',
} as const;

export type BucketName = typeof STORAGE_BUCKETS[keyof typeof STORAGE_BUCKETS];

// Allowed file types
const ALLOWED_AUDIO_TYPES = ['audio/mpeg', 'audio/wav', 'audio/flac', 'audio/aac', 'audio/ogg'];
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];

// Max file sizes (in bytes)
const MAX_AUDIO_SIZE = 100 * 1024 * 1024; // 100MB
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_VIDEO_SIZE = 500 * 1024 * 1024; // 500MB

export interface UploadResult {
  success: boolean;
  url?: string;
  path?: string;
  error?: string;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

/**
 * Generate unique file path
 */
function generateFilePath(userId: string, fileName: string, folder?: string): string {
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 8);
  const ext = fileName.split('.').pop() || '';
  const safeName = fileName
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .substring(0, 50);

  const parts = [userId];
  if (folder) parts.push(folder);
  parts.push(`${timestamp}-${randomStr}-${safeName}`);

  return parts.join('/');
}

/**
 * Get public URL for a file
 */
export function getPublicUrl(bucket: BucketName, path: string): string {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Storage Service
 */
export const storageService = {
  /**
   * Upload audio file (track, podcast, etc.)
   */
  async uploadAudio(
    file: File,
    userId: string,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResult> {
    // Validate file type
    if (!ALLOWED_AUDIO_TYPES.includes(file.type)) {
      return {
        success: false,
        error: `Неподдерживаемый формат. Разрешены: MP3, WAV, FLAC, AAC, OGG`,
      };
    }

    // Validate file size
    if (file.size > MAX_AUDIO_SIZE) {
      return {
        success: false,
        error: `Файл слишком большой. Максимум: ${MAX_AUDIO_SIZE / 1024 / 1024}MB`,
      };
    }

    const path = generateFilePath(userId, file.name, 'tracks');

    try {
      const { data, error } = await supabase.storage
        .from(STORAGE_BUCKETS.AUDIO)
        .upload(path, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        console.error('Audio upload error:', error);
        return { success: false, error: error.message };
      }

      const url = getPublicUrl(STORAGE_BUCKETS.AUDIO, data.path);
      return { success: true, url, path: data.path };
    } catch (err) {
      console.error('Audio upload exception:', err);
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Upload failed',
      };
    }
  },

  /**
   * Upload image (cover, avatar, banner)
   */
  async uploadImage(
    file: File,
    userId: string,
    type: 'cover' | 'avatar' | 'banner',
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResult> {
    // Validate file type
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return {
        success: false,
        error: `Неподдерживаемый формат. Разрешены: JPG, PNG, WebP, GIF`,
      };
    }

    // Validate file size
    if (file.size > MAX_IMAGE_SIZE) {
      return {
        success: false,
        error: `Файл слишком большой. Максимум: ${MAX_IMAGE_SIZE / 1024 / 1024}MB`,
      };
    }

    // Select bucket based on type
    let bucket: BucketName;
    switch (type) {
      case 'cover':
        bucket = STORAGE_BUCKETS.TRACK_COVERS;
        break;
      case 'avatar':
        bucket = STORAGE_BUCKETS.ARTIST_AVATARS;
        break;
      case 'banner':
        bucket = STORAGE_BUCKETS.CONCERT_BANNERS;
        break;
    }

    const path = generateFilePath(userId, file.name, type);

    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        console.error('Image upload error:', error);
        return { success: false, error: error.message };
      }

      const url = getPublicUrl(bucket, data.path);
      return { success: true, url, path: data.path };
    } catch (err) {
      console.error('Image upload exception:', err);
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Upload failed',
      };
    }
  },

  /**
   * Upload video file
   */
  async uploadVideo(
    file: File,
    userId: string,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResult> {
    // Validate file type
    if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
      return {
        success: false,
        error: `Неподдерживаемый формат. Разрешены: MP4, WebM, MOV`,
      };
    }

    // Validate file size
    if (file.size > MAX_VIDEO_SIZE) {
      return {
        success: false,
        error: `Файл слишком большой. Максимум: ${MAX_VIDEO_SIZE / 1024 / 1024}MB`,
      };
    }

    const path = generateFilePath(userId, file.name, 'videos');

    try {
      const { data, error } = await supabase.storage
        .from(STORAGE_BUCKETS.VIDEO_FILES)
        .upload(path, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        console.error('Video upload error:', error);
        return { success: false, error: error.message };
      }

      const url = getPublicUrl(STORAGE_BUCKETS.VIDEO_FILES, data.path);
      return { success: true, url, path: data.path };
    } catch (err) {
      console.error('Video upload exception:', err);
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Upload failed',
      };
    }
  },

  /**
   * Delete file from storage
   */
  async deleteFile(bucket: BucketName, path: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.storage.from(bucket).remove([path]);

      if (error) {
        console.error('Delete error:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err) {
      console.error('Delete exception:', err);
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Delete failed',
      };
    }
  },

  /**
   * List files in a folder
   */
  async listFiles(
    bucket: BucketName,
    folder: string
  ): Promise<{ success: boolean; files?: string[]; error?: string }> {
    try {
      const { data, error } = await supabase.storage.from(bucket).list(folder);

      if (error) {
        return { success: false, error: error.message };
      }

      const files = data?.map(f => `${folder}/${f.name}`) || [];
      return { success: true, files };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'List failed',
      };
    }
  },

  /**
   * Get signed URL for private file (expires in 1 hour)
   */
  async getSignedUrl(
    bucket: BucketName,
    path: string,
    expiresIn: number = 3600
  ): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(path, expiresIn);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, url: data.signedUrl };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to create signed URL',
      };
    }
  },

  /**
   * Check storage status (buckets availability)
   */
  async checkStatus(): Promise<{
    available: boolean;
    buckets: { name: string; exists: boolean }[];
  }> {
    const results: { name: string; exists: boolean }[] = [];

    for (const [key, bucket] of Object.entries(STORAGE_BUCKETS)) {
      try {
        const { data, error } = await supabase.storage.from(bucket).list('', { limit: 1 });
        results.push({ name: bucket, exists: !error });
      } catch {
        results.push({ name: bucket, exists: false });
      }
    }

    return {
      available: results.some(r => r.exists),
      buckets: results,
    };
  },
};

/**
 * React Hook for file upload with progress
 */
export function useFileUpload() {
  const uploadWithProgress = async (
    file: File,
    uploadFn: (file: File) => Promise<UploadResult>,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResult> => {
    // For now, Supabase JS doesn't support upload progress
    // This is a placeholder for future implementation
    if (onProgress) {
      onProgress({ loaded: 0, total: file.size, percentage: 0 });
    }

    const result = await uploadFn(file);

    if (onProgress && result.success) {
      onProgress({ loaded: file.size, total: file.size, percentage: 100 });
    }

    return result;
  };

  return { uploadWithProgress };
}
