import { MetadataRoute } from 'next';
import { headers } from 'next/headers';

export default async function robots(): Promise<MetadataRoute.Robots> {
  // Get current host for sitemap URL
  const headersList = await headers();
  const host = headersList.get('host') || 'nickdobosmedia.com';
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  const baseUrl = `${protocol}://${host}`;

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/admin/',
        '/_next/',
        '/private/',
        '/*.json$',
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}