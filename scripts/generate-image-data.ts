import { UTApi } from "uploadthing/server";
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Check if we're in production environment
const isProduction = process.env.NODE_ENV === 'production';

if (!process.env.UPLOADTHING_TOKEN) {
  if (isProduction) {
    console.warn('⚠️ UPLOADTHING_TOKEN is not set, but continuing in production environment with empty data');
    
    // Create an empty images.json file
    const outputPath = path.join(process.cwd(), 'src/data/images.json');
    
    // Ensure the directory exists
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    
    // Write empty data
    fs.writeFileSync(
      outputPath,
      JSON.stringify({ images: [], lastUpdated: new Date().toISOString() }, null, 2)
    );
    
    console.log('✅ Empty image data generated for production');
    process.exit(0);
  } else {
    //console.error('❌ UPLOADTHING_TOKEN is not set in .env file');
    //process.exit(1);
  }
}

const utapi = new UTApi({
  token: process.env.UPLOADTHING_TOKEN,
  fetch: fetch
});

async function generateImageData() {
  try {
    const response = await utapi.listFiles();
    const images = response.files.map(file => {
      const baseUrl = `https://utfs.io/f/${file.key}`;
      return {
        key: file.key,
        name: file.name,
        url: baseUrl,
        thumbnailUrl: `${baseUrl}?w=400&quality=75`
      };
    });

    const outputPath = path.join(process.cwd(), 'src/data/images.json');
    
    // Ensure the directory exists
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    
    // Write the data
    fs.writeFileSync(
      outputPath,
      JSON.stringify({ images, lastUpdated: new Date().toISOString() }, null, 2)
    );

    console.log('✅ Image data generated successfully');
  } catch (error) {
    console.error('❌ Error generating image data:', error);
    process.exit(1);
  }
}

generateImageData(); 