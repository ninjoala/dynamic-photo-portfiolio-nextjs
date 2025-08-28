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

export default function PortfolioPage() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [isCarouselOpen, setIsCarouselOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Load images when component mounts
  useEffect(() => {
    const loadImages = async () => {
      try {
        const data = await fetchImageData('default');
        setImages(data.images);
      } catch (err) {
        console.error('Error loading images:', err);
        setImages([]);
      }
    };

    loadImages();
  }, []);

  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index);
    setIsCarouselOpen(true);
  };

  const handleCarouselClose = () => {
    setIsCarouselOpen(false);
  };

  return (
    <>
      <PortfolioGrid onImageClick={handleImageClick} />
      <ImageCarousel
        isOpen={isCarouselOpen}
        onClose={handleCarouselClose}
        images={images}
        initialIndex={selectedImageIndex}
      />
    </>
  );
}