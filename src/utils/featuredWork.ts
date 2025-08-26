import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { createImgixUrl } from './imgix';

// Initialize Wasabi S3 client using environment variables
const s3Client = new S3Client({
  region: process.env.WASABI_REGION,
  endpoint: process.env.WASABI_ENDPOINT,
  forcePathStyle: true, // Use path-style URLs instead of virtual hosted-style
  credentials: {
    accessKeyId: process.env.WASABI_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.WASABI_SECRET_ACCESS_KEY || ''
  }
});

/**
 * Fetch the first `limit` images from the S3 featured-work folder and return Imgix URLs.
 */
export async function getFeaturedWorkUrls(
  bucketFolder: string,
  limit: number = 3
): Promise<string[]> {
  const prefix = `${bucketFolder}/featured-work/`;
  const command = new ListObjectsV2Command({
    Bucket: process.env.WASABI_BUCKET_NAME,
    Prefix: prefix
  });
  const response = await s3Client.send(command);

  const keys = response.Contents
    ? response.Contents
        .map(obj => obj.Key || '')
        .filter(key => key && /\.(jpe?g|png|gif|webp)$/i.test(key))
    : [];

  // Take the first `limit` images
  const selected = keys.slice(0, limit);

  // Map to Imgix URLs
  return selected.map(key =>
    createImgixUrl(key, {
      width: 800,
      height: 800,
      quality: 80,
      fit: 'crop',
      crop: 'entropy'
    })
  );
} 