interface ImgixParams {
  width?: number;
  height?: number;
  quality?: number;
  fit?: string;
  crop?: string;
}

export function createImgixUrl(filename: string, params: ImgixParams = {}): string {
  const baseUrl = 'https://wasabindmdemo.imgix.net';
  const defaultParams = {
    fit: 'crop',
    crop: 'entropy',
    q: 80,
    fm: 'webp'
  };

  // Combine default and custom parameters
  const allParams = {
    ...defaultParams,
    ...params
  };

  // Build query string
  const queryString = Object.entries(allParams)
    .map(([key, value]) => `${key}=${value}`)
    .join('&');

  // Ensure filename starts with a forward slash
  const normalizedFilename = filename.startsWith('/') ? filename : `/${filename}`;

  return `${baseUrl}${normalizedFilename}?${queryString}`;
} 
