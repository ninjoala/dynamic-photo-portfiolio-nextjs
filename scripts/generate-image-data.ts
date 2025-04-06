import { UTApi } from "uploadthing/server";
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

if (!process.env.UPLOADTHING_TOKEN) {
  console.error('❌ UPLOADTHING_TOKEN is not set in .env file');
  process.exit(1);
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