import { headers } from 'next/headers';
import { getCategoryFromDomain, siteVersions } from '../config';
import { generateFAQSchema } from '../../utils/seo';

// Generate metadata for FAQ page
export async function generateMetadata() {
  
  const title = `Frequently Asked Questions - Professional Photography in Newnan, GA`;
  const description = `Get answers to common questions about our professional photography services in Newnan, GA. Pricing, booking, and service information for real estate, family, and event photography.`;
  const url = `https://nickdobosmedia.com/faq`;

  return {
    title,
    description,
    keywords: ['photography FAQ', 'Newnan photographer questions', 'photography pricing', 'real estate photography FAQ', 'photo session information'],
    openGraph: {
      title,
      description,
      url,
      type: 'website',
    },
    alternates: {
      canonical: url,
    },
  };
}

// FAQ schema component
async function FAQSchema() {
  const schema = await generateFAQSchema();
  
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema),
      }}
    />
  );
}

export default async function FAQPage() {
  // Get the hostname from headers
  const headersList = await headers();
  const host = headersList.get('host') || 'localhost';
  const category = getCategoryFromDomain(host);
  
  // Get the configuration based on the domain
  const configKey = Object.keys(siteVersions).includes(category) ? category : 'default';
  const config = siteVersions[configKey];

  return (
    <>
      <FAQSchema />
      <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8 bg-background text-foreground">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold mb-4">Frequently Asked Questions</h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Common questions about our professional photography services in Newnan, GA
            </p>
          </div>

          <div className="space-y-12">
            {config.faq.categories.map((category, categoryIndex) => (
              <div key={categoryIndex} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
                <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white border-b pb-4">
                  {category.title}
                </h2>
                <div className="space-y-6">
                  {category.questions.map((qa, questionIndex) => (
                    <div key={questionIndex} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-b-0">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        {qa.question}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                        {qa.answer}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Call to Action */}
          <div className="mt-16 text-center bg-gray-50 dark:bg-gray-900 rounded-lg p-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
              Still Have Questions?
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Can&apos;t find what you&apos;re looking for? We&apos;re here to help with any questions about our photography services.
            </p>
            <a
              href="/contact"
              className="inline-block px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors duration-300"
            >
              Contact Us
            </a>
          </div>
        </div>
      </div>
    </>
  );
}