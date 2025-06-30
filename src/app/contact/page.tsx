import { generateContactMetadata } from '../../utils/seo';
import ContactForm from './ContactForm';

// Generate dynamic metadata for SEO  
export async function generateMetadata() {
  return await generateContactMetadata();
}

export default function ContactPage() {
  return <ContactForm />;
} 
