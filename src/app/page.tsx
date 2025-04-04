"use client";
import { useEffect, useState } from "react";
import { siteConfig, SiteConfig } from "./config";
import LoadingSpinner from "./components/LoadingSpinner";

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

export default function DynamicPage() {
  const [config, setConfig] = useState<SiteConfig>(siteConfig.default);
  const [isLoading, setIsLoading] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [debugInfo, setDebugInfo] = useState<{
    fullHostname: string;
    parsedDomain: string;
    configKey: string;
  } | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const hostname = window.location.hostname;
      const parsedDomain = parseDomain(hostname);
      
      // Find matching configuration or fall back to default
      const configKey = Object.keys(siteConfig).includes(parsedDomain) 
        ? parsedDomain 
        : 'default';
      
      const matchingConfig = siteConfig[configKey];

      // Save debug info
      setDebugInfo({
        fullHostname: hostname,
        parsedDomain,
        configKey,
      });
      
      // Set the configuration
      setConfig(matchingConfig);
      
      // Start transition after 2 seconds
      setTimeout(() => {
        setIsTransitioning(true);
        // Remove loading screen after transition
        setTimeout(() => {
          setIsLoading(false);
        }, 1000);
      }, 2000);
    }
  }, []);

  if (isLoading) {
    return (
      <div className={`fixed inset-0 z-50 transition-opacity duration-1000 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 text-center">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">{config.heading}</h1>
        <p className="text-xl mb-8">{config.description}</p>
        <button className="bg-stone-800 hover:bg-stone-700 text-white font-light py-3 px-6 rounded-lg transition-colors">
          {config.buttonText}
        </button>
        
        {/* Debug info - only shown in development */}
        {process.env.NODE_ENV === 'development' && debugInfo && (
          <div className="mt-8 p-4 bg-gray-100 rounded text-left text-sm font-mono">
            <p>Full Hostname: {debugInfo.fullHostname}</p>
            <p>Parsed Domain: {debugInfo.parsedDomain}</p>
            <p>Config Key: {debugInfo.configKey}</p>
          </div>
        )}
      </div>
    </main>
  );
}
