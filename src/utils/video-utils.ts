// Утилиты для работы с видео

export interface VideoInfo {
  id: string;
  platform: 'youtube' | 'rutube';
  thumbnailUrl: string;
}

/**
 * Извлекает ID видео из YouTube URL
 */
export function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }

  return null;
}

/**
 * Извлекает ID видео из RuTube URL
 */
export function extractRuTubeId(url: string): string | null {
  const patterns = [
    /rutube\.ru\/video\/([a-zA-Z0-9]+)/,
    /rutube\.ru\/play\/embed\/([a-zA-Z0-9]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }

  return null;
}

/**
 * Определяет платформу видео по URL
 */
export function detectVideoPlatform(url: string): 'youtube' | 'rutube' | null {
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    return 'youtube';
  }
  if (url.includes('rutube.ru')) {
    return 'rutube';
  }
  return null;
}

/**
 * Получает информацию о видео из URL
 */
export function getVideoInfo(url: string): VideoInfo | null {
  const platform = detectVideoPlatform(url);
  
  if (platform === 'youtube') {
    const id = extractYouTubeId(url);
    if (!id) return null;
    
    return {
      id,
      platform: 'youtube',
      thumbnailUrl: `https://img.youtube.com/vi/${id}/maxresdefault.jpg`,
    };
  }
  
  if (platform === 'rutube') {
    const id = extractRuTubeId(url);
    if (!id) return null;
    
    return {
      id,
      platform: 'rutube',
      thumbnailUrl: `https://pic.rutube.ru/video/${id}/thumbnail_360x204.jpg`,
    };
  }
  
  return null;
}

/**
 * Проверяет валидность URL видео
 */
export function isValidVideoUrl(url: string): boolean {
  return getVideoInfo(url) !== null;
}

/**
 * Получает embed URL для видео
 */
export function getVideoEmbedUrl(url: string): string | null {
  const videoInfo = getVideoInfo(url);
  if (!videoInfo) return null;
  
  if (videoInfo.platform === 'youtube') {
    return `https://www.youtube.com/embed/${videoInfo.id}`;
  }
  
  if (videoInfo.platform === 'rutube') {
    return `https://rutube.ru/play/embed/${videoInfo.id}`;
  }
  
  return null;
}
