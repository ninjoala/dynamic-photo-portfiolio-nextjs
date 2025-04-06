// Types for UploadThing image data
interface UploadthingImage {
  key: string;
  name: string;
  size: number;
  url: string;
}

// Fetch images from UploadThing
export async function getProjectImages(projectName: string): Promise<UploadthingImage[]> {
  const response = await fetch(`/api/uploadthing/list?project=${projectName}`);
  if (!response.ok) {
    throw new Error('Failed to fetch images');
  }
  const data = await response.json();
  return data.files;
} 