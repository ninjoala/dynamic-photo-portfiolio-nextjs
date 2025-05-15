import { ImageData } from '../types/images';

export async function fetchImageData(mode: string): Promise<ImageData> {
  // Add timestamp to bust Turbopack's cache
  const timestamp = Date.now();
  const fileName = mode === 'default' ? 'images.json' : `images-${mode}.json`;
  const response = await fetch(`/data/${fileName}?t=${timestamp}`, {
    cache: 'no-store',
    next: { revalidate: 0 }
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch image data');
  }

  return response.json();
} 