import { MetadataRoute } from 'next';
import { headers } from 'next/headers';
import { getCategoryFromDomain, photographyCategories } from './config';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Get current domain for base URL generation
  const headersList = await headers();
  const host = headersList.get('host') || 'nickdobosmedia.com';
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  const baseUrl = `${protocol}://${host}`;
  
  // Get current category
  const category = getCategoryFromDomain(host);
  
  // Base pages that exist on all sites
  const routes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/portfolio`,
      lastModified: new Date(),  
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
  ];

  // Add category-specific routes if they exist
  const categoryData = photographyCategories[category];
  if (categoryData && category !== 'default') {
    // Add service-specific pages
    routes.push({
      url: `${baseUrl}/services`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    });
    
    // Add pricing page for categories that have pricing
    if (categoryData.priceRange) {
      routes.push({
        url: `${baseUrl}/pricing`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      });
    }
  }

  return routes;
}