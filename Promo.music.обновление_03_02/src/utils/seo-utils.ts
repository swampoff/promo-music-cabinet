/**
 * SEO Utilities для PROMO.MUSIC
 * Утилиты для работы с SEO: генерация meta tags, structured data, sitemaps
 */

/**
 * Генерация Open Graph image URL
 */
export function generateOGImageUrl(params: {
  title: string;
  subtitle?: string;
  image?: string;
}): string {
  const baseUrl = 'https://promo.music/api/og-image';
  const searchParams = new URLSearchParams({
    title: params.title,
    ...(params.subtitle && { subtitle: params.subtitle }),
    ...(params.image && { image: params.image }),
  });
  
  return `${baseUrl}?${searchParams.toString()}`;
}

/**
 * Генерация structured data для музыкального трека
 */
export function generateTrackStructuredData(track: {
  id: string;
  title: string;
  artist: string;
  album?: string;
  duration?: number;
  releaseDate?: string;
  genre?: string;
  coverUrl?: string;
  audioUrl?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'MusicRecording',
    '@id': `https://promo.music/tracks/${track.id}`,
    name: track.title,
    byArtist: {
      '@type': 'MusicGroup',
      name: track.artist,
    },
    ...(track.album && {
      inAlbum: {
        '@type': 'MusicAlbum',
        name: track.album,
      },
    }),
    ...(track.duration && {
      duration: `PT${Math.floor(track.duration / 60)}M${track.duration % 60}S`,
    }),
    ...(track.releaseDate && {
      datePublished: track.releaseDate,
    }),
    ...(track.genre && {
      genre: track.genre,
    }),
    ...(track.coverUrl && {
      image: track.coverUrl,
    }),
    ...(track.audioUrl && {
      audio: {
        '@type': 'AudioObject',
        contentUrl: track.audioUrl,
      },
    }),
  };
}

/**
 * Генерация structured data для концерта
 */
export function generateConcertStructuredData(concert: {
  id: string;
  title: string;
  artist: string;
  date: string;
  time: string;
  venue: string;
  city: string;
  address?: string;
  price?: {
    min: number;
    max: number;
    currency: string;
  };
  ticketUrl?: string;
  image?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'MusicEvent',
    '@id': `https://promo.music/concerts/${concert.id}`,
    name: concert.title,
    startDate: `${concert.date}T${concert.time}`,
    performer: {
      '@type': 'MusicGroup',
      name: concert.artist,
    },
    location: {
      '@type': 'Place',
      name: concert.venue,
      address: {
        '@type': 'PostalAddress',
        addressLocality: concert.city,
        ...(concert.address && { streetAddress: concert.address }),
      },
    },
    ...(concert.price && {
      offers: {
        '@type': 'AggregateOffer',
        lowPrice: concert.price.min,
        highPrice: concert.price.max,
        priceCurrency: concert.price.currency,
        ...(concert.ticketUrl && { url: concert.ticketUrl }),
      },
    }),
    ...(concert.image && {
      image: concert.image,
    }),
  };
}

/**
 * Генерация structured data для отзыва эксперта
 */
export function generateReviewStructuredData(review: {
  id: string;
  trackTitle: string;
  expertName: string;
  rating: number;
  reviewBody: string;
  datePublished: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Review',
    '@id': `https://promo.music/reviews/${review.id}`,
    itemReviewed: {
      '@type': 'MusicRecording',
      name: review.trackTitle,
    },
    author: {
      '@type': 'Person',
      name: review.expertName,
    },
    reviewRating: {
      '@type': 'Rating',
      ratingValue: review.rating,
      bestRating: 10,
      worstRating: 1,
    },
    reviewBody: review.reviewBody,
    datePublished: review.datePublished,
  };
}

/**
 * Генерация structured data для статьи/поста блога
 */
