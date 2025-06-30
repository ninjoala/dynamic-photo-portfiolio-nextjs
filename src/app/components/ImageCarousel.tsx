'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { AspectRatio } from '../../../components/ui/aspect-ratio';
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious,
  type CarouselApi 
} from '../../../components/ui/carousel';
import { createImgixUrl } from '../../utils/imgix';
import { generateImageAltText } from '../../utils/altTextGenerator';

interface GalleryImage {
  key: string;
  name: string;
  url: string;
  thumbnailUrl: string;
}

interface ImageCarouselProps {
  isOpen: boolean;
  onClose: () => void;
  images: GalleryImage[];
  initialIndex: number;
  mode: string;
}

interface PreloadedImage {
  src: string;
  loaded: boolean;
  element?: HTMLImageElement;
}

export default function ImageCarousel({ isOpen, onClose, images, initialIndex, mode }: ImageCarouselProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(initialIndex);
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [preloadedImages, setPreloadedImages] = useState<Map<number, PreloadedImage>>(new Map());
  const preloadQueueRef = useRef<Set<number>>(new Set());

  // Reset when modal opens
  useEffect(() => {
    if (isOpen && api) {
      api.scrollTo(initialIndex, true);
      setCurrent(initialIndex);
      setIsLoading(true);
    }
  }, [isOpen, initialIndex, api]);

  // Set up carousel API
  useEffect(() => {
    if (!api) return;

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
      setIsLoading(true);
    });
  }, [api]);

  // Generate optimized image URLs
  const getImageUrls = useCallback((image: GalleryImage) => {
    const imgixUrl = new URL(image.url);
    const imagePath = imgixUrl.pathname;
    return {
      preview: createImgixUrl(imagePath, { width: 800, quality: 85, fit: 'max' }),
      full: createImgixUrl(imagePath, { width: 1920, quality: 95, fit: 'max' })
    };
  }, []);

  // Aggressive preloading strategy
  useEffect(() => {
    if (!isOpen || images.length === 0) return;

    const preloadImage = (index: number, priority: 'high' | 'low' = 'low') => {
      if (index < 0 || index >= images.length) return;
      if (preloadQueueRef.current.has(index)) return;
      
      preloadQueueRef.current.add(index);
      const image = images[index];
      const { full } = getImageUrls(image);
      
      const img = new window.Image();
      if (priority === 'high') {
        img.fetchPriority = 'high';
      }
      
      img.onload = () => {
        setPreloadedImages(prevState => {
          const newMap = new Map(prevState);
          newMap.set(index, { src: full, loaded: true, element: img });
          return newMap;
        });
        preloadQueueRef.current.delete(index);
      };
      img.onerror = () => {
        preloadQueueRef.current.delete(index);
      };
      
      img.src = full;
    };

    // Immediate preloading strategy
    preloadImage(current, 'high'); // Current image
    preloadImage(current + 1, 'high'); // Next image (most important)
    preloadImage(current - 1, 'high'); // Previous image
    
    // Secondary preloading (lower priority)
    setTimeout(() => {
      preloadImage(current + 2);
      preloadImage(current - 2);
      preloadImage(current + 3);
      preloadImage(current - 3);
    }, 50);

    // Cleanup old preloads
    const cleanup = setTimeout(() => {
      setPreloadedImages(prev => {
        const newMap = new Map();
        const range = 7;
        for (let i = Math.max(0, current - range); i <= Math.min(images.length - 1, current + range); i++) {
          if (prev.has(i)) {
            newMap.set(i, prev.get(i)!);
          }
        }
        return newMap;
      });
    }, 200);

    return () => clearTimeout(cleanup);
  }, [current, isOpen, images, getImageUrls]);

  // Reset loading when current image changes
  useEffect(() => {
    if (isOpen) {
      const preloadedImage = preloadedImages.get(current);
      if (preloadedImage?.loaded) {
        setIsLoading(false);
      } else {
        setIsLoading(true);
        const timeout = setTimeout(() => {
          setIsLoading(false);
        }, 2000);
        return () => clearTimeout(timeout);
      }
    }
  }, [current, isOpen, preloadedImages]);

  // Handle image load completion
  const handleImageLoad = useCallback(() => {
    setIsLoading(false);
  }, []);

  const handleImageError = useCallback(() => {
    setIsLoading(false);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          api?.scrollPrev();
          break;
        case 'ArrowRight':
          event.preventDefault();
          api?.scrollNext();
          break;
        case 'Escape':
          event.preventDefault();
          onClose();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, api, onClose]);

  if (!isOpen || images.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
      <div className="relative w-full h-full max-w-7xl max-h-full flex flex-col p-4">
        {/* Header */}
        <div className="flex items-center justify-between text-white mb-4 z-10">
          <div className="text-sm">
            {current + 1} of {count}
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-300 transition-colors p-2 rounded-full hover:bg-white/20"
            aria-label="Close carousel"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Carousel */}
        <div className="flex-1 flex items-center justify-center">
          <Carousel 
            setApi={setApi}
            className="w-full max-w-5xl"
            opts={{
              align: "center",
              loop: true,
            }}
          >
            <CarouselContent>
              {images.map((image, index) => {
                const { preview, full } = getImageUrls(image);
                const preloadedImage = preloadedImages.get(index);
                const displayUrl = preloadedImage?.loaded ? full : preview;
                const isCurrentImage = index === current;

                return (
                  <CarouselItem key={image.key} className="flex items-center justify-center">
                    <div className="relative w-full max-w-4xl max-h-[80vh]">
                      {/* Loading indicator */}
                      {isLoading && isCurrentImage && (
                        <div className="absolute inset-0 flex items-center justify-center z-20">
                          <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div>
                        </div>
                      )}

                      {/* Main image */}
                      <AspectRatio ratio={16/9} className="w-full">
                        <Image
                          key={`${index}-${displayUrl}`}
                          src={displayUrl}
                          alt={generateImageAltText(image.name, mode, index)}
                          fill
                          className="object-contain"
                          onLoad={handleImageLoad}
                          onError={handleImageError}
                          priority={Math.abs(index - current) <= 1}
                          quality={preloadedImage?.loaded ? 95 : 85}
                        />
                      </AspectRatio>
                    </div>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
            
            {/* Navigation buttons */}
            <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/20 border-white/20 text-white hover:bg-black/40 hover:text-white" />
            <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/20 border-white/20 text-white hover:bg-black/40 hover:text-white" />
          </Carousel>
        </div>
      </div>

      {/* Backdrop click to close */}
      <div 
        className="absolute inset-0 -z-10" 
        onClick={onClose}
        aria-label="Close carousel"
      />
    </div>
  );
}