'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useVirtualizer } from '@tanstack/react-virtual';
import { fetchImageData } from '../../utils/fetchImageData';

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
  const parentRef = useRef<HTMLDivElement>(null);
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Calculate the number of columns based on viewport width
  const [columns, setColumns] = useState(3);

  // Load images from images.json
  const loadImages = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchImageData(mode);
      
      console.log('==== DEBUG: Image Loading ====');
      console.log('Current Mode:', mode);
      console.log('Raw data from images.json:', data);
      console.log('All available images:', data.images.map(img => ({
        name: img.name,
        url: img.url
      })));
      
      // Filter images based on mode
      const filteredImages = data.images.filter((img: GalleryImage) => {
        if (mode === 'default') return true;
        
        // Convert mode to match the folder structure format
        const folderName = mode === 'realestate' ? 'real-estate' : mode;
        const matches = img.name.startsWith(`${folderName}/`);
        console.log(`Filtering: Image ${img.name} against folder "${folderName}" -> matches:`, matches);
        return matches;
      });
      
      console.log('Filtered images before duplication:', filteredImages.map(img => ({
        name: img.name,
        url: img.url
      })));
      
      // Duplicate the filtered images 1000 times
      const duplicatedImages = Array.from({ length: 1000 }, (_, i) => 
        filteredImages.map((img: GalleryImage) => ({
          ...img,
          key: `${img.key}_${i}` // Ensure unique keys
        }))
      ).flat();
      
      console.log('Final image count being set to state:', duplicatedImages.length);
      console.log('Sample of first few images being rendered:', duplicatedImages.slice(0, 3));
      console.log('==== END DEBUG ====');
      
      setImages(duplicatedImages);
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

  // Calculate rows for virtualization
  const rows = Math.ceil(images.length / columns);
  
  const virtualizer = useVirtualizer({
    count: rows,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 300, // Estimate row height
    overscan: 5, // Number of rows to render outside of the visible area
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
    <div 
      ref={parentRef}
      className="h-[calc(100vh-8rem)] overflow-auto"
      style={{
        contain: 'strict',
      }}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
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
              className={`grid ${gridColsClass} gap-4 px-4`}
            >
              {rowImages.map((image) => (
                <div
                  key={image.key}
                  className="relative aspect-square overflow-hidden rounded-lg bg-gray-100"
                >
                  <Image
                    src={image.thumbnailUrl}
                    alt={`Gallery image ${image.name}`}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover hover:scale-105 transition-transform duration-300"
                    priority={virtualRow.index < 2} // Prioritize loading first 2 rows
                    quality={75}
                  />
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
} 
