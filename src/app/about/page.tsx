import Image from 'next/image';
import { getProfileImage } from '../../utils/sharedImages';

export default async function AboutPage() {
  const profileImageUrl = await getProfileImage();

  return (
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
          <h2 className="text-xl text-gray-600">Professional Photographer</h2>
          <div className="prose prose-lg">
            <p>
              I first picked up a camera in 2023 when my wife and I found out we were expecting our first child. 
              I was so excited to capture the journey of our family and the memories we would make together. 
              I started by taking photos of our family and pets, and then I quickly became obsessed with the art of photography.
              But, once I started taking photos of wildlife, I knew I had found my passion. I devoted to spending as much time as I could with a camera in my hands.
              It is my personal belief that each genre of photography I tackle has a host of lessons to teach me about the art, and I&apos;m dedicated to learn as much as I can.
            </p>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
} 
