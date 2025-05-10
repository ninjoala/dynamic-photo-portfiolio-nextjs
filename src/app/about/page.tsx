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
          <h1 className="text-4xl font-bold">John Doe</h1>
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

      {/* Additional Sections */}
      <div className="mt-16 space-y-12">
        {/* Expertise Section */}
        <section>
          <h2 className="text-2xl font-semibold mb-6">Areas of Expertise</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 bg-gray-50 rounded-lg">
              <h3 className="font-medium mb-2">Portrait Photography</h3>
              <p className="text-gray-600">Capturing personalities and emotions in every frame</p>
            </div>
            <div className="p-6 bg-gray-50 rounded-lg">
              <h3 className="font-medium mb-2">Landscape Photography</h3>
              <p className="text-gray-600">Finding beauty in natural and urban landscapes</p>
            </div>
            <div className="p-6 bg-gray-50 rounded-lg">
              <h3 className="font-medium mb-2">Event Photography</h3>
              <p className="text-gray-600">Documenting special moments and celebrations</p>
            </div>
          </div>
        </section>

        {/* Personal Approach Section */}
        <section>
          <h2 className="text-2xl font-semibold mb-6">My Approach</h2>
          <div className="prose prose-lg max-w-none">
            <p>
              I believe that every photograph should tell a story. My approach combines technical expertise 
              with artistic vision to create images that not only capture the moment but also evoke emotion. 
              Whether I&apos;m shooting a wedding, a family portrait, or a landscape, I strive to find the perfect 
              balance between composition, lighting, and timing.
            </p>
            <p>
              When I&apos;m not behind the camera, you can find me exploring new locations, experimenting with 
              different techniques, or teaching photography workshops to aspiring photographers. I&apos;m constantly 
              learning and evolving in my craft, always seeking new ways to push creative boundaries.
            </p>
          </div>
        </section>

        {/* Equipment Section */}
        <section>
          <h2 className="text-2xl font-semibold mb-6">Equipment</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <h3 className="font-medium">Cameras</h3>
              <ul className="list-disc list-inside text-gray-600">
                <li>Canon EOS R5</li>
                <li>Sony A7 III</li>
                <li>Fujifilm X-T4</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium">Favorite Lenses</h3>
              <ul className="list-disc list-inside text-gray-600">
                <li>24-70mm f/2.8</li>
                <li>70-200mm f/2.8</li>
                <li>85mm f/1.4</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
} 