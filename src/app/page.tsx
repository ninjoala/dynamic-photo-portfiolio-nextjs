"use client";
import { useRouter } from "next/navigation";
import { siteConfig, SiteConfig } from "./config";
import { usePathname } from 'next/navigation'
import { useEffect, useState } from "react";
import Image from "next/image";


export default function DynamicPage() {
  const pathname = usePathname(); // Get the full pathname (e.g., "/realestate")
  console.log("Full pathname:", pathname);

  const site = pathname?.replace("/", ""); // Extract key (e.g., "realestate")
  console.log("Extracted site:", site);

  // Check if the site exists in siteConfig
  const config: SiteConfig = site && siteConfig[site] ? siteConfig[site] : siteConfig.default;

  console.log("Config object:", config);

  console.log(`${config.heading}`)

  const [fullUrl, setFullUrl] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setFullUrl(window.location.href); // Get the full URL
    }
  }, []);

  return (
    <div>
      <h1>{config.heading}</h1>
      <p>{config.description}</p>
      <button>{config.buttonText}</button>    
      <p>Full URL: {fullUrl || "Loading..."}</p>
    </div>
  );
}