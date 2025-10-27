import { Metadata } from 'next';
import { siteVersions } from '../app/config';

// Helper function to get default site config
export async function getCurrentConfig() {
  return siteVersions.default;
}

// Base SEO configuration
const baseSEO = {
  siteName: 'Nick Dobos Media',
  author: 'Nick Dobos',
  location: 'Newnan, GA',
  phone: '+1 (678) 850-6600',
  email: 'nick@nickdobosmedia.com',
  baseUrl: 'https://nickdobosmedia.com',
  social: {
    instagram: 'https://www.instagram.com/nick_dobos_media/',
    facebook: 'https://www.facebook.com/p/Nicholas-Dobos-Photography-61550320203022/',
    tiktok: 'https://www.tiktok.com/@nickdobosphotography'
  }
};

// Category-specific SEO data
export const categorySEO = {
  realestate: {
    title: 'Professional Real Estate Photography in Newnan, GA',
    description: 'Expert real estate photography services in Newnan, GA. High-quality HDR photography, virtual staging, and aerial shots that help properties sell faster.',
    keywords: ['real estate photography', 'Newnan GA photographer', 'property photography', 'HDR photography', 'virtual staging', 'aerial photography', 'real estate photos'],
    services: ['HDR Photography', 'Virtual Staging', 'Aerial Photography', 'Floor Plans', 'Virtual Tours'],
    localKeywords: ['real estate photographer Newnan GA', 'property photographer near me', 'Newnan real estate photos']
  },
  events: {
    title: 'Professional Event Photography in Newnan, GA',
    description: 'Capture your special moments with professional event photography in Newnan, GA. Corporate events, weddings, parties, and conferences.',
    keywords: ['event photography', 'Newnan GA events', 'wedding photography', 'corporate photography', 'party photographer', 'conference photography'],
    services: ['Corporate Events', 'Weddings', 'Parties', 'Conferences', 'Live Coverage'],
    localKeywords: ['event photographer Newnan GA', 'wedding photographer near me', 'Newnan event photography']
  },
  family: {
    title: 'Professional Family Photography in Newnan, GA',
    description: 'Preserve precious family moments with professional family photography in Newnan, GA. Natural, authentic portraits that capture your family\'s unique story.',
    keywords: ['family photography', 'Newnan GA family photos', 'children photography', 'family portraits', 'generational photos', 'holiday sessions'],
    services: ['Family Portraits', 'Children Photography', 'Generational Photos', 'Holiday Sessions', 'Location Shoots'],
    localKeywords: ['family photographer Newnan GA', 'children photographer near me', 'Newnan family photos']
  },
  sports: {
    title: 'Professional Sports Photography in Newnan, GA',
    description: 'Dynamic sports photography in Newnan, GA that captures the action and emotion. Team photos, individual portraits, and tournament coverage.',
    keywords: ['sports photography', 'Newnan GA sports', 'action photography', 'team photos', 'sports portraits', 'tournament photography'],
    services: ['Action Shots', 'Team Photos', 'Individual Portraits', 'Tournament Coverage', 'Sports Events'],
    localKeywords: ['sports photographer Newnan GA', 'team photographer near me', 'Newnan sports photography']
  },
  default: {
    title: 'Professional Photography Services in Newnan, GA',
    description: 'Nick Dobos Media provides professional photography services in Newnan, GA. Specializing in real estate, events, family, and sports photography.',
    keywords: ['professional photographer', 'Newnan GA photography', 'photography services', 'Nick Dobos Media'],
    services: ['Real Estate Photography', 'Event Photography', 'Family Photography', 'Sports Photography'],
    localKeywords: ['photographer Newnan GA', 'professional photographer near me', 'Newnan photography services']
  }
};

