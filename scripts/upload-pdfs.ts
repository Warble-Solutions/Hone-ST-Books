/**
 * One-time script to upload PDFs from private/books/ to Vercel Blob.
 *
 * Usage:
 *   npx tsx scripts/upload-pdfs.ts
 *
 * Required env vars (set in .env):
 *   BLOB_READ_WRITE_TOKEN (from Vercel dashboard → Storage → Blob)
 */

import "dotenv/config";
import { put, list } from "@vercel/blob";
import { readFileSync, readdirSync } from "fs";
import { join } from "path";

const BOOKS_DIR = join(process.cwd(), "private", "books");

async function main() {
  console.log("📤 Uploading PDFs to Vercel Blob...\n");

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error("❌ BLOB_READ_WRITE_TOKEN not set in .env");
    process.exit(1);
  }

  const files = readdirSync(BOOKS_DIR).filter((f) => f.endsWith(".pdf"));

  if (files.length === 0) {
    console.log("❌ No PDF files found in private/books/");
    process.exit(1);
  }

  // Check existing blobs
  const existing = await list();
  const existingPaths = new Set(existing.blobs.map((b) => b.pathname));

  for (const filename of files) {
    const blobPath = `books/${filename}`;

    if (existingPaths.has(blobPath)) {
      console.log(`⏭️  ${filename} — already exists, skipping`);
      continue;
    }

    const filePath = join(BOOKS_DIR, filename);
    const fileBuffer = readFileSync(filePath);

    const blob = await put(blobPath, fileBuffer, {
      access: "public",
      addRandomSuffix: false,
    });

    const sizeMB = (fileBuffer.length / (1024 * 1024)).toFixed(1);
    console.log(`✅ ${filename} — uploaded (${sizeMB} MB)`);
    console.log(`   URL: ${blob.url}`);
  }

  // Print the base URL for .env
  const blobs = await list();
  if (blobs.blobs.length > 0) {
    const sampleUrl = blobs.blobs[0].url;
    const baseUrl = sampleUrl.substring(0, sampleUrl.lastIndexOf("/books/"));
    console.log(`\n📋 Set this in your .env:`);
    console.log(`   BLOB_BASE_URL=${baseUrl}`);
  }

  console.log("\n🎉 Done! PDFs are now in Vercel Blob.");
}

main().catch((err) => {
  console.error("Upload failed:", err);
  process.exit(1);
});
