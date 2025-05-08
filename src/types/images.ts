export interface ImageData {
  images: Array<{
    key: string;
    name: string;
    url: string;
    thumbnailUrl: string;
  }>;
  lastUpdated: string;
} 