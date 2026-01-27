// Утилиты для валидации баннеров концертов

export interface BannerValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  dimensions?: {
    width: number;
    height: number;
    aspectRatio: number;
  };
}

/**
 * Критерии для бокового баннера концерта:
 * - Размер файла: до 3МБ
 * - Формат: PNG, JPG, JPEG, WebP
 * - Рекомендуемые пропорции: 2:3 (вертикальный)
 * - Оптимальное разрешение: 840x1260px
 * - Минимальное разрешение: 600x900px
 * - Максимальное разрешение: 1200x1800px
 */

const BANNER_CRITERIA = {
  maxFileSize: 3 * 1024 * 1024, // 3MB
  allowedFormats: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'],
  minWidth: 600,
  minHeight: 900,
  maxWidth: 1200,
  maxHeight: 1800,
  optimalWidth: 840,
  optimalHeight: 1260,
  recommendedAspectRatio: 2 / 3, // Ширина / Высота (вертикальный баннер)
  aspectRatioTolerance: 0.1,
};

/**
 * Проверка размера файла
 */
export function validateFileSize(file: File): { valid: boolean; error?: string } {
  if (file.size > BANNER_CRITERIA.maxFileSize) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
    const maxSizeMB = (BANNER_CRITERIA.maxFileSize / (1024 * 1024)).toFixed(0);
    return {
      valid: false,
      error: `Размер файла ${sizeMB}МБ превышает максимально допустимый ${maxSizeMB}МБ`,
    };
  }
  return { valid: true };
}

/**
 * Проверка формата файла
 */
export function validateFileFormat(file: File): { valid: boolean; error?: string } {
  if (!BANNER_CRITERIA.allowedFormats.includes(file.type)) {
    return {
      valid: false,
      error: `Неподдерживаемый формат. Используйте PNG, JPG или WebP`,
    };
  }
  return { valid: true };
}

/**
 * Проверка размеров изображения
 */
export function validateImageDimensions(
  width: number,
  height: number
): { valid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Проверка минимальных размеров
  if (width < BANNER_CRITERIA.minWidth || height < BANNER_CRITERIA.minHeight) {
    errors.push(
      `Минимальное разрешение ${BANNER_CRITERIA.minWidth}x${BANNER_CRITERIA.minHeight}px. Текущее: ${width}x${height}px`
    );
  }

  // Проверка максимальных размеров
  if (width > BANNER_CRITERIA.maxWidth || height > BANNER_CRITERIA.maxHeight) {
    warnings.push(
      `Рекомендуемое максимальное разрешение ${BANNER_CRITERIA.maxWidth}x${BANNER_CRITERIA.maxHeight}px. Текущее: ${width}x${height}px`
    );
  }

  // Проверка пропорций (вертикальный баннер)
  const aspectRatio = width / height;
  const expectedRatio = BANNER_CRITERIA.recommendedAspectRatio;
  const ratioDiff = Math.abs(aspectRatio - expectedRatio);

  if (ratioDiff > BANNER_CRITERIA.aspectRatioTolerance) {
    warnings.push(
      `Рекомендуемые пропорции 2:3 (вертикальный). Текущие: ${(aspectRatio * 3).toFixed(1)}:3`
    );
  }

  // Проверка ориентации (должен быть вертикальным)
  if (width >= height) {
    errors.push('Баннер должен быть вертикальным (высота больше ширины)');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Полная валидация баннера
 */
export async function validateBanner(file: File): Promise<BannerValidationResult> {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Проверка размера файла
  const sizeValidation = validateFileSize(file);
  if (!sizeValidation.valid && sizeValidation.error) {
    errors.push(sizeValidation.error);
  }

  // Проверка формата
  const formatValidation = validateFileFormat(file);
  if (!formatValidation.valid && formatValidation.error) {
    errors.push(formatValidation.error);
  }

  // Если есть критические ошибки, не проверяем размеры
  if (errors.length > 0) {
    return { valid: false, errors, warnings };
  }

  // Загрузка и проверка размеров изображения
  try {
    const dimensions = await getImageDimensions(file);
    const dimensionsValidation = validateImageDimensions(dimensions.width, dimensions.height);

    errors.push(...dimensionsValidation.errors);
    warnings.push(...dimensionsValidation.warnings);

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      dimensions: {
        width: dimensions.width,
        height: dimensions.height,
        aspectRatio: dimensions.width / dimensions.height,
      },
    };
  } catch (error) {
    errors.push('Не удалось загрузить изображение');
    return { valid: false, errors, warnings };
  }
}

/**
 * Получение размеров изображения из файла
 */
export function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({
        width: img.width,
        height: img.height,
      });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Не удалось загрузить изображение'));
    };

    img.src = url;
  });
}

/**
 * Получение рекомендаций по баннеру
 */
export function getBannerRecommendations(): string[] {
  return [
    `Формат: PNG, JPG или WebP`,
    `Размер файла: до ${BANNER_CRITERIA.maxFileSize / (1024 * 1024)}МБ`,
    `Минимальное разрешение: ${BANNER_CRITERIA.minWidth}x${BANNER_CRITERIA.minHeight}px`,
    `Оптимальное разрешение: ${BANNER_CRITERIA.optimalWidth}x${BANNER_CRITERIA.optimalHeight}px (840x1260)`,
    `Максимальное разрешение: ${BANNER_CRITERIA.maxWidth}x${BANNER_CRITERIA.maxHeight}px`,
    `Ориентация: вертикальная (высота больше ширины)`,
    `Пропорции: 2:3 для идеального отображения на главной странице`,
  ];
}

/**
 * Форматирование размера файла
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' Б';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' КБ';
  return (bytes / (1024 * 1024)).toFixed(2) + ' МБ';
}