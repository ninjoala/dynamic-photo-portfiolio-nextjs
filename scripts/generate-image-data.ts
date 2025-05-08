import { S3Client, ListObjectsV2Command, _Object } from "@aws-sdk/client-s3";
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { createImgixUrl } from '../src/utils/imgix';

// Load environment variables from both files
dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local' });

const s3Client = new S3Client({
  region: process.env.WASABI_REGION || 'us-east-1',
  endpoint: process.env.WASABI_ENDPOINT || 'https://s3.wasabisys.com',
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

async function generateImageData() {
  try {
    // List all objects in the bucket
    const command = new ListObjectsV2Command({
      Bucket: process.env.WASABI_BUCKET_NAME,
    });

    const response = await s3Client.send(command);
    
    if (!response.Contents) {
      throw new Error('No contents found in bucket');
    }

    // Generate URLs for each image
    const images = response.Contents
      .filter((obj: _Object) => obj.Key && /\.(jpg|jpeg|png|gif|webp)$/i.test(obj.Key))
      .map((obj: _Object, index: number) => {
        const filename = obj.Key as string;
        return {
          key: `img_${index}`,
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

    const imageData: ImageData = {
      images,
      lastUpdated: new Date().toISOString()
    };

    // Write directly to public/data directory
    const outputDir = path.join(process.cwd(), 'public/data');
    fs.mkdirSync(outputDir, { recursive: true });

    // Write the data
    const outputPath = path.join(outputDir, 'images.json');
    fs.writeFileSync(outputPath, JSON.stringify(imageData, null, 2));

    console.log(`Generated image data for ${images.length} images`);
  } catch (error) {
    console.error('Failed to generate image data:', error);
    process.exit(1);
  }
}

generateImageData(); 