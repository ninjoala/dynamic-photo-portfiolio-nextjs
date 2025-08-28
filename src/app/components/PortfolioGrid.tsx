'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Card, CardContent } from '../../../components/ui/card';
import { AspectRatio } from '../../../components/ui/aspect-ratio';
import { Skeleton } from '../../../components/ui/skeleton';
import { fetchImageData } from '../../utils/fetchImageData';
import { generateImageAltText } from '../../utils/altTextGenerator';

interface GalleryImage {
  key: string;
  name: string;
  url: string;
  thumbnailUrl: string;
}

interface PortfolioGridProps {
  onImageClick: (index: number) => void;
}

export default function PortfolioGrid({ onImageClick }: PortfolioGridProps) {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageLoadingStates, setImageLoadingStates] = useState<Record<string, boolean>>({});

  // Load images from images.json
  const loadImages = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await fetchImageData('default');
      
      console.log('==== DEBUG: Image Loading ====');
      console.log('Raw data from images.json:', data);
      console.log('Total images loaded:', data.images.length);
      console.log('==== END DEBUG ====');
      
      setImages(data.images);
      
      // Initialize loading states for all images
      const initialLoadingStates: Record<string, boolean> = {};
      data.images.forEach((img: GalleryImage) => {
        initialLoadingStates[img.key] = true;
      });
      setImageLoadingStates(initialLoadingStates);
      
    } catch (err) {
      setError('Failed to load images. Please try again.');
      console.error('Error loading images:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadImages();
  }, [loadImages]);

  const handleImageLoad = useCallback((imageKey: string) => {
    setImageLoadingStates(prev => ({
      ...prev,
      [imageKey]: false
    }));
  }, []);

  const handleImageClick = useCallback((index: number) => {
    onImageClick(index);
  }, [onImageClick]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {Array.from({ length: 12 }).map((_, index) => (
          <Card key={index} className="overflow-hidden">
            <CardContent className="p-0">
              <AspectRatio ratio={1}>
                <Skeleton className="w-full h-full" />
              </AspectRatio>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-64 space-y-4">
        <p className="text-destructive text-center">{error}</p>
        <button
          onClick={loadImages}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {images.map((image, index) => (
        <Card 
          key={image.key} 
          className="overflow-hidden cursor-pointer group transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
          onClick={() => handleImageClick(index)}
        >
          <CardContent className="p-0 relative overflow-hidden bg-gray-100">
            <AspectRatio ratio={1}>
              <Image
                src={image.thumbnailUrl}
                alt={generateImageAltText(image.name, 'default', index)}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className={`object-cover transition-opacity duration-300 group-hover:scale-105 ${
                  imageLoadingStates[image.key] ? 'opacity-30' : 'opacity-100'
                }`}
                onLoad={() => handleImageLoad(image.key)}
                onError={() => handleImageLoad(image.key)}
                quality={75}
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkrHB0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+Kk="
              />
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                <div className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                  </svg>
                </div>
              </div>
            </AspectRatio>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}