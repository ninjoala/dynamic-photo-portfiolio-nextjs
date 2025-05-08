import { ImageData } from '../types/images';

export async function fetchImageData(): Promise<ImageData> {
  // Add timestamp to bust Turbopack's cache
  const timestamp = Date.now();
  const response = await fetch(`/data/images.json?t=${timestamp}`, {
    cache: 'no-store',
    next: { revalidate: 0 }
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch image data');
  }

  return response.json();
} 