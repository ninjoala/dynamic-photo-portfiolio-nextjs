import { headers } from 'next/headers';
import { siteVersions, SiteConfig } from "./config";
import Image from "next/image";
import Button from './components/Button';

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

export default async function HomePage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  // Get the hostname from headers (server-side)
  const headersList = await headers();
  const host = headersList.get('host') || 'localhost';
  
  // Check for configuration override in query parameter
  const configOverride = searchParams.config as string;
  const parsedDomain = configOverride || parseDomain(host);
  
  // Get the configuration based on the domain
  const configKey = Object.keys(siteVersions).includes(parsedDomain) 
    ? parsedDomain 
    : 'default';
  const config: SiteConfig = siteVersions[configKey];

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 text-center">
      <div className="max-w-2xl mx-auto">
        {/* Hero image */}
        {config.images.hero && (
          <div className="relative w-full h-64 mb-8 overflow-hidden rounded-lg">
            <Image 
              src={config.images.hero} 
              alt="Hero image"
              fill
              style={{ objectFit: "cover" }}
              priority
            />
          </div>
        )}
        
        <h1 className="text-4xl font-bold mb-6" style={{ color: config.theme.primaryColor }}>
          {config.text.heading}
        </h1>
        
        <p className="text-xl mb-8">{config.text.description}</p>
        
        <Button 
          text={config.text.buttonText}
          backgroundColor={config.theme.primaryColor}
        />
        
        {/* Debug info - only shown in development */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 p-4 bg-gray-100 rounded text-left text-sm font-mono">
            <p>Full Hostname: {host}</p>
            <p>Parsed Domain: {parsedDomain}</p>
            <p>Config Key: {configKey}</p>
            <p>Available Configs: {Object.keys(siteVersions).join(', ')}</p>
          </div>
        )}
      </div>
    </main>
  );
}
