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
  const [imageError, setImageError] = useState(false);
  const currentPage = useRef(1);
  const loaderRef = useRef(null);
  const IMAGES_PER_PAGE = 12;
  const metricsRef = useRef<Map<string, ImageLoadMetrics>>(new Map());
  const batchStartTimeRef = useRef<number>(0);
  const isLoadingBatch = useRef(false);
  // Keep track of already preloaded images - we'll NEVER preload these again
  const alreadyPreloaded = useRef<Set<string>>(new Set());
  
  // Debug logs that will show on screen
  const [perfLogs, setPerfLogs] = useState<Array<{
    timestamp: number,
    action: string,
    message: string,
    duration?: number,
    imageKey?: string
  }>>([]);
  
  // Add a performance log entry with timing
  const logPerf = (action: string, message: string, imageKey?: string, duration?: number) => {
    const timestamp = Date.now();
    setPerfLogs(prev => [
      { timestamp, action, message, imageKey, duration },
      ...prev.slice(0, 19) // Keep only 20 most recent entries
    ]);
  };

  // Preload with strict tracking - only preload each URL once ever
  const preloadFullSizeImage = (imageUrl: string) => {
    if (!imageUrl) return;
    
    // Only preload if we're actually viewing the modal
    if (!selectedImage) return;
    
    // STRICT check - NEVER preload the same URL twice
    if (alreadyPreloaded.current.has(imageUrl)) {
      logPerf('PRELOAD_SKIP', `Already preloaded ${imageUrl.slice(-20)}`);
      return;
    }
    
    const preloadStart = performance.now();
    // Mark as preloaded immediately to prevent any duplicate attempts
    alreadyPreloaded.current.add(imageUrl);
    
    // Clean up ALL previous preload links to prevent memory leaks and warnings
    const existingLinks = document.head.querySelectorAll('link[rel="preload"][as="image"]');
    logPerf('PRELOAD_CLEAN', `Removing ${existingLinks.length} links`);
    existingLinks.forEach(link => {
      link.remove();
    });

    // Create new preload link
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = imageUrl;
    document.head.appendChild(link);
    
    const preloadTime = performance.now() - preloadStart;
    logPerf('PRELOAD_COMPLETE', `Preload complete in ${preloadTime.toFixed(0)}ms`, undefined, preloadTime);
    
    // Always clean up after 5 seconds - we don't need it lingering
    setTimeout(() => {
      link.remove();
      logPerf('PRELOAD_REMOVED', `Removed preload link`);
    }, 5000);
  };

  // Load next batch of images
  const loadNextBatch = async () => {
    if (!isLoadingBatch.current) {
      isLoadingBatch.current = true;
      try {
        const nextBatchNum = currentPage.current + 1;
        const startIdx = currentPage.current * IMAGES_PER_PAGE;
        const endIdx = startIdx + IMAGES_PER_PAGE;
        
        // Check if we have more images to load
        if (startIdx >= initialImages.length) {
          return;
        }
        
        batchStartTimeRef.current = performance.now();
        console.log(`Batch ${nextBatchNum} request started:`, new Date().toISOString());
        
        const nextBatch = initialImages.slice(startIdx, endIdx);
        if (nextBatch.length > 0) {
          // Pre-initialize metrics for the batch
          nextBatch.forEach(img => {
            if (img.thumbnailUrl) {
              handleImageLoadStart(img.thumbnailUrl, nextBatchNum);
            }
          });
          
          setVisibleImages(prev => [...prev, ...nextBatch]);
          currentPage.current = nextBatchNum;
        }
      } finally {
        // Reset loading flag after a short delay to prevent rapid retriggering
        setTimeout(() => {
          isLoadingBatch.current = false;
        }, 500);
      }
    }
  };

  // Check if we need to load more images
  const checkAndLoadMoreImages = () => {
    // If we're within 3 images of the end of our loaded images, load more
    const remainingImages = visibleImages.length - (selectedImageIndex + 1);
    if (remainingImages <= 3 && selectedImageIndex !== -1) {
      loadNextBatch();
    }
  };

  // Handle thumbnail click with optimized loading and detailed timing
  const handleThumbnailClick = (image: GalleryImage) => {
    if (!image.url) return;
    
    const clickTime = performance.now();
    logPerf('CLICK', `Start loading ${image.key}`, image.key);
    
    const index = visibleImages.findIndex(img => img.key === image.key);
    setSelectedImageIndex(index);
    setIsLoading(true);
    setImageError(false);
    
    // Performance optimization: Start loading image before updating state
    const img = new window.Image();
    const loadStartTime = performance.now();
    logPerf('LOAD_START', `Native image load start`, image.key, performance.now() - clickTime);
    
    img.onload = () => {
      // Image has loaded - now we can update the state
      const loadTime = performance.now() - loadStartTime;
      logPerf('LOAD_COMPLETE', `Native image loaded in ${loadTime.toFixed(0)}ms`, image.key, loadTime);
      
      // Check if there was a noticeable delay
      if (loadTime > 100) {
        logPerf('DELAY', `Slow load detected: ${loadTime.toFixed(0)}ms`, image.key, loadTime);
      }
      
      setSelectedImage(image.url);
      setIsLoading(false);
      
      // Track metrics
      handleImageLoadStart(image.url);
      handleImageLoad(image.url);
      
      const totalTime = performance.now() - clickTime;
      logPerf('RENDER_COMPLETE', `Total time: ${totalTime.toFixed(0)}ms`, image.key, totalTime);
    };
    
    img.onerror = () => {
      logPerf('ERROR', `Failed to load image`, image.key);
      setSelectedImage(image.url); // Still set the URL so we can show error state
      setImageError(true);
      setIsLoading(false);
    };
    
    // Set a timeout for slow loads
    const timeoutId = setTimeout(() => {
      if (img.complete) return; // Already loaded
      
      logPerf('SLOW', `Image load taking > 3 seconds`, image.key, 3000);
      // We'll still continue loading but warn user
    }, 3000);
    
    // Start loading
    img.src = image.url;
    logPerf('IMG_SRC_SET', `Set img.src`, image.key, performance.now() - clickTime);
    
    const stateUpdateTime = performance.now() - clickTime;
    logPerf('STATE_UPDATE', `State updated in ${stateUpdateTime.toFixed(0)}ms`, image.key, stateUpdateTime);
    
    // Only preload the next image when actually opening the modal
    const nextImage = visibleImages[index + 1];
    if (nextImage?.url) {
      logPerf('PRELOAD', `Preloading next image ${nextImage.key}`, nextImage.key);
      preloadFullSizeImage(nextImage.url);
    }

    // Check if we need to load more images
    checkAndLoadMoreImages();
    
    // Cleanup timeout
    return () => clearTimeout(timeoutId);
  };

  // Track image load complete with performance
  const handleImageLoad = (url: string) => {
    const now = performance.now();
    
    if (url === selectedImage) {
      setIsLoading(false);
    }
    
    const metric = metricsRef.current.get(url);
    if (metric && !metric.reported) {  // Only report each image once
      metric.loadTime = now - metric.loadStartTime;
      metric.reported = true;
      
      // Get cache status from performance entry
      const entries = performance.getEntriesByName(url, 'resource');
      
      const entry = entries[0] as PerformanceResourceTiming;
      const cacheStatus = entry?.transferSize === 0 ? 'CACHED' : 'NETWORK';
      
      metricsRef.current.set(url, metric);
      
      const newMetric = `BATCH ${metric.batchNumber}
Total time: ${metric.loadTime + (metric.loadStartTime - metric.requestStartTime)}ms
Load delay: ${(metric.loadStartTime - metric.requestStartTime).toFixed(2)}ms
Load time: ${metric.loadTime?.toFixed(2)}ms
Cache: ${cacheStatus}
URL: ${url.split('?')[0]}
----------------------------------------`;

      // Add this to our performance logs instead
      logPerf('METRIC', newMetric, undefined, metric.loadTime);
    }
  };

  // Track image load start
  const handleImageLoadStart = (url: string, batchNum?: number) => {
    if (!metricsRef.current.has(url)) {  // Only track first load attempt
      const now = performance.now();
      metricsRef.current.set(url, {
        url,
        startTime: now,
        batchNumber: batchNum || currentPage.current,
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
    
    // Don't preload any images initially - wait until user opens modal
  }, [initialImages]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      const first = entries[0];
      if (first.isIntersecting) {
        loadNextBatch();
      }
    }, { 
      threshold: 0.1,
      rootMargin: '100px' 
    });

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [initialImages]);

  // Remove mouse hover preloading completely
  const handleMouseEnter = () => {
    // No preloading on hover
  };

  // Update navigation handler to preload next image when navigating 
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedImage) {
        if (e.key === 'ArrowLeft' && selectedImageIndex > 0) {
          const prevImage = visibleImages[selectedImageIndex - 1];
          if (prevImage?.url) {
            handleThumbnailClick(prevImage);
          }
        } else if (e.key === 'ArrowRight' && selectedImageIndex < visibleImages.length - 1) {
          const nextImage = visibleImages[selectedImageIndex + 1];
          if (nextImage?.url) {
            handleThumbnailClick(nextImage);
            
            // Only preload the next image after this one (if available)
            const nextNextImage = visibleImages[selectedImageIndex + 2];
            if (nextNextImage?.url) {
              preloadFullSizeImage(nextNextImage.url);
            }
          }
        } else if (e.key === 'Escape') {
          setSelectedImage(null);
          setSelectedImageIndex(-1);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImage, selectedImageIndex, visibleImages]);

  // Render the selected image with optimizations
  const renderModalImage = () => {
    if (!selectedImage) return null;
    
    return (
      <div className="relative w-full h-full min-h-[50vh]">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="h-16 w-16 rounded-full border-4 border-t-transparent border-white animate-spin"></div>
          </div>
        )}
        {imageError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10 text-white bg-black/50 p-4">
            <p className="text-xl mb-2">Failed to load image</p>
            <p className="text-sm mb-4">The image could not be loaded properly.</p>
            <button 
              className="px-4 py-2 bg-white text-black rounded-md hover:bg-gray-200"
              onClick={(e) => {
                e.stopPropagation();
                // Retry loading the current image
                if (selectedImage) {
                  setIsLoading(true);
                  setImageError(false);
                  const retryImg = new window.Image();
                  retryImg.onload = () => {
                    setIsLoading(false);
                    // Force re-render by temporarily setting to null
                    setSelectedImage(null);
                    setTimeout(() => setSelectedImage(selectedImage), 50);
                  };
                  retryImg.onerror = () => {
                    setIsLoading(false);
                    setImageError(true);
                  };
                  retryImg.src = selectedImage;
                }
              }}
            >
              Retry
            </button>
          </div>
        )}
        <div className="relative w-full h-full">
          {selectedImage && (
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
              onError={() => {
                console.error('Image failed to load:', selectedImage);
                setImageError(true);
                setIsLoading(false);
              }}
            />
          )}
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* Performance Debug Panel */}
      <div className="fixed bottom-4 left-4 bg-black/80 text-white p-4 rounded-lg z-50 max-w-md overflow-auto max-h-96">
        <h3 className="font-bold mb-2">Performance Logs:</h3>
        <div className="space-y-1 text-xs font-mono">
          {perfLogs.map((log, i) => (
            <div key={i} className={`p-1 ${
              log.action.includes('ERROR') || log.action.includes('SLOW') || log.action.includes('DELAY') ? 
                'bg-red-900/50' : 
                log.action.includes('COMPLETE') ? 'bg-green-900/50' : ''
            }`}>
              <span className="text-gray-400">{new Date(log.timestamp).toISOString().split('T')[1].slice(0, -1)}</span>
              {' | '}
              <span className="text-yellow-300 font-bold">{log.action}</span>
              {' | '}
              <span>{log.message}</span>
              {log.duration && <span className="text-cyan-300"> [{log.duration.toFixed(0)}ms]</span>}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {visibleImages.map((image, index) => (
          image.thumbnailUrl && (
            <div
              key={image.key}
              className="relative aspect-square cursor-pointer overflow-hidden rounded-lg"
              onClick={() => handleThumbnailClick(image)}
              onMouseEnter={() => handleMouseEnter()}
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
          setImageError(false);
        }}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/70" aria-hidden="true" />
        
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="relative w-full h-full max-w-[90vw] max-h-[90vh]">
            {/* Navigation Arrows */}
            {selectedImageIndex > 0 && (
              <button
                onClick={() => {
                  const prevImage = visibleImages[selectedImageIndex - 1];
                  if (prevImage?.url) handleThumbnailClick(prevImage);
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-3 text-gray-800 hover:bg-white transition-colors z-20"
                aria-label="Previous image"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
              </button>
            )}
            
            {selectedImageIndex < visibleImages.length - 1 && (
              <button
                onClick={() => {
                  const nextImage = visibleImages[selectedImageIndex + 1];
                  if (nextImage?.url) handleThumbnailClick(nextImage);
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-3 text-gray-800 hover:bg-white transition-colors z-20"
                aria-label="Next image"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            )}

            {renderModalImage()}
            <button
              onClick={() => {
                setSelectedImage(null);
                setSelectedImageIndex(-1);
                setImageError(false);
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