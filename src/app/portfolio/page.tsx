import VirtualGallery from '../components/VirtualGallery';
import { headers } from 'next/headers';
import { getCategoryFromDomain } from '../config';

export default async function PortfolioPage() {
  // Get the hostname from headers (server-side)
  const headersList = await headers();
  const host = headersList.get('host') || 'localhost';
  
  // Get the current category/mode from the domain
  const currentMode = getCategoryFromDomain(host);
  
  console.log('Portfolio Page - Host:', host);
  console.log('Portfolio Page - Current Mode:', currentMode);

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="py-8">
        <h1 className="text-4xl font-bold text-center mb-8">My Portfolio</h1>
        <VirtualGallery mode={currentMode} />
      </div>
    </main>
  );
} 