export function generateArticleStructuredData(article: {
  title: string;
  description: string;
  author: string;
  publishedDate: string;
  modifiedDate?: string;
  image?: string;
  url: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    author: {
      '@type': 'Person',
      name: article.author,
    },
    publisher: {
      '@type': 'Organization',
      name: 'PROMO.MUSIC',
      logo: {
        '@type': 'ImageObject',
        url: 'https://promo.music/logo.png',
      },
    },
    datePublished: article.publishedDate,
    ...(article.modifiedDate && { dateModified: article.modifiedDate }),
    ...(article.image && {
      image: {
        '@type': 'ImageObject',
        url: article.image,
      },
    }),
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': article.url,
    },
  };
}

/**
 * Генерация structured data для FAQ
 */
export function generateFAQStructuredData(faqs: Array<{
  question: string;
  answer: string;
}>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

/**
 * Генерация structured data для хлебных крошек
 */
export function generateBreadcrumbStructuredData(breadcrumbs: Array<{
  name: string;
  url: string;
}>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Генерация XML sitemap (динамический)
 */
export function generateSitemapXML(urls: Array<{
  loc: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
  images?: Array<{
    loc: string;
    title?: string;
    caption?: string;
  }>;
}>): string {
  const urlElements = urls.map((url) => {
    let urlXml = `  <url>\n    <loc>${url.loc}</loc>\n`;
    
    if (url.lastmod) {
      urlXml += `    <lastmod>${url.lastmod}</lastmod>\n`;
    }
    
    if (url.changefreq) {
      urlXml += `    <changefreq>${url.changefreq}</changefreq>\n`;
    }
    
    if (url.priority !== undefined) {
      urlXml += `    <priority>${url.priority}</priority>\n`;
    }
    
    if (url.images && url.images.length > 0) {
      url.images.forEach((image) => {
        urlXml += `    <image:image>\n`;
        urlXml += `      <image:loc>${image.loc}</image:loc>\n`;
        if (image.title) {
          urlXml += `      <image:title>${image.title}</image:title>\n`;
        }
        if (image.caption) {
          urlXml += `      <image:caption>${image.caption}</image:caption>\n`;
        }
        urlXml += `    </image:image>\n`;
      });
    }
    
    urlXml += `  </url>`;
    return urlXml;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urlElements}
</urlset>`;
}

/**
 * Очистка и форматирование текста для SEO
 */
export function sanitizeForSEO(text: string, maxLength?: number): string {
  // Remove HTML tags
  let clean = text.replace(/<[^>]*>/g, '');
  
  // Remove extra whitespace
  clean = clean.replace(/\s+/g, ' ').trim();
  
  // Truncate if needed
  if (maxLength && clean.length > maxLength) {
    clean = clean.substring(0, maxLength - 3) + '...';
  }
  
  return clean;
}

/**
 * Генерация slug из строки (для URL)
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\wа-яё\s-]/g, '') // Remove special chars (keep cyrillic)
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start
    .replace(/-+$/, ''); // Trim - from end
}

/**
 * Валидация и оптимизация meta description
 */
export function optimizeMetaDescription(text: string): string {
  const minLength = 120;
  const maxLength = 160;
  
  let description = sanitizeForSEO(text);
  
  if (description.length < minLength) {
    console.warn(`Meta description too short (${description.length} < ${minLength})`);
  }
  
  if (description.length > maxLength) {
    description = description.substring(0, maxLength - 3) + '...';
  }
  
  return description;
}

/**
 * Валидация и оптимизация title
 */
export function optimizeTitle(text: string, suffix: string = 'PROMO.MUSIC'): string {
  const maxLength = 60;
  
  let title = sanitizeForSEO(text);
  
  // Add suffix if not already present
  if (!title.includes(suffix)) {
    title = `${title} - ${suffix}`;
  }
  
  if (title.length > maxLength) {
    // Try to shorten while keeping suffix
    const availableLength = maxLength - suffix.length - 3; // 3 for ' - '
    title = `${text.substring(0, availableLength)}... - ${suffix}`;
  }
  
  return title;
}

/**
 * Извлечение keywords из текста
 */
export function extractKeywords(text: string, limit: number = 10): string[] {
  // Remove common words (stop words)
  const stopWords = new Set([
    'и', 'в', 'во', 'не', 'что', 'он', 'на', 'я', 'с', 'со', 'как', 'а', 'то', 'все',
    'она', 'так', 'его', 'но', 'да', 'ты', 'к', 'у', 'же', 'вы', 'за', 'бы', 'по',
    'только', 'ее', 'мне', 'было', 'вот', 'от', 'меня', 'еще', 'нет', 'о', 'из',
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with'
  ]);
  
  const words = text
    .toLowerCase()
    .replace(/[^\wа-яё\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3 && !stopWords.has(word));
  
  // Count frequency
  const frequency: Record<string, number> = {};
  words.forEach(word => {
    frequency[word] = (frequency[word] || 0) + 1;
  });
  
  // Sort by frequency and return top keywords
  return Object.entries(frequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([word]) => word);
}

/**
 * Проверка качества SEO для страницы
 */
export interface SEOAudit {
  score: number;
  issues: string[];
  warnings: string[];
  passed: string[];
}

export function auditPageSEO(page: {
  title?: string;
  description?: string;
  keywords?: string;
  headings?: string[];
  imageCount?: number;
  imagesWithAlt?: number;
  wordCount?: number;
}): SEOAudit {
  const issues: string[] = [];
  const warnings: string[] = [];
  const passed: string[] = [];
  let score = 100;
  
  // Title checks
  if (!page.title) {
    issues.push('Missing page title');
    score -= 20;
  } else {
    if (page.title.length < 30) {
      warnings.push('Title is too short (< 30 chars)');
      score -= 5;
    } else if (page.title.length > 60) {
      warnings.push('Title is too long (> 60 chars)');
      score -= 5;
    } else {
      passed.push('Title length is optimal');
    }
  }
  
  // Description checks
  if (!page.description) {
    issues.push('Missing meta description');
    score -= 15;
  } else {
    if (page.description.length < 120) {
      warnings.push('Description is too short (< 120 chars)');
      score -= 5;
    } else if (page.description.length > 160) {
      warnings.push('Description is too long (> 160 chars)');
      score -= 5;
    } else {
      passed.push('Description length is optimal');
    }
  }
  
  // Keywords checks
  if (!page.keywords) {
    warnings.push('Missing keywords meta tag');
    score -= 5;
  } else {
    passed.push('Keywords meta tag present');
  }
  
  // Headings checks
  if (!page.headings || page.headings.length === 0) {
    warnings.push('No headings found');
    score -= 5;
  } else {
    const h1Count = page.headings.filter(h => h.startsWith('h1')).length;
    if (h1Count === 0) {
      issues.push('Missing H1 heading');
      score -= 10;
    } else if (h1Count > 1) {
      warnings.push('Multiple H1 headings found');
      score -= 5;
    } else {
      passed.push('Single H1 heading present');
    }
  }
  
  // Image checks
  if (page.imageCount && page.imagesWithAlt !== undefined) {
    const altCoverage = (page.imagesWithAlt / page.imageCount) * 100;
    if (altCoverage < 100) {
      warnings.push(`${Math.round(100 - altCoverage)}% of images missing alt text`);
      score -= Math.round((100 - altCoverage) / 10);
    } else {
      passed.push('All images have alt text');
    }
  }
  
  // Content checks
  if (page.wordCount !== undefined) {
    if (page.wordCount < 300) {
      warnings.push('Content is too short (< 300 words)');
      score -= 10;
    } else {
      passed.push('Content length is good');
    }
  }
  
  return {
    score: Math.max(0, score),
    issues,
    warnings,
    passed,
  };
}
