import PortfolioPage from '../components/PortfolioPage';
import { headers } from 'next/headers';
import { getCategoryFromDomain } from '../config';
import { generatePortfolioMetadata } from '../../utils/seo';

// Generate dynamic metadata for SEO
export async function generateMetadata() {
  return await generatePortfolioMetadata();
}

export default async function Portfolio() {
  // Get the hostname from headers (server-side)
  const headersList = await headers();
  const host = headersList.get('host') || 'localhost';
  
  // Get the current category/mode from the domain
  const currentMode = getCategoryFromDomain(host);
  
  console.log('Portfolio Page - Host:', host);
  console.log('Portfolio Page - Current Mode:', currentMode);

  return (
    <section className="bg-background text-foreground">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-center mb-12">
          Professional Photography Portfolio - Newnan, GA
        </h1>
        <div className="text-center mb-8 max-w-3xl mx-auto">
          <div className="prose prose-lg mx-auto">
            <p>
              Explore our portfolio of professional photography work in Newnan, Georgia. From real estate photography 
              to family portraits, events, and sports photography - see why local clients choose Nick Dobos Media 
              for their photography needs.
            </p>
          </div>
        </div>
        <PortfolioPage mode={currentMode} />
      </div>
    </section>
  );
} 