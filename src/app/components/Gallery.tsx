import React from 'react';
import { ClientGallery } from './ClientGallery';
import imageData from '@/data/images.json';

export default function Gallery() {
  return (
    <div className="container mx-auto px-4 py-8">
      <ClientGallery initialImages={imageData.images} />
    </div>
  );
} 