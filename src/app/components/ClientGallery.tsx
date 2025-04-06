'use client';

import React, { useState, useEffect, useRef } from 'react';
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

interface ImageLoadMetrics {
  url: string;
  startTime: number;
  loadTime?: number;
  batchNumber: number;
  requestStartTime: number;
  loadStartTime: number;
}

export function ClientGallery({ initialImages }: ClientGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [visibleImages, setVisibleImages] = useState<GalleryImage[]>([]);
  const currentPage = useRef(1);
  const loaderRef = useRef(null);
  const IMAGES_PER_PAGE = 12;
  const metricsRef = useRef<Map<string, ImageLoadMetrics>>(new Map());
  const [metrics, setMetrics] = useState<string[]>([]);
  const batchStartTimeRef = useRef<number>(0);

  // Log performance metrics
  const logMetrics = () => {
    const allMetrics = Array.from(metricsRef.current.values());
    const completedLoads = allMetrics.filter(m => m.loadTime);
    
    if (completedLoads.length > 0) {
      // Group by batch number
      const batchGroups = completedLoads.reduce((acc, curr) => {
        if (!acc[curr.batchNumber]) acc[curr.batchNumber] = [];
        acc[curr.batchNumber].push(curr);
        return acc;
      }, {} as Record<number, ImageLoadMetrics[]>);

      // Log metrics for each batch
      Object.entries(batchGroups).forEach(([batchNum, batchMetrics]) => {
        const batchStartTime = Math.min(...batchMetrics.map(m => m.requestStartTime));
        const batchEndTime = Math.max(...batchMetrics.map(m => (m.loadTime || 0) + m.loadStartTime));
        const totalBatchTime = batchEndTime - batchStartTime;

        const avgLoadTime = batchMetrics.reduce((acc, curr) => acc + (curr.loadTime || 0), 0) / batchMetrics.length;
        const maxLoadTime = Math.max(...batchMetrics.map(m => m.loadTime || 0));
        
        const newMetric = `Batch ${batchNum}:
• Total batch time: ${totalBatchTime.toFixed(2)}ms
• Images loaded: ${batchMetrics.length}
• Avg load time: ${avgLoadTime.toFixed(2)}ms
• Max load time: ${maxLoadTime.toFixed(2)}ms
• Individual times:
${batchMetrics.map(m => `  - ${m.url.split('/').pop()}: 
    Request start: ${(m.requestStartTime - batchStartTime).toFixed(2)}ms
    Load start: ${(m.loadStartTime - m.requestStartTime).toFixed(2)}ms
    Load complete: ${m.loadTime?.toFixed(2)}ms`).join('\n')}`;

        setMetrics(prev => [...prev, newMetric]);
        console.log(newMetric);
      });
    }
  };

  // Track image load start
  const handleImageLoadStart = (url: string) => {
    const existingMetric = metricsRef.current.get(url);
    metricsRef.current.set(url, {
      url,
      startTime: performance.now(),
      batchNumber: currentPage.current,
      requestStartTime: batchStartTimeRef.current,
      loadStartTime: performance.now(),
      loadTime: existingMetric?.loadTime
    });
  };

  // Track image load complete
  const handleImageLoadComplete = (url: string) => {
    const metric = metricsRef.current.get(url);
    if (metric) {
      metric.loadTime = performance.now() - metric.loadStartTime;
      metricsRef.current.set(url, metric);
      logMetrics();
    }
  };

  useEffect(() => {
    // Load initial batch
    batchStartTimeRef.current = performance.now();
    setVisibleImages(initialImages.slice(0, IMAGES_PER_PAGE));
    console.log('Initial batch request started:', new Date().toISOString());
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
      <div className="fixed top-4 right-4 bg-black/80 text-white p-4 rounded-lg z-50 max-w-md overflow-auto max-h-96">
        <h3 className="font-bold mb-2">Loading Metrics:</h3>
        {metrics.map((metric, i) => (
          <div key={i} className="text-sm mb-1 whitespace-pre-wrap font-mono">{metric}</div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {visibleImages.map((image, index) => (
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
                loading={index < 8 ? "eager" : "lazy"}
                quality={75}
                onLoad={() => {
                  console.log(`Image load started: ${image.thumbnailUrl}`);
                  handleImageLoadStart(image.thumbnailUrl);
                }}
                onLoadingComplete={(result) => {
                  console.log(`Image complete: ${image.thumbnailUrl}, naturalWidth: ${result.naturalWidth}`);
                  handleImageLoadComplete(image.thumbnailUrl);
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
                priority
                quality={85}
                onLoadingComplete={() => handleImageLoadComplete(selectedImage)}
                onLoadStart={() => handleImageLoadStart(selectedImage)}
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