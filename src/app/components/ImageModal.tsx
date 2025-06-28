'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Dialog, DialogPanel } from '@headlessui/react';
import Image from 'next/image';
import { createImgixUrl } from '../../utils/imgix';

interface GalleryImage {
  key: string;
  name: string;
  url: string;
  thumbnailUrl: string;
}

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: GalleryImage[];
  initialIndex: number;
}

interface PreloadedImage {
  src: string;
  loaded: boolean;
  element?: HTMLImageElement;
}

export default function ImageModal({ isOpen, onClose, images, initialIndex }: ImageModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isLoading, setIsLoading] = useState(true);
  const [preloadedImages, setPreloadedImages] = useState<Map<number, PreloadedImage>>(new Map());
  const preloadQueueRef = useRef<Set<number>>(new Set());
  
  // Touch/swipe state
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Reset when modal opens with new image
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      setIsLoading(true);
      setPreloadedImages(new Map());
      preloadQueueRef.current.clear();
    }
  }, [isOpen, initialIndex]);


  // Aggressive preloading strategy
  useEffect(() => {
    if (!isOpen || images.length === 0) return;

    const preloadImage = (index: number, priority: 'high' | 'low' = 'low') => {
      if (index < 0 || index >= images.length) return;
      if (preloadQueueRef.current.has(index)) return;
      
      // Check if already preloaded
      setPreloadedImages(prev => {
        if (prev.has(index)) return prev;
        
        preloadQueueRef.current.add(index);
        const image = images[index];
        const imgixUrl = new URL(image.url);
        const imagePath = imgixUrl.pathname;
        const fullUrl = createImgixUrl(imagePath, { width: 1920, quality: 95, fit: 'max' });
        
        const img = new window.Image();
        if (priority === 'high') {
          img.fetchPriority = 'high';
        }
        
        img.onload = () => {
          setPreloadedImages(prevState => {
            const newMap = new Map(prevState);
            newMap.set(index, { src: fullUrl, loaded: true, element: img });
            return newMap;
          });
          preloadQueueRef.current.delete(index);
        };
        img.onerror = () => {
          preloadQueueRef.current.delete(index);
        };
        
        img.src = fullUrl;
        return prev;
      });
    };

    // Immediate preloading strategy
    preloadImage(currentIndex, 'high'); // Current image
    preloadImage(currentIndex + 1, 'high'); // Next image (most important)
    preloadImage(currentIndex - 1, 'high'); // Previous image
    
    // Secondary preloading (lower priority)
    setTimeout(() => {
      preloadImage(currentIndex + 2);
      preloadImage(currentIndex - 2);
      preloadImage(currentIndex + 3);
      preloadImage(currentIndex - 3);
    }, 50);

    // Cleanup old preloads after a delay
    const cleanup = setTimeout(() => {
      setPreloadedImages(prev => {
        const newMap = new Map();
        const range = 7; // Keep more images in memory for better performance
        for (let i = Math.max(0, currentIndex - range); i <= Math.min(images.length - 1, currentIndex + range); i++) {
          if (prev.has(i)) {
            newMap.set(i, prev.get(i)!);
          }
        }
        return newMap;
      });
    }, 200);

    return () => clearTimeout(cleanup);
  }, [currentIndex, isOpen, images.length]);

  // Navigation functions
  const goToPrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  }, [currentIndex]);

  const goToNext = useCallback(() => {
    if (currentIndex < images.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  }, [currentIndex, images.length]);

  // Touch/swipe handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      goToNext();
    } else if (isRightSwipe) {
      goToPrevious();
    }
    
    setTouchStart(null);
    setTouchEnd(null);
  }, [touchStart, touchEnd, goToNext, goToPrevious]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          goToPrevious();
          break;
        case 'ArrowRight':
          event.preventDefault();
          goToNext();
          break;
        case 'Escape':
          event.preventDefault();
          onClose();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, goToPrevious, goToNext, onClose]);

  // Handle image load completion
  const handleImageLoad = useCallback(() => {
    setIsLoading(false);
  }, []);

  const handleImageError = useCallback(() => {
    setIsLoading(false);
  }, []);

  // Reset loading when currentIndex changes
  useEffect(() => {
    if (isOpen) {
      const preloadedImage = preloadedImages.get(currentIndex);
      if (preloadedImage?.loaded) {
        // Image is already preloaded, no loading needed
        setIsLoading(false);
      } else {
        // Image not preloaded yet, show loading
        setIsLoading(true);
        // Fallback to clear loading after 2 seconds
        const timeout = setTimeout(() => {
          setIsLoading(false);
        }, 2000);
        return () => clearTimeout(timeout);
      }
    }
  }, [currentIndex, isOpen, preloadedImages]);

  if (!isOpen || images.length === 0) return null;

  const currentImage = images[currentIndex];
  // Extract just the path from the imgix URL (everything after the domain)
  const imgixUrl = new URL(currentImage.url);
  const imagePath = imgixUrl.pathname; // e.g., "/real-estate/5J8A7756.jpg"
  const previewUrl = createImgixUrl(imagePath, { width: 800, quality: 85, fit: 'max' });
  const fullUrl = createImgixUrl(imagePath, { width: 1920, quality: 95, fit: 'max' });
  const preloadedImage = preloadedImages.get(currentIndex);
  
  // Use preloaded full quality if available, otherwise use preview
  const displayUrl = preloadedImage?.loaded ? fullUrl : previewUrl;

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/80" aria-hidden="true" />

      {/* Modal container */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="relative max-w-7xl max-h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between text-white mb-4">
            <div className="text-sm">
              {currentIndex + 1} of {images.length}
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-300 transition-colors p-2"
              aria-label="Close modal"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Image container */}
          <div 
            className="relative flex-1 flex items-center justify-center touch-pan-y"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Loading indicator */}
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div>
              </div>
            )}

            {/* Main image */}
            <div className="relative max-w-full max-h-[80vh]">
              <Image
                key={`${currentIndex}-${displayUrl}`}
                src={displayUrl}
                alt={`Gallery image ${currentImage.name}`}
                width={1920}
                height={1080}
                className="max-w-full max-h-full object-contain"
                onLoad={handleImageLoad}
                onError={handleImageError}
                priority
                quality={preloadedImage?.loaded ? 95 : 85}
              />
            </div>

            {/* Navigation arrows */}
            {currentIndex > 0 && (
              <button
                onClick={goToPrevious}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors p-2 rounded-full bg-black/20 hover:bg-black/40"
                aria-label="Previous image"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}

            {currentIndex < images.length - 1 && (
              <button
                onClick={goToNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors p-2 rounded-full bg-black/20 hover:bg-black/40"
                aria-label="Next image"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}