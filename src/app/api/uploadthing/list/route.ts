import { UTApi } from "uploadthing/server";
import { NextResponse } from "next/server";

const utapi = new UTApi({
  fetch: fetch,
  token: process.env.UPLOADTHING_TOKEN
});

export async function GET() {
  console.log("UPLOADTHING_TOKEN exists:", !!process.env.UPLOADTHING_TOKEN);
  console.log("UPLOADTHING_APP_ID:", process.env.UPLOADTHING_APP_ID);
  
  try {
    const response = await utapi.listFiles();
    return NextResponse.json({ files: response.files });
  } catch (error) {
    console.error("Error fetching files:", error);
    return NextResponse.json({ error: "Failed to fetch files" }, { status: 500 });
  }
} 