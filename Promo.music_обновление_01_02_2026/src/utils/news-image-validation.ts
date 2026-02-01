// Валидация изображений для новостей

export interface ImageValidationResult {
  isValid: boolean;
  width: number | null;
  height: number | null;
  aspectRatio: number | null;
  fileSize: number | null;
  errors: string[];
  warnings: string[];
}

// Рекомендации для обложек новостей
export const NEWS_IMAGE_REQUIREMENTS = {
  minWidth: 800,
  minHeight: 450,
  maxWidth: 3840,
  maxHeight: 2160,
  recommendedWidth: 1200,
  recommendedHeight: 630, // Open Graph стандарт
  aspectRatio: 1.91, // 1200:630 ≈ 1.91:1
  aspectRatioTolerance: 0.2,
  maxFileSize: 5 * 1024 * 1024, // 5 MB
  recommendedFileSize: 2 * 1024 * 1024, // 2 MB
  allowedFormats: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
};

export function validateNewsImage(file: File): Promise<ImageValidationResult> {
  return new Promise((resolve) => {
    const result: ImageValidationResult = {
      isValid: true,
      width: null,
      height: null,
      aspectRatio: null,
      fileSize: file.size,
      errors: [],
      warnings: [],
    };

    // Проверка формата
    if (!NEWS_IMAGE_REQUIREMENTS.allowedFormats.includes(file.type)) {
      result.errors.push(
        `Неподдерживаемый формат. Используйте JPEG, PNG или WebP.`
      );
      result.isValid = false;
    }

    // Проверка размера файла
    if (file.size > NEWS_IMAGE_REQUIREMENTS.maxFileSize) {
      result.errors.push(
        `Размер файла превышает ${formatFileSize(NEWS_IMAGE_REQUIREMENTS.maxFileSize)}. Текущий размер: ${formatFileSize(file.size)}`
      );
      result.isValid = false;
    }

    if (file.size > NEWS_IMAGE_REQUIREMENTS.recommendedFileSize) {
      result.warnings.push(
        `Рекомендуемый размер файла: до ${formatFileSize(NEWS_IMAGE_REQUIREMENTS.recommendedFileSize)}. Большие файлы медленнее загружаются.`
      );
    }

    // Проверка разрешения
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      result.width = img.width;
      result.height = img.height;
      result.aspectRatio = img.width / img.height;

      // Минимальное разрешение
      if (img.width < NEWS_IMAGE_REQUIREMENTS.minWidth || img.height < NEWS_IMAGE_REQUIREMENTS.minHeight) {
        result.errors.push(
          `Минимальное разрешение: ${NEWS_IMAGE_REQUIREMENTS.minWidth}x${NEWS_IMAGE_REQUIREMENTS.minHeight}px. Текущее: ${img.width}x${img.height}px`
        );
        result.isValid = false;
      }

      // Максимальное разрешение
      if (img.width > NEWS_IMAGE_REQUIREMENTS.maxWidth || img.height > NEWS_IMAGE_REQUIREMENTS.maxHeight) {
        result.errors.push(
          `Максимальное разрешение: ${NEWS_IMAGE_REQUIREMENTS.maxWidth}x${NEWS_IMAGE_REQUIREMENTS.maxHeight}px. Текущее: ${img.width}x${img.height}px`
        );
        result.isValid = false;
      }

      // Проверка соотношения сторон
      const targetRatio = NEWS_IMAGE_REQUIREMENTS.aspectRatio;
      const ratioDiff = Math.abs(result.aspectRatio - targetRatio);
      
      if (ratioDiff > NEWS_IMAGE_REQUIREMENTS.aspectRatioTolerance) {
        result.warnings.push(
          `Рекомендуемое соотношение сторон: примерно 1.91:1 (например, 1200x630px). Текущее: ${result.aspectRatio.toFixed(2)}:1`
        );
      }

      // Рекомендация по разрешению
      if (img.width !== NEWS_IMAGE_REQUIREMENTS.recommendedWidth || img.height !== NEWS_IMAGE_REQUIREMENTS.recommendedHeight) {
        result.warnings.push(
          `Рекомендуемое разрешение для лучшего отображения: ${NEWS_IMAGE_REQUIREMENTS.recommendedWidth}x${NEWS_IMAGE_REQUIREMENTS.recommendedHeight}px (Open Graph стандарт)`
        );
      }

      URL.revokeObjectURL(objectUrl);
      resolve(result);
    };

    img.onerror = () => {
      result.errors.push('Не удалось загрузить изображение. Файл поврежден или имеет неверный формат.');
      result.isValid = false;
      URL.revokeObjectURL(objectUrl);
      resolve(result);
    };

    img.src = objectUrl;
  });
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

export function getNewsImageRecommendations() {
  return {
    title: 'Рекомендации для обложки новости',
    items: [
      `✓ Формат: JPEG, PNG или WebP`,
      `✓ Разрешение: ${NEWS_IMAGE_REQUIREMENTS.recommendedWidth}x${NEWS_IMAGE_REQUIREMENTS.recommendedHeight}px (или 1.91:1)`,
      `✓ Минимум: ${NEWS_IMAGE_REQUIREMENTS.minWidth}x${NEWS_IMAGE_REQUIREMENTS.minHeight}px`,
      `✓ Максимум: ${NEWS_IMAGE_REQUIREMENTS.maxWidth}x${NEWS_IMAGE_REQUIREMENTS.maxHeight}px`,
      `✓ Размер файла: до ${formatFileSize(NEWS_IMAGE_REQUIREMENTS.recommendedFileSize)}`,
      `✓ Горизонтальная ориентация (для постов в соцсетях)`,
      `✓ Четкое изображение с хорошим освещением`,
    ],
  };
}
