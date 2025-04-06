'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Dialog } from '@headlessui/react';

interface GalleryImage {
  key: string;
  name: string;
  url: string;
  thumbnailUrl: string;
}

interface ClientGalleryProps {
  initialImages: GalleryImage[];
}

export function ClientGallery({ initialImages }: ClientGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  return (
    <div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {initialImages.map((image) => (
          image.thumbnailUrl && (
            <div
              key={image.key}
              className="relative aspect-square cursor-pointer overflow-hidden rounded-lg"
              onClick={() => image.url && setSelectedImage(image.url)}
            >
              <Image
                src={image.thumbnailUrl}
                alt={image.name}
                fill
                className="object-cover transition-transform duration-300 hover:scale-110"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
          )
        ))}
      </div>

      <Dialog
        open={selectedImage !== null}
        onClose={() => setSelectedImage(null)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/70" aria-hidden="true" />
        
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="relative max-h-[90vh] max-w-[90vw]">
            {selectedImage && (
              <Image
                src={selectedImage}
                alt="Full size image"
                width={1200}
                height={800}
                className="rounded-lg object-contain"
                onClick={() => setSelectedImage(null)}
              />
            )}
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-4 right-0 rounded-full bg-white/80 p-2 text-gray-800 hover:bg-white"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
} 