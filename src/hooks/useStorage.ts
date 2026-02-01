/**
 * useStorage Hook
 * React hook для работы с файловым хранилищем
 */

import { useState, useCallback } from 'react';
import { storageService, UploadResult, UploadProgress, BucketName } from '@/services/storage-service';
import { useAuth } from '@/contexts/AuthContext';

interface UseStorageOptions {
  onSuccess?: (result: UploadResult) => void;
  onError?: (error: string) => void;
  onProgress?: (progress: UploadProgress) => void;
}

export function useStorage(options: UseStorageOptions = {}) {
  const { userId } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleProgress = useCallback((p: UploadProgress) => {
    setProgress(p);
    options.onProgress?.(p);
  }, [options]);

  const handleResult = useCallback((result: UploadResult) => {
    if (result.success) {
      options.onSuccess?.(result);
      setError(null);
    } else {
      setError(result.error || 'Upload failed');
      options.onError?.(result.error || 'Upload failed');
    }
    return result;
  }, [options]);

  /**
   * Upload audio file
   */
  const uploadAudio = useCallback(async (file: File): Promise<UploadResult> => {
    if (!userId) {
      const result = { success: false, error: 'Необходима авторизация' };
      handleResult(result);
      return result;
    }

    setIsUploading(true);
    setError(null);
    setProgress({ loaded: 0, total: file.size, percentage: 0 });

    try {
      const result = await storageService.uploadAudio(file, userId, handleProgress);
      return handleResult(result);
    } finally {
      setIsUploading(false);
    }
  }, [userId, handleProgress, handleResult]);

  /**
   * Upload image (cover, avatar, banner)
   */
  const uploadImage = useCallback(async (
    file: File,
    type: 'cover' | 'avatar' | 'banner'
  ): Promise<UploadResult> => {
    if (!userId) {
      const result = { success: false, error: 'Необходима авторизация' };
      handleResult(result);
      return result;
    }

    setIsUploading(true);
    setError(null);
    setProgress({ loaded: 0, total: file.size, percentage: 0 });

    try {
      const result = await storageService.uploadImage(file, userId, type, handleProgress);
      return handleResult(result);
    } finally {
      setIsUploading(false);
    }
  }, [userId, handleProgress, handleResult]);

  /**
   * Upload video file
   */
  const uploadVideo = useCallback(async (file: File): Promise<UploadResult> => {
    if (!userId) {
      const result = { success: false, error: 'Необходима авторизация' };
      handleResult(result);
      return result;
    }

    setIsUploading(true);
    setError(null);
    setProgress({ loaded: 0, total: file.size, percentage: 0 });

    try {
      const result = await storageService.uploadVideo(file, userId, handleProgress);
      return handleResult(result);
    } finally {
      setIsUploading(false);
    }
  }, [userId, handleProgress, handleResult]);

  /**
   * Delete file
   */
  const deleteFile = useCallback(async (
    bucket: BucketName,
    path: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      return await storageService.deleteFile(bucket, path);
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Delete failed';
      setError(error);
      return { success: false, error };
    }
  }, []);

  /**
   * Reset state
   */
  const reset = useCallback(() => {
    setIsUploading(false);
    setProgress(null);
    setError(null);
  }, []);

  return {
    // State
    isUploading,
    progress,
    error,

    // Methods
    uploadAudio,
    uploadImage,
    uploadVideo,
    deleteFile,
    reset,

    // Utils
    checkStatus: storageService.checkStatus,
  };
}

/**
 * Hook for uploading track with cover
 */
export function useTrackUpload() {
  const storage = useStorage();
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);

  const uploadTrack = useCallback(async (
    audioFile: File,
    coverFile?: File
  ): Promise<{ audioUrl?: string; coverUrl?: string; error?: string }> => {
    // Upload audio
    const audioResult = await storage.uploadAudio(audioFile);
    if (!audioResult.success) {
      return { error: audioResult.error };
    }
    setAudioUrl(audioResult.url || null);

    // Upload cover if provided
    let finalCoverUrl: string | undefined;
    if (coverFile) {
      const coverResult = await storage.uploadImage(coverFile, 'cover');
      if (coverResult.success) {
        finalCoverUrl = coverResult.url;
        setCoverUrl(coverResult.url || null);
      }
    }

    return {
      audioUrl: audioResult.url,
      coverUrl: finalCoverUrl,
    };
  }, [storage]);

  const reset = useCallback(() => {
    setAudioUrl(null);
    setCoverUrl(null);
    storage.reset();
  }, [storage]);

  return {
    ...storage,
    audioUrl,
    coverUrl,
    uploadTrack,
    reset,
  };
}

/**
 * Hook for uploading video with thumbnail
 */
export function useVideoUpload() {
  const storage = useStorage();
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);

  const uploadVideoWithThumbnail = useCallback(async (
    videoFile: File,
    thumbnailFile?: File
  ): Promise<{ videoUrl?: string; thumbnailUrl?: string; error?: string }> => {
    // Upload video
    const videoResult = await storage.uploadVideo(videoFile);
    if (!videoResult.success) {
      return { error: videoResult.error };
    }
    setVideoUrl(videoResult.url || null);

    // Upload thumbnail if provided
    let finalThumbnailUrl: string | undefined;
    if (thumbnailFile) {
      const thumbResult = await storage.uploadImage(thumbnailFile, 'cover');
      if (thumbResult.success) {
        finalThumbnailUrl = thumbResult.url;
        setThumbnailUrl(thumbResult.url || null);
      }
    }

    return {
      videoUrl: videoResult.url,
      thumbnailUrl: finalThumbnailUrl,
    };
  }, [storage]);

  const reset = useCallback(() => {
    setVideoUrl(null);
    setThumbnailUrl(null);
    storage.reset();
  }, [storage]);

  return {
    ...storage,
    videoUrl,
    thumbnailUrl,
    uploadVideoWithThumbnail,
    reset,
  };
}
