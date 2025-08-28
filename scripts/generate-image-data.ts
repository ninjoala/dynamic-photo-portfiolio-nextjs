import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { S3Client, ListObjectsV2Command, _Object } from "@aws-sdk/client-s3";
import fs from 'fs';
import path from 'path';
import { createImgixUrl } from '../src/utils/imgix';

const s3Client = new S3Client({
  region: process.env.WASABI_REGION || 'us-east-1',
  endpoint: process.env.WASABI_ENDPOINT || 'https://s3.wasabisys.com',
  forcePathStyle: true, // Use path-style URLs instead of virtual hosted-style
  credentials: {
    accessKeyId: process.env.WASABI_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.WASABI_SECRET_ACCESS_KEY || ''
  }
});

interface ImageData {
  images: Array<{
    key: string;
    name: string;
    url: string;
    thumbnailUrl: string;
  }>;
  lastUpdated: string;
}

async function generateImageData(): Promise<ImageData> {
  try {
    // List all objects in the entire bucket
    const command = new ListObjectsV2Command({
      Bucket: process.env.WASABI_BUCKET_NAME,
    });

    const response = await s3Client.send(command);
    
    if (!response.Contents) {
      console.warn(`No contents found in bucket: ${process.env.WASABI_BUCKET_NAME}`);
      return { images: [], lastUpdated: new Date().toISOString() };
    }

    // Generate URLs for each image
    const images = response.Contents
      .filter((obj: _Object) => obj.Key && /\.(jpg|jpeg|png|gif|webp)$/i.test(obj.Key))
      .map((obj: _Object, index: number) => {
        const filename = obj.Key as string;
        return {
          key: `image_${index}`,
          name: filename,
          // Full size image
          url: createImgixUrl(filename),
          // Thumbnail with smaller dimensions and higher compression
          thumbnailUrl: createImgixUrl(filename, {
            width: 400,
            height: 400,
            quality: 60
          })
        };
      });

    const data = {
      images,
      lastUpdated: new Date().toISOString()
    };

    // Write to JSON file
    const outputDir = path.join(process.cwd(), 'public/data');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputPath = path.join(outputDir, 'images.json');
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
    
    console.log(`Generated image data: ${images.length} images found in bucket.`);
    return data;
  } catch (error) {
    console.error('Failed to generate image data:', error);
    // Create empty file on error to prevent build failure
    const outputDir = path.join(process.cwd(), 'public/data');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    const emptyData = { images: [], lastUpdated: new Date().toISOString() };
    fs.writeFileSync(
      path.join(outputDir, 'images.json'),
      JSON.stringify(emptyData, null, 2)
    );
    throw error;
  }
}

async function main() {
  try {
    await generateImageData();
  } catch (error) {
    console.error('Error in main:', error);
    process.exit(1);
  }
}

main();