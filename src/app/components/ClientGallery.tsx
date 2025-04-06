'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Dialog } from '@headlessui/react';

interface GalleryImage {
  key: string;
  name: string;
  url: string;
  thumbnailUrl: string;
  width?: number;
  height?: number;
}

interface ClientGalleryProps {
  initialImages: GalleryImage[];
}

interface ImageLoadMetrics {
  url: string;
  startTime: number;
  loadTime?: number;
  batchNumber: number;
  requestStartTime: number;
  loadStartTime: number;
  reported: boolean;
}

export function ClientGallery({ initialImages }: ClientGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(-1);
  const [visibleImages, setVisibleImages] = useState<GalleryImage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const currentPage = useRef(1);
  const loaderRef = useRef(null);
  const IMAGES_PER_PAGE = 12;
  const metricsRef = useRef<Map<string, ImageLoadMetrics>>(new Map());
  const [metrics, setMetrics] = useState<string[]>([]);
  const batchStartTimeRef = useRef<number>(0);
  const preloadedImages = useRef<Set<string>>(new Set());
  
  // Preload the full-size version of recently viewed thumbnails
  const preloadFullSizeImage = (imageUrl: string) => {
    if (preloadedImages.current.has(imageUrl)) return;
    
    preloadedImages.current.add(imageUrl);
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = imageUrl;
    document.head.appendChild(link);
  };

  // Handle navigation between images
  const navigateImage = (direction: 'prev' | 'next') => {
    const currentIndex = selectedImageIndex;
    let newIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    
    // Handle wrapping
    if (newIndex < 0) {
      newIndex = visibleImages.length - 1;
    } else if (newIndex >= visibleImages.length) {
      newIndex = 0;
    }
    
    const newImage = visibleImages[newIndex];
    if (newImage?.url) {
      setSelectedImageIndex(newIndex);
      setIsLoading(true);
      setSelectedImage(newImage.url);
      
      // Preload the next image in the sequence
      const nextIndex = direction === 'next' ? newIndex + 1 : newIndex - 1;
      const nextImage = visibleImages[nextIndex];
      if (nextImage?.url) {
        preloadFullSizeImage(nextImage.url);
      }
    }
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedImage) {
        if (e.key === 'ArrowLeft') {
          navigateImage('prev');
        } else if (e.key === 'ArrowRight') {
          navigateImage('next');
        } else if (e.key === 'Escape') {
          setSelectedImage(null);
          setSelectedImageIndex(-1);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImage, visibleImages]);

  // Handle thumbnail click with preloading
  const handleThumbnailClick = (image: GalleryImage) => {
    if (!image.url) return;
    
    const index = visibleImages.findIndex(img => img.key === image.key);
    setSelectedImageIndex(index);
    setIsLoading(true);
    setSelectedImage(image.url);
    
    // Fallback to hide loading spinner after a timeout
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    
    // Preload next few images in the batch
    const nextImages = visibleImages.slice(index + 1, index + 4);
    nextImages.forEach(img => img.url && preloadFullSizeImage(img.url));
  };

  // Track image load complete
  const handleImageLoad = (url: string) => {
    if (url === selectedImage) {
      setIsLoading(false);
    }
    
    const metric = metricsRef.current.get(url);
    if (metric && !metric.reported) {  // Only report each image once
      metric.loadTime = performance.now() - metric.loadStartTime;
      metric.reported = true;  // Mark as reported
      
      // Get cache status from performance entry
      const entry = performance.getEntriesByName(url, 'resource')[0] as PerformanceResourceTiming;
      const cacheStatus = entry?.transferSize === 0 ? 'CACHED' : 'NETWORK';
      
      metricsRef.current.set(url, metric);
      
      const newMetric = `BATCH ${metric.batchNumber}
Total time: ${metric.loadTime + (metric.loadStartTime - metric.requestStartTime)}ms
Load delay: ${(metric.loadStartTime - metric.requestStartTime).toFixed(2)}ms
Load time: ${metric.loadTime?.toFixed(2)}ms
Cache: ${cacheStatus}
URL: ${url.split('?')[0]}
----------------------------------------`;

      setMetrics(prev => [...prev, newMetric]);
      console.log(newMetric);
    }
  };

  // Track image load start
  const handleImageLoadStart = (url: string) => {
    if (!metricsRef.current.has(url)) {  // Only track first load attempt
      const now = performance.now();
      metricsRef.current.set(url, {
        url,
        startTime: now,
        batchNumber: currentPage.current,
        requestStartTime: batchStartTimeRef.current,
        loadStartTime: now,
        loadTime: undefined,
        reported: false
      });
    }
  };

  useEffect(() => {
    // Load initial batch
    batchStartTimeRef.current = performance.now();
    setVisibleImages(initialImages.slice(0, IMAGES_PER_PAGE));
    console.log('Initial batch request started:', new Date().toISOString());
    
    // Preload first few full-size images
    initialImages.slice(0, 4).forEach(img => {
      if (img.url) preloadFullSizeImage(img.url);
    });
  }, [initialImages]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting) {
          batchStartTimeRef.current = performance.now();
          console.log(`Batch ${currentPage.current + 1} request started:`, new Date().toISOString());
          const nextBatch = initialImages.slice(
            currentPage.current * IMAGES_PER_PAGE,
            (currentPage.current + 1) * IMAGES_PER_PAGE
          );
          if (nextBatch.length > 0) {
            setVisibleImages(prev => [...prev, ...nextBatch]);
            currentPage.current += 1;
          }
        }
      },
      { threshold: 0.1 }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [initialImages]);

  return (
    <div>
      {/* Performance Metrics Display */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed top-4 right-4 bg-black/80 text-white p-4 rounded-lg z-50 max-w-md overflow-auto max-h-96">
          <h3 className="font-bold mb-2">Loading Metrics:</h3>
          {metrics.map((metric, i) => (
            <div key={i} className="text-sm mb-1 whitespace-pre-wrap font-mono">{metric}</div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {visibleImages.map((image, index) => (
          image.thumbnailUrl && (
            <div
              key={image.key}
              className="relative aspect-square cursor-pointer overflow-hidden rounded-lg"
              onClick={() => handleThumbnailClick(image)}
              onMouseEnter={() => image.url && preloadFullSizeImage(image.url)}
            >
              <Image
                src={image.thumbnailUrl}
                alt={image.name}
                fill
                className="object-cover transition-transform duration-300 hover:scale-110"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                loading={index < 8 ? "eager" : "lazy"}
                quality={75}
                onLoad={() => {
                  console.log(`Image load started: ${image.thumbnailUrl}`);
                  handleImageLoadStart(image.thumbnailUrl);
                  handleImageLoad(image.thumbnailUrl);
                }}
              />
            </div>
          )
        ))}
      </div>

      {/* Loader reference element */}
      {visibleImages.length < initialImages.length && (
        <div ref={loaderRef} className="h-10 w-full" />
      )}

      <Dialog
        open={selectedImage !== null}
        onClose={() => {
          setSelectedImage(null);
          setSelectedImageIndex(-1);
        }}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/70" aria-hidden="true" />
        
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="relative w-full h-full max-w-[90vw] max-h-[90vh]">
            {/* Navigation Arrows */}
            <button
              onClick={() => navigateImage('prev')}
              className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-3 text-gray-800 hover:bg-white transition-colors z-20"
              aria-label="Previous image"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
            
            <button
              onClick={() => navigateImage('next')}
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-3 text-gray-800 hover:bg-white transition-colors z-20"
              aria-label="Next image"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>

            {selectedImage && (
              <div className="relative w-full h-full min-h-[50vh]">
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center z-10">
                    <div className="h-16 w-16 rounded-full border-4 border-t-transparent border-white animate-spin"></div>
                  </div>
                )}
                <div className="relative w-full h-full">
                  <Image
                    src={selectedImage}
                    alt="Full size image"
                    fill
                    style={{ objectFit: 'contain' }}
                    sizes="90vw"
                    className="rounded-lg"
                    onClick={(e) => e.stopPropagation()}
                    priority
                    quality={90}
                    onLoad={() => {
                      handleImageLoadStart(selectedImage);
                      handleImageLoad(selectedImage);
                    }}
                    onError={() => setIsLoading(false)}
                  />
                </div>
              </div>
            )}
            <button
              onClick={() => {
                setSelectedImage(null);
                setSelectedImageIndex(-1);
              }}
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