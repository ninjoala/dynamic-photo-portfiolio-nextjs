'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useVirtualizer } from '@tanstack/react-virtual';
import { fetchImageData } from '../../utils/fetchImageData';
import ImageModal from './ImageModal';

interface GalleryImage {
  key: string;
  name: string;
  url: string;
  thumbnailUrl: string;
}

interface VirtualGalleryProps {
  mode: string;
}

export default function VirtualGallery({ mode }: VirtualGalleryProps) {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalImageIndex, setModalImageIndex] = useState(0);

  // Calculate the number of columns based on viewport width
  const [columns, setColumns] = useState(3);

  // Load images from images.json
  const loadImages = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // Try fetching mode-specific data, fallback to default if not found
      let data;
      let effectiveMode = mode;
      try {
        data = await fetchImageData(mode);
      } catch (err) {
        console.warn(`Failed to load images for mode "${mode}", falling back to default if not found`, err);
        data = await fetchImageData('default');
        effectiveMode = 'default';
      }
      
      console.log('==== DEBUG: Image Loading ====');
      console.log('Requested Mode:', mode);
      console.log('Effective Mode:', effectiveMode);
      console.log('Raw data from images.json:', data);
      console.log('All available images:', data.images.map(img => ({
        name: img.name,
        url: img.url
      })));
      
      // Filter images to only those in the root of the category folder (no nested subfolders)
      const filteredImages = data.images.filter((img: GalleryImage) => {
        if (effectiveMode === 'default') return true;
        // Convert effective mode to match bucket folder structure
        const folderName = effectiveMode === 'realestate' ? 'real-estate' : effectiveMode;
        if (!img.name.startsWith(`${folderName}/`)) return false;
        // Exclude nested subfolders: ensure only one slash in the path
        const pathAfter = img.name.slice(folderName.length + 1);
        const isRootLevel = !pathAfter.includes('/');
        console.log(`Filtering: Image ${img.name} in "${folderName}" root-level:`, isRootLevel);
        return isRootLevel;
      });
      
      console.log('Final filtered images:', filteredImages.map(img => ({
        name: img.name,
        url: img.url
      })));
      
      console.log('Final image count being set to state:', filteredImages.length);
      console.log('Sample of first few images being rendered:', filteredImages.slice(0, 3));
      console.log('==== END DEBUG ====');
      
      setImages(filteredImages);
    } catch (err) {
      setError('Failed to load images. Please try again.');
      console.error('Error loading images:', err);
    } finally {
      setLoading(false);
    }
  }, [mode]);

  useEffect(() => {
    loadImages();
  }, [loadImages]); // Now correctly depends on loadImages
  
  useEffect(() => {
    const updateColumns = () => {
      const width = window.innerWidth;
      if (width < 640) setColumns(1);
      else if (width < 768) setColumns(2);
      else if (width < 1024) setColumns(3);
      else setColumns(4);
    };
    
    updateColumns();
    window.addEventListener('resize', updateColumns);
    return () => window.removeEventListener('resize', updateColumns);
  }, []);

  // Modal handlers
  const openModal = useCallback((index: number) => {
    setModalImageIndex(index);
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  // Calculate rows for virtualization
  const rows = Math.ceil(images.length / columns);
  
  const virtualizer = useVirtualizer({
    count: rows,
    getScrollElement: () => document.scrollingElement,
    estimateSize: () => 300,
    overscan: 5,
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-8rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-900 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-[calc(100vh-8rem)] space-y-4">
        <p className="text-red-600">{error}</p>
        <button
          onClick={loadImages}
          className="px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-800 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  // Get the appropriate grid columns class based on the current column count
  const gridColsClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
  }[columns];

  return (
    <>
      <div
        className="relative w-full"
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          contain: 'strict',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const startIndex = virtualRow.index * columns;
          const rowImages = images.slice(startIndex, startIndex + columns);

          return (
            <div
              key={virtualRow.key}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '300px',
                transform: `translateY(${virtualRow.start}px)`,
              }}
              className={`grid ${gridColsClass} gap-6`}
            >
              {rowImages.map((image, imageIndex) => {
                const globalIndex = startIndex + imageIndex;
                return (
                  <div
                    key={image.key}
                    className="relative aspect-square overflow-hidden rounded-lg bg-gray-100 cursor-pointer group"
                    onClick={() => openModal(globalIndex)}
                  >
                    <Image
                      src={image.thumbnailUrl}
                      alt={`Gallery image ${image.name}`}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      priority={virtualRow.index < 2} // Prioritize loading first 2 rows
                      quality={75}
                    />
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                      <div className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Image Modal */}
      <ImageModal
        isOpen={isModalOpen}
        onClose={closeModal}
        images={images}
        initialIndex={modalImageIndex}
      />
    </>
  );
} 