// Generate metadata for home page
export async function generateHomeMetadata(): Promise<Metadata> {
  const seoData = categorySEO.default;
  const config = await getCurrentConfig();
  
  const title = seoData.title;
  const description = seoData.description;
  const url = baseSEO.baseUrl;
  const ogImage = 'https://wasabindmdemo.imgix.net/real-estate/featured-work/_DR62951-HDR.jpg?w=1200&h=630&fit=crop&auto=format';

  return {
    title,
    description,
    keywords: [...seoData.keywords, ...seoData.localKeywords],
    authors: [{ name: baseSEO.author }],
    creator: baseSEO.author,
    publisher: baseSEO.siteName,
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      title,
      description,
      url,
      siteName: baseSEO.siteName,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${config.photographyCategory.title} - ${baseSEO.siteName}`,
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
      creator: '@nickdobos_photo',
    },
    alternates: {
      canonical: url,
    },
  };
}

// Generate metadata for about page
export async function generateAboutMetadata(): Promise<Metadata> {
  const seoData = categorySEO.default;
  
  const title = `About Nick Dobos - ${seoData.title.replace('Professional ', '')}`;
  const description = `Meet Nick Dobos, a professional photographer in Newnan, GA specializing in ${seoData.services.join(', ').toLowerCase()}. Learn about my passion for photography and experience.`;
  const url = `${baseSEO.baseUrl}/about`;
  const ogImage = 'https://wasabindmdemo.imgix.net/shared/nick-profile.jpg?w=1200&h=630&fit=crop&auto=format';

  return {
    title,
    description,
    keywords: [...seoData.keywords, 'about Nick Dobos', 'photographer bio', 'Newnan photographer'],
    authors: [{ name: baseSEO.author }],
    openGraph: {
      title,
      description,
      url,
      siteName: baseSEO.siteName,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: 'Nick Dobos - Professional Photographer',
        },
      ],
      locale: 'en_US',
      type: 'profile',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
    alternates: {
      canonical: url,
    },
  };
}

// Generate metadata for portfolio page
export async function generatePortfolioMetadata(): Promise<Metadata> {
  const seoData = categorySEO.default;
  const config = await getCurrentConfig();
  
  const title = `${config.photographyCategory.title} Portfolio - Nick Dobos Media`;
  const description = `View my ${config.photographyCategory.title.toLowerCase()} portfolio showcasing ${seoData.services.join(', ').toLowerCase()} in Newnan, GA and surrounding areas.`;
  const url = `${baseSEO.baseUrl}/portfolio`;
  const ogImage = 'https://wasabindmdemo.imgix.net/real-estate/featured-work/_DR62951-HDR.jpg?w=1200&h=630&fit=crop&auto=format';

  return {
    title,
    description,
    keywords: [...seoData.keywords, 'portfolio', 'photo gallery', 'photography examples'],
    authors: [{ name: baseSEO.author }],
    openGraph: {
      title,
      description,
      url,
      siteName: baseSEO.siteName,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${config.photographyCategory.title} Portfolio - ${baseSEO.siteName}`,
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
    alternates: {
      canonical: url,
    },
  };
}

// Generate metadata for contact page
export async function generateContactMetadata(): Promise<Metadata> {
  const seoData = categorySEO.default;
  
  const title = `Contact Nick Dobos - ${seoData.title.replace('Professional ', '')}`;
  const description = `Contact Nick Dobos for professional photography services in Newnan, GA. Get a quote for ${seoData.services.join(', ').toLowerCase()}. Call ${baseSEO.phone} or email today.`;
  const url = `${baseSEO.baseUrl}/contact`;

  return {
    title,
    description,
    keywords: [...seoData.keywords, 'contact photographer', 'photography quote', 'book photographer Newnan'],
    authors: [{ name: baseSEO.author }],
    openGraph: {
      title,
      description,
      url,
      siteName: baseSEO.siteName,
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
    alternates: {
      canonical: url,
    },
  };
}

// Generate structured data for LocalBusiness
export function generateLocalBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: baseSEO.siteName,
    image: 'https://wasabindmdemo.imgix.net/shared/nick-profile.jpg',
    '@id': baseSEO.baseUrl,
    url: baseSEO.baseUrl,
    telephone: baseSEO.phone,
    email: baseSEO.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: '',
      addressLocality: 'Newnan',
      addressRegion: 'GA',
      addressCountry: 'US',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 33.3807,
      longitude: -84.7997,
    },
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      opens: '09:00',
      closes: '18:00',
    },
    sameAs: [
      baseSEO.social.instagram,
      baseSEO.social.facebook,
      baseSEO.social.tiktok,
    ],
  };
}

// Generate structured data for Service
export async function generateServiceSchema() {
  const config = await getCurrentConfig();

  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: config.photographyCategory.title,
    description: config.photographyCategory.description,
    provider: {
      '@type': 'LocalBusiness',
      name: baseSEO.siteName,
      telephone: baseSEO.phone,
      email: baseSEO.email,
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Newnan',
        addressRegion: 'GA',
        addressCountry: 'US',
      },
    },
    serviceType: config.photographyCategory.title,
    areaServed: {
      '@type': 'City',
      name: 'Newnan',
      containedInPlace: {
        '@type': 'State',
        name: 'Georgia',
      },
    },
  };
}

// Generate FAQ schema markup
export async function generateFAQSchema() {
  const config = await getCurrentConfig();
  
  const faqItems = config.faq.categories.flatMap(category =>
    category.questions.map(qa => ({
      '@type': 'Question',
      name: qa.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: qa.answer,
      },
    }))
  );

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems,
  };
}