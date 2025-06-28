'use client';

import React, { useState, useEffect } from 'react';
import PortfolioGrid from './PortfolioGrid';
import ImageCarousel from './ImageCarousel';
import { fetchImageData } from '../../utils/fetchImageData';

interface GalleryImage {
  key: string;
  name: string;
  url: string;
  thumbnailUrl: string;
}

interface PortfolioPageProps {
  mode: string;
}

export default function PortfolioPage({ mode }: PortfolioPageProps) {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [isCarouselOpen, setIsCarouselOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Load images when component mounts or mode changes
  useEffect(() => {
    const loadImages = async () => {
      try {
        let data;
        let effectiveMode = mode;
        try {
          data = await fetchImageData(mode);
        } catch (err) {
          console.warn(`Failed to load images for mode "${mode}", falling back to default`, err);
          data = await fetchImageData('default');
          effectiveMode = 'default';
        }
        
        // Filter images to only those in the root of the category folder
        const filteredImages = data.images.filter((img: GalleryImage) => {
          if (effectiveMode === 'default') return true;
          const folderName = effectiveMode === 'realestate' ? 'real-estate' : effectiveMode;
          if (!img.name.startsWith(`${folderName}/`)) return false;
          const pathAfter = img.name.slice(folderName.length + 1);
          return !pathAfter.includes('/');
        });
        
        setImages(filteredImages);
      } catch (err) {
        console.error('Error loading images:', err);
        setImages([]);
      }
    };

    loadImages();
  }, [mode]);

  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index);
    setIsCarouselOpen(true);
  };

  const handleCarouselClose = () => {
    setIsCarouselOpen(false);
  };

  return (
    <>
      <PortfolioGrid mode={mode} onImageClick={handleImageClick} />
      <ImageCarousel
        isOpen={isCarouselOpen}
        onClose={handleCarouselClose}
        images={images}
        initialIndex={selectedImageIndex}
      />
    </>
  );
}