import { useEffect } from 'react';

/**
 * SEO компонент для динамического управления meta tags
 * 
 * @example
 * <SEO 
 *   title="Аналитика - PROMO.MUSIC"
 *   description="Детальная аналитика прослушиваний, дохода и географии аудитории"
 *   keywords="аналитика музыки, статистика прослушиваний"
 *   image="/images/analytics-preview.jpg"
 * />
 */
interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'profile' | 'music.song' | 'music.album';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  noindex?: boolean;
  nofollow?: boolean;
  canonicalUrl?: string;
  structuredData?: Record<string, any>;
}

export function SEO({
  title = 'PROMO.MUSIC - Профессиональный кабинет артиста',
  description = 'Комплексная платформа для музыкантов: аналитика, управление треками и видео, профессиональная оценка треков экспертами, продвижение, баннерная реклама.',
  keywords = 'музыкальная платформа, кабинет артиста, управление музыкой, аналитика для музыкантов',
  image = 'https://promo.music/og-image.jpg',
  url = 'https://promo.music',
  type = 'website',
  author,
  publishedTime,
  modifiedTime,
  noindex = false,
  nofollow = false,
  canonicalUrl,
  structuredData,
}: SEOProps) {
  
  useEffect(() => {
    // Update document title
    document.title = title;

    // Update or create meta tags
    const updateMetaTag = (name: string, content: string, property?: boolean) => {
      const attribute = property ? 'property' : 'name';
      let element = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement;
      
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      
      element.content = content;
    };

    // Basic meta tags
    updateMetaTag('description', description);
    updateMetaTag('keywords', keywords);
    
    // Robots
    const robotsContent = `${noindex ? 'noindex' : 'index'}, ${nofollow ? 'nofollow' : 'follow'}`;
    updateMetaTag('robots', robotsContent);

    // Open Graph
    updateMetaTag('og:title', title, true);
    updateMetaTag('og:description', description, true);
    updateMetaTag('og:image', image, true);
    updateMetaTag('og:url', url, true);
    updateMetaTag('og:type', type, true);

    // Twitter Card
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', title);
    updateMetaTag('twitter:description', description);
    updateMetaTag('twitter:image', image);

    // Optional meta tags
    if (author) {
      updateMetaTag('author', author);
      updateMetaTag('article:author', author, true);
    }

    if (publishedTime) {
      updateMetaTag('article:published_time', publishedTime, true);
    }

    if (modifiedTime) {
      updateMetaTag('article:modified_time', modifiedTime, true);
    }

    // Canonical URL
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.rel = 'canonical';
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.href = canonicalUrl || url;

    // Structured Data (JSON-LD)
    if (structuredData) {
      const existingScript = document.querySelector('script[type="application/ld+json"][data-dynamic]');
      if (existingScript) {
        existingScript.remove();
      }

      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-dynamic', 'true');
      script.textContent = JSON.stringify(structuredData);
      document.head.appendChild(script);
    }

    // Cleanup function
    return () => {
      // Reset to default title on unmount if needed
    };
  }, [title, description, keywords, image, url, type, author, publishedTime, modifiedTime, noindex, nofollow, canonicalUrl, structuredData]);

  return null; // This component doesn't render anything
}

/**
 * Hook для динамического обновления SEO
 * 
 * @example
 * const updateSEO = useSEO();
 * updateSEO({
 *   title: 'New Title',
 *   description: 'New Description'
 * });
 */
export function useSEO() {
  return (props: SEOProps) => {
    const event = new CustomEvent('seo-update', { detail: props });
    window.dispatchEvent(event);
  };
}

/**
 * Предустановленные SEO конфигурации для разных страниц
 */
export const SEOConfig = {
  home: {
    title: 'PROMO.MUSIC - Профессиональный кабинет артиста',
    description: 'Комплексная платформа для музыкантов: аналитика, управление треками и видео, профессиональная оценка треков, продвижение, баннерная реклама.',
    keywords: 'музыкальная платформа, кабинет артиста, управление музыкой, аналитика для музыкантов',
  },
  
  analytics: {
    title: 'Аналитика - PROMO.MUSIC',
    description: 'Детальная аналитика прослушиваний, дохода, географии аудитории и динамики роста. Графики и отчеты в реальном времени.',
    keywords: 'аналитика музыки, статистика прослушиваний, доход от музыки, география слушателей',
  },
  
  tracks: {
    title: 'Мои треки - PROMO.MUSIC',
    description: 'Управление музыкальными треками: загрузка, редактирование, статистика прослушиваний, питчинг на плейлисты.',
    keywords: 'загрузка музыки, управление треками, статистика треков, питчинг музыки',
  },
  
  trackTest: {
    title: 'Тест трека - Профессиональная оценка экспертами | PROMO.MUSIC',
    description: 'Получите профессиональную оценку вашего трека от 5-10 экспертов музыкальной индустрии. Детальный фидбек по сведению, аранжировке, оригинальности и коммерческому потенциалу.',
    keywords: 'оценка музыки, эксперты музыкальной индустрии, фидбек на трек, профессиональная критика музыки, тест трека',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: 'Профессиональная оценка треков',
      description: 'Получите экспертную оценку вашего музыкального трека',
      provider: {
        '@type': 'Organization',
        name: 'PROMO.MUSIC',
      },
      offers: {
        '@type': 'Offer',
        price: '1000',
        priceCurrency: 'RUB',
      },
    },
  },
  
  video: {
    title: 'Мои видео - PROMO.MUSIC',
    description: 'Управление видеоконтентом: загрузка на YouTube и RuTube, статистика просмотров, продвижение видео.',
    keywords: 'видео клипы, управление видео, YouTube для артистов, RuTube',
  },
  
  concerts: {
    title: 'Мои концерты - PROMO.MUSIC',
    description: 'Управление концертами и событиями: создание, редактирование, продвижение, билетная интеграция.',
    keywords: 'концерты артиста, управление концертами, продвижение концертов, билеты на концерт',
  },
  
  promotion: {
    title: 'Продвижение - PROMO.MUSIC',
    description: 'Комплексные услуги продвижения музыки: питчинг, маркетинг, PR, SMM, radio promotion, плейлисты.',
    keywords: 'продвижение музыки, музыкальный маркетинг, питчинг плейлистов, радио продвижение, SMM для музыкантов',
  },
  
  banners: {
    title: 'Баннерная реклама - PROMO.MUSIC',
    description: 'Создание и управление баннерной рекламой: кампании, аналитика показов и кликов, таргетинг.',
    keywords: 'баннерная реклама, визуальная реклама музыки, промо баннеры',
  },
  
  settings: {
    title: 'Настройки - PROMO.MUSIC',
    description: 'Настройки профиля, безопасности, уведомлений, интеграций и подписки.',
    keywords: 'настройки профиля, безопасность аккаунта',
    noindex: true, // Private page
    nofollow: true,
  },
};
