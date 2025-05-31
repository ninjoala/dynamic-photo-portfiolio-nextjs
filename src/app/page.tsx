import { headers } from 'next/headers';
import { siteVersions } from "./config";
import Image from "next/image";
import Link from 'next/link';
import { createImgixUrl } from '../utils/imgix';
import { getFeaturedWorkUrls } from '../utils/featuredWork';

// Helper function to parse domain
function parseDomain(hostname: string): string {
  // Remove port if present
  const hostWithoutPort = hostname.split(':')[0];
  
  // Remove common TLDs and www
  const cleanDomain = hostWithoutPort
    .replace(/\.(com|net|org|local|localhost|vercel\.app)$/i, '')
    .replace(/^www\./i, '');
  
  // If we're on localhost, return default
  if (hostname === 'localhost' || hostname.includes('127.0.0.1')) {
    return 'default';
  }
  
  return cleanDomain;
}

interface PageProps {
  params: Promise<{ [key: string]: string | string[] }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function HomePage({
  searchParams,
}: PageProps) {
  const resolvedSearchParams = await searchParams;
  // Get the hostname from headers (server-side)
  const headersList = await headers();
  const host = headersList.get('host') || 'localhost';
  
  // Check for configuration override in query parameter
  const configOverride = typeof resolvedSearchParams?.config === 'string' ? resolvedSearchParams.config : undefined;
  const parsedDomain = configOverride || parseDomain(host);
  
  // Get the configuration based on the domain
  const configKey = Object.keys(siteVersions).includes(parsedDomain) 
    ? parsedDomain 
    : 'default';
  const config = siteVersions[configKey];

  // Dynamically load featured-work from S3 via Imgix URLs
  const featuredImages = await getFeaturedWorkUrls(
    config.photographyCategory.bucketFolder,
    3
  );

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen">
        <div className="absolute inset-0">
          <Image
            src={createImgixUrl('re-hero.jpg', {
              width: 1920,
              height: 1080,
              quality: 85,
              fit: 'max',
              crop: 'focalpoint'
            })}
            alt="Hero background"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black bg-opacity-50" />
        </div>
        <div className="relative h-full flex items-center justify-center text-white">
          <div className="text-center space-y-6 px-4">
            <h1 className="text-5xl md:text-7xl font-bold animate-fade-up">
              {config.text.hero.heading}
            </h1>
            <p className="text-xl md:text-2xl max-w-2xl mx-auto animate-fade-up-delay">
              {config.text.hero.subtext}
            </p>
            <div className="pt-4">
              <Link 
                href="/portfolio" 
                className="inline-block px-8 py-3 bg-background text-foreground dark:bg-foreground dark:text-background rounded-full hover:bg-opacity-90 transition-all text-lg"
              >
                View Portfolio
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Work Section */}
      <section className="py-20 px-4 bg-background text-foreground">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Featured Work</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredImages.map((src, idx) => (
              <div key={idx} className="group relative aspect-square overflow-hidden rounded-lg">
                <Image
                  src={src}
                  alt={`Featured Work ${idx + 1}`}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  priority={idx < 2}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-0 p-6 text-white">
                    <h3 className="text-xl font-semibold">{config.photographyCategory.title}</h3>
                    <p className="text-sm">Featured Work</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Overview */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-12">Our Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-white dark:bg-white rounded-lg shadow-sm">
              <div className="h-12 w-12 mx-auto mb-4 bg-black text-white rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">Real Estate Photography</h3>
              <p className="text-gray-600">Bright, crisp images that help homes stand out online and attract more buyers.</p>
            </div>
            <div className="p-6 bg-white dark:bg-white rounded-lg shadow-sm">
              <div className="h-12 w-12 mx-auto mb-4 bg-black text-white rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">Agent Branding Sessions</h3>
              <p className="text-gray-600">Professional portraits and lifestyle shots perfect for marketing, social media, and print.</p>
            </div>
            <div className="p-6 bg-white dark:bg-white rounded-lg shadow-sm">
              <div className="h-12 w-12 mx-auto mb-4 bg-black text-white rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">Media Upgrades Coming Soon</h3>
              <p className="text-gray-600">New services like drone, video, and 3D tours launching soon - let&apos;s grow together.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 px-4 bg-foreground text-background">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Let&apos;s make your next listing shine.</h2>
          <p className="text-xl mb-8">Reach out to schedule your shoot or ask about availability.</p>
          <Link 
            href="/contact" 
            className="inline-block px-8 py-3 bg-background text-foreground rounded-full hover:bg-opacity-90 transition-all text-lg"
          >
            Get in Touch
          </Link>
        </div>
      </section>
    </main>
  );
}
