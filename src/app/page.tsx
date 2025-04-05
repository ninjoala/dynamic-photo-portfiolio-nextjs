"use client";
import { useEffect, useState } from "react";
import { siteVersions, SiteConfig } from "./config";
import LoadingSpinner from "./components/LoadingSpinner";
import Image from "next/image";

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
  const [config, setConfig] = useState<SiteConfig>(siteVersions.default);
  const [isLoading, setIsLoading] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [debugInfo, setDebugInfo] = useState<{
    fullHostname: string;
    parsedDomain: string;
    configKey: string;
  } | null>(null);

  // Initial setup effect
  useEffect(() => {
    if (typeof window !== "undefined") {
      const hostname = window.location.hostname;
      const parsedDomain = parseDomain(hostname);
      
      // Find matching configuration or fall back to default
      const configKey = Object.keys(siteVersions).includes(parsedDomain) 
        ? parsedDomain 
        : 'default';
      
      const matchingConfig = siteVersions[configKey];

      // Save debug info
      setDebugInfo({
        fullHostname: hostname,
        parsedDomain,
        configKey,
      });
      
      // Set the configuration
      setConfig(matchingConfig);
      
      // Start transition after initial delay
      setTimeout(() => {
        setIsTransitioning(true);
        setIsInitialized(true);
      }, 2000);
    }
  }, []);

  // Handle loading completion
  useEffect(() => {
    if (isInitialized && isImageLoaded && isTransitioning) {
      setTimeout(() => {
        setIsLoading(false);
      }, 1000);
    }
  }, [isInitialized, isImageLoaded, isTransitioning]);

  // Preload the hero image
  useEffect(() => {
    if (config.images.hero) {
      const img = document.createElement('img');
      img.src = config.images.hero;
      img.onload = () => setIsImageLoaded(true);
    }
  }, [config.images.hero]);

  return (
    <>
      {/* Main content - always rendered */}
      <main className="min-h-screen flex flex-col items-center justify-center p-8 text-center">
        <div className="max-w-2xl mx-auto">
          {/* Hero image */}
          <div className="relative w-full h-64 mb-8 overflow-hidden rounded-lg">
            <Image 
              src={config.images.hero} 
              alt="Hero image"
              fill
              style={{ objectFit: "cover" }}
              priority
            />
          </div>
          
          <h1 className="text-4xl font-bold mb-6" style={{ color: config.theme.primaryColor }}>
            {config.text.heading}
          </h1>
          
          <p className="text-xl mb-8">{config.text.description}</p>
          
          <button 
            className="hover:bg-opacity-90 text-white font-light py-3 px-6 rounded-lg transition-colors"
            style={{ backgroundColor: config.theme.primaryColor }}
          >
            {config.text.buttonText}
          </button>
          
          {/* Debug info - only shown in development */}
          {process.env.NODE_ENV === 'development' && debugInfo && (
            <div className="mt-8 p-4 bg-gray-100 rounded text-left text-sm font-mono">
              <p>Full Hostname: {debugInfo.fullHostname}</p>
              <p>Parsed Domain: {debugInfo.parsedDomain}</p>
              <p>Config Key: {debugInfo.configKey}</p>
              <p>Image Loaded: {isImageLoaded ? 'Yes' : 'No'}</p>
              <p>Initialized: {isInitialized ? 'Yes' : 'No'}</p>
              <p>Transitioning: {isTransitioning ? 'Yes' : 'No'}</p>
            </div>
          )}
        </div>
      </main>

      {/* Loading overlay */}
      {isLoading && (
        <div className={`fixed inset-0 z-50 bg-white transition-opacity duration-1000 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
          <LoadingSpinner />
        </div>
      )}
    </>
  );
}
