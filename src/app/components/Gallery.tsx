'use client';

import React, { useState, useCallback } from 'react';
import Image from 'next/image';

// Define the image type
interface GalleryImage {
  id: number;
  width: number;
  height: number;
  url: string;
}

// Spinner component
const Spinner = () => (
  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-90 transition-opacity duration-300">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
  </div>
);

// Generate random images using Picsum
const generateImages = (count: number): GalleryImage[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    width: 800,
    height: 600,
    url: `https://picsum.photos/800/600?random=${i}`
  }));
};

const Gallery: React.FC = () => {
  const [images] = useState<GalleryImage[]>(generateImages(12));
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [showSpinner, setShowSpinner] = useState(false);

  const handleImageLoad = (imageUrl: string) => {
    setLoadedImages(prev => new Set(prev).add(imageUrl));
    if (selectedImage?.url === imageUrl) {
      // Start fade out transition
      setTimeout(() => {
        setShowSpinner(false);
      }, 100); // Small delay to ensure image is visible
      setTimeout(() => {
        setIsLoading(false);
      }, 400); // After transition completes
    }
  };

  const handleImageClick = (image: GalleryImage) => {
    setSelectedImage(image);
    if (!loadedImages.has(image.url)) {
      setIsLoading(true);
      setShowSpinner(true);
    }
    document.body.style.overflow = 'hidden';
  };

  const handleCloseModal = () => {
    setSelectedImage(null);
    setIsLoading(false);
    setShowSpinner(false);
    document.body.style.overflow = 'unset';
  };

  const handlePrevImage = useCallback(() => {
    if (!selectedImage) return;
    const currentIndex = images.findIndex(img => img.id === selectedImage.id);
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : images.length - 1;
    const prevImage = images[prevIndex];
    
    if (!loadedImages.has(prevImage.url)) {
      setIsLoading(true);
      setShowSpinner(true);
    }
    setSelectedImage(prevImage);
  }, [selectedImage, images, loadedImages]);

  const handleNextImage = useCallback(() => {
    if (!selectedImage) return;
    const currentIndex = images.findIndex(img => img.id === selectedImage.id);
    const nextIndex = currentIndex < images.length - 1 ? currentIndex + 1 : 0;
    const nextImage = images[nextIndex];
    
    if (!loadedImages.has(nextImage.url)) {
      setIsLoading(true);
      setShowSpinner(true);
    }
    setSelectedImage(nextImage);
  }, [selectedImage, images, loadedImages]);

  // Handle keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedImage) return;
      if (e.key === 'ArrowLeft') handlePrevImage();
      if (e.key === 'ArrowRight') handleNextImage();
      if (e.key === 'Escape') handleCloseModal();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImage, handlePrevImage, handleNextImage]);

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image) => (
            <div
              key={image.id}
              className="relative aspect-[4/3] overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out cursor-pointer"
              onClick={() => handleImageClick(image)}
            >
              <Image
                src={image.url}
                alt={`Gallery image ${image.id}`}
                fill
                className="object-cover hover:scale-105 transition-transform duration-300 ease-in-out"
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                onLoadingComplete={() => handleImageLoad(image.url)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4 md:p-8"
          onClick={handleCloseModal}
        >
          <div 
            className="relative w-full h-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 text-white bg-black bg-opacity-50 hover:bg-opacity-75 rounded-full p-2 transition-all duration-200 z-10"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Navigation Arrows */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePrevImage();
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white bg-black bg-opacity-50 hover:bg-opacity-75 rounded-full p-2 transition-all duration-200 z-10 group"
              aria-label="Previous image"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNextImage();
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white bg-black bg-opacity-50 hover:bg-opacity-75 rounded-full p-2 transition-all duration-200 z-10 group"
              aria-label="Next image"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Modal Image */}
            <div className="relative w-full h-full">
              {(isLoading && showSpinner) && (
                <Spinner />
              )}
              <Image
                src={selectedImage.url}
                alt={`Large view of gallery image ${selectedImage.id}`}
                className="object-contain"
                fill
                sizes="100vw"
                priority
                onLoadingComplete={() => handleImageLoad(selectedImage.url)}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Gallery; 