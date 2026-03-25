/**
 * One-time script to upload PDFs from private/books/ to Cloudflare R2.
 *
 * Usage:
 *   npx tsx scripts/upload-pdfs.ts
 *
 * Required env vars (set in .env):
 *   R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME
 */

import "dotenv/config";
import { S3Client, PutObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { readFileSync, readdirSync } from "fs";
import { join } from "path";

const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

const BUCKET = process.env.R2_BUCKET_NAME || "honestbooks";
const BOOKS_DIR = join(process.cwd(), "private", "books");

async function main() {
  console.log("📤 Uploading PDFs to Cloudflare R2...\n");

  const files = readdirSync(BOOKS_DIR).filter((f) => f.endsWith(".pdf"));

  if (files.length === 0) {
    console.log("❌ No PDF files found in private/books/");
    process.exit(1);
  }

  for (const filename of files) {
    const key = `books/${filename}`;
    const filePath = join(BOOKS_DIR, filename);
    const fileBuffer = readFileSync(filePath);

    // Check if already exists
    try {
      await r2.send(new HeadObjectCommand({ Bucket: BUCKET, Key: key }));
      console.log(`⏭️  ${filename} — already exists, skipping`);
      continue;
    } catch {
      // Doesn't exist, proceed with upload
    }

    await r2.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: fileBuffer,
        ContentType: "application/pdf",
      })
    );

    const sizeMB = (fileBuffer.length / (1024 * 1024)).toFixed(1);
    console.log(`✅ ${filename} — uploaded (${sizeMB} MB)`);
  }

  console.log("\n🎉 Done! PDFs are now in R2.");
}

main().catch((err) => {
  console.error("Upload failed:", err);
  process.exit(1);
});
