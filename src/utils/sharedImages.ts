import { ImageData } from '../types/images';
import fs from 'fs';
import path from 'path';

export interface SharedImageData {
  images: Array<{
    key: string;
    name: string;
    url: string;
    thumbnailUrl: string;
  }>;
  lastUpdated: string;
  category: string;
}

export async function fetchSharedImages(): Promise<SharedImageData> {
  try {
    // Read the file directly from the filesystem (server-side)
    const filePath = path.join(process.cwd(), 'public/data/images-shared.json');
    
    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(fileContent);
    }
  } catch (error) {
    console.warn('Error fetching shared images:', error);
  }
  
  // Return empty data if file doesn't exist or read fails
  return {
    images: [],
    lastUpdated: new Date().toISOString(),
    category: 'shared'
  };
}

export async function getProfileImage(): Promise<string | null> {
  try {
    const sharedData = await fetchSharedImages();
    
    // Look for Nick's specific profile image first
    const nickProfileImage = sharedData.images.find(img => 
      img.name.toLowerCase().includes('nd-photo-profile-pic.jpg')
    );
    
    if (nickProfileImage) {
      return nickProfileImage.url;
    }
    
    // Fallback to common profile image names
    const profileImageNames = [
      'profile.jpg',
      'profile.jpeg',
      'profile.png',
      'portrait.jpg',
      'portrait.jpeg',
      'portrait.png',
      'headshot.jpg',
      'headshot.jpeg',
      'headshot.png'
    ];
    
    for (const profileName of profileImageNames) {
      const profileImage = sharedData.images.find(img => 
        img.name.toLowerCase().includes(profileName.toLowerCase()) ||
        img.name.toLowerCase().endsWith(profileName.toLowerCase())
      );
      
      if (profileImage) {
        return profileImage.url;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching profile image:', error);
    return null;
  }
}

export async function getSharedImageByName(name: string): Promise<string | null> {
  try {
    const sharedData = await fetchSharedImages();
    const image = sharedData.images.find(img => 
      img.name.toLowerCase().includes(name.toLowerCase())
    );
    
    return image ? image.url : null;
  } catch (error) {
    console.error('Error fetching shared image by name:', error);
    return null;
  }
}