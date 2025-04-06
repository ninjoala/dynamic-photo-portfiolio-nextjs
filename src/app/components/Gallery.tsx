import React from 'react';
import { ClientGallery } from './ClientGallery';
import fs from 'fs';
import path from 'path';

// Type for image data
interface ImageData {
  images: Array<{
    key: string;
    name: string;
    url: string;
    thumbnailUrl: string;
  }>;
  lastUpdated?: string;
  error?: string;
}

// Default empty data
const emptyData: ImageData = { images: [], lastUpdated: new Date().toISOString() };

// Get image data from the file or return empty data if it doesn't exist
function getImageData(): ImageData {
  try {
    const filePath = path.join(process.cwd(), 'src/data/images.json');
    
    if (fs.existsSync(filePath)) {
      const fileContents = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(fileContents) as ImageData;
    }
    else {
      return {
        images: [],
        lastUpdated: new Date().toISOString(),
        error: 'images.json does not exist'
      };
    }
  } catch (error) {
    console.warn('Error reading images.json:', error);
    return {
      images: [],
      lastUpdated: new Date().toISOString(),
      error: 'Error reading images.json' + error
    };
  }
  
  return emptyData;
}

export default function Gallery() {
  // Get image data server-side
  const imageData = getImageData();
  
  if (imageData.images.length === 0) {
    return <div>No images found {imageData.error}</div>
  }
  return (
    <div className="container mx-auto px-4 py-8">
      <ClientGallery initialImages={imageData.images} />
    </div>
  );
} 