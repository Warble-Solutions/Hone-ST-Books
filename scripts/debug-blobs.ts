import "dotenv/config";
import { list, getDownloadUrl } from "@vercel/blob";

async function main() {
  console.log("📋 Listing all blobs...\n");
  
  const blobs = await list();
  
  for (const blob of blobs.blobs) {
    console.log(`  ${blob.pathname}`);
    console.log(`  URL: ${blob.url}`);
    console.log(`  Size: ${(blob.size / 1024 / 1024).toFixed(1)} MB`);
    
    try {
      const downloadUrl = await getDownloadUrl(blob.url);
      console.log(`  Download URL: ${downloadUrl.substring(0, 80)}...`);
      console.log(`  ✅ getDownloadUrl works!\n`);
    } catch (err) {
      console.log(`  ❌ getDownloadUrl failed: ${err}\n`);
    }
  }
}

main().catch(console.error);
