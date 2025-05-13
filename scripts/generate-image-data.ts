import { S3Client, ListObjectsV2Command, _Object } from "@aws-sdk/client-s3";
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { createImgixUrl } from '../src/utils/imgix';
import { photographyCategories } from '../src/app/config';

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
  category: string;
}

async function generateImageDataForCategory(category: string, bucketFolder: string) {
  try {
    // List all objects in the bucket folder
    const command = new ListObjectsV2Command({
      Bucket: process.env.WASABI_BUCKET_NAME,
      Prefix: `${bucketFolder}/` // Only list objects in this folder
    });

    const response = await s3Client.send(command);
    
    if (!response.Contents) {
      console.warn(`No contents found in bucket folder: ${bucketFolder}`);
      return;
    }

    // Generate URLs for each image
    const images = response.Contents
      .filter((obj: _Object) => obj.Key && /\.(jpg|jpeg|png|gif|webp)$/i.test(obj.Key))
      .map((obj: _Object, index: number) => {
        const filename = obj.Key as string;
        return {
          key: `${category}_${index}`,
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
      lastUpdated: new Date().toISOString(),
      category
    };

    // Write to category-specific file in public/data directory
    const outputDir = path.join(process.cwd(), 'public/data');
    fs.mkdirSync(outputDir, { recursive: true });

    const outputPath = path.join(outputDir, `images-${category}.json`);
    fs.writeFileSync(outputPath, JSON.stringify(imageData, null, 2));

    console.log(`Generated image data for ${images.length} images in category: ${category}`);
  } catch (error) {
    console.error(`Failed to generate image data for category ${category}:`, error);
  }
}

async function generateAllImageData() {
  try {
    // Generate data for each photography category
    for (const [categoryId, category] of Object.entries(photographyCategories)) {
      await generateImageDataForCategory(categoryId, category.bucketFolder);
    }
  } catch (error) {
    console.error('Failed to generate all image data:', error);
    process.exit(1);
  }
}

generateAllImageData(); 