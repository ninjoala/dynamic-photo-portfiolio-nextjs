"use client";
import { useEffect, useState } from "react";
import { siteConfig, SiteConfig } from "./config";

export default function DynamicPage() {
  const [domain, setDomain] = useState<string | null>(null);
  const [fullUrl, setFullUrl] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const url = window.location.hostname; // Safely extracts only the hostname
      console.log("Hostname:", url); // Debugging output
      
      // Split the hostname and remove top-level domain
      const parts = url.split(".");
      const calculatedDomain =
        parts.length > 1 ? parts[parts.length - 2] : "default"; // Second to last part is the domain
      console.log("Calculated domain:", calculatedDomain);

      setDomain(calculatedDomain);
      setFullUrl(window.location.href); // Full URL for debugging
    }
  }, []);

  // Check if the domain exists in siteConfig
  const config: SiteConfig = domain && siteConfig[domain] ? siteConfig[domain] : siteConfig.default;

  return (
    <div>
      <h1>{config.heading}</h1>
      <p>{config.description}</p>
      <button>{config.buttonText}</button>
      <p>Full URL: {fullUrl || "Loading..."}</p>
      <p>Domain: {domain || "Loading..."}</p>
    </div>
  );
}
