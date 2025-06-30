import Image from 'next/image';
import { getProfileImage } from '../../utils/sharedImages';
import { generateAboutMetadata } from '../../utils/seo';
import StructuredData from '../components/StructuredData';

// Generate dynamic metadata for SEO
export async function generateMetadata() {
  return await generateAboutMetadata();
}

export default async function AboutPage() {
  const profileImageUrl = await getProfileImage();

  return (
    <>
      <StructuredData includeLocalBusiness={true} includeService={false} />
      <div className="min-h-screen flex items-center justify-center light-gray-bg">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="grid md:grid-cols-2 gap-12 items-center">
        {/* Image Section */}
        {profileImageUrl ? (
          <div className="relative aspect-square rounded-2xl overflow-hidden shadow-xl">
            <Image
              src={profileImageUrl}
              alt="Nick Dobos - Professional Photographer"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          </div>
        ) : (
          <div className="relative aspect-square rounded-2xl overflow-hidden shadow-xl bg-gray-200 flex items-center justify-center">
            <p className="text-gray-500">Profile image not available</p>
          </div>
        )}

        {/* Text Content Section */}
        <div className="space-y-6">
          <h1 className="text-4xl font-bold">Nick Dobos</h1>
          <h2 className="text-xl text-gray-600">Professional Photographer in Newnan, GA</h2>
          <div className="prose prose-lg">
            <p>
              Welcome to Nick Dobos Media, your trusted professional photographer serving Newnan, Georgia and the surrounding areas. 
              I first picked up a camera in 2023 when my wife and I found out we were expecting our first child, and I became passionate about capturing precious moments and memories.
            </p>
            <p className="mt-4">
              Starting with family and pet photography, I quickly discovered my love for the art of photography. My journey led me to wildlife photography, 
              but I found my professional calling in real estate photography, where I help Newnan area real estate agents and homeowners showcase properties 
              with stunning, high-quality images that sell homes faster.
            </p>
            <p className="mt-4">
              Today, I specialize in real estate photography, family portraits, event photography, and sports photography throughout Newnan and the greater 
              Georgia area. My commitment to learning and perfecting each genre of photography ensures that every client receives exceptional, 
              professional results that exceed expectations.
            </p>
          </div>
        </div>
        </div>
      </div>
    </div>
    </>
  );
} 
