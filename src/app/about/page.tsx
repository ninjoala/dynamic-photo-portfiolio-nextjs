import Image from 'next/image';

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <div className="grid md:grid-cols-2 gap-12 items-start">
        {/* Image Section */}
        <div className="relative aspect-square rounded-2xl overflow-hidden shadow-xl">
          <Image
            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d"
            alt="Portrait photo"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
        </div>

        {/* Text Content Section */}
        <div className="space-y-6">
          <h1 className="text-4xl font-bold">Nick Dobos</h1>
          <h2 className="text-xl text-gray-600">Professional Photographer</h2>
          
          <div className="prose prose-lg">
            <p>
              With over a decade of experience capturing life&apos;s most precious moments, 
              I&apos;ve developed a passion for creating timeless images that tell compelling stories.
              My journey in photography began during my travels across Europe, 
              where I discovered the power of visual storytelling.
            </p>
          </div>
        </div>
      </div>
   </div>
  );
} 
