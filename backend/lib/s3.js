import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";

let s3Client = null;

const isS3Configured = 
  process.env.AWS_ACCESS_KEY_ID &&
  process.env.AWS_SECRET_ACCESS_KEY &&
  process.env.AWS_REGION &&
  process.env.AWS_S3_BUCKET &&
  process.env.AWS_S3_PUBLIC_URL;

if (isS3Configured) {
  try {
    s3Client = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
  } catch (err) {
    console.error("Failed to initialize AWS S3 client:", err);
  }
} else {
  console.log("AWS S3 credentials not fully set in .env. Uploads will fall back to local disk.");
}

/**
 * Uploads a buffer to AWS S3.
 * Returns the public URL of the uploaded object if successful, otherwise null (triggers local fallback).
 */
export async function uploadToS3(buffer, filename, mimeType) {
  if (!s3Client) {
    console.log("AWS S3 client not initialized. Falling back to local storage.");
    return null;
  }

  const bucket = process.env.AWS_S3_BUCKET;
  let publicUrlBase = process.env.AWS_S3_PUBLIC_URL;
  if (!publicUrlBase.endsWith("/")) {
    publicUrlBase += "/";
  }

  try {
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: filename,
      Body: buffer,
      ContentType: mimeType,
    });

    await s3Client.send(command);
    return `${publicUrlBase}${filename}`;
  } catch (err) {
    console.error("AWS S3 upload failed:", err);
    return null;
  }
}

/**
 * Deletes an object from AWS S3 by its key/filename.
 */
export async function deleteFromS3(filename) {
  if (!s3Client) return;

  try {
    const command = new DeleteObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: filename
    });

    await s3Client.send(command);
    console.log(`Successfully deleted ${filename} from AWS S3.`);
  } catch (err) {
    console.error(`Failed to delete ${filename} from AWS S3:`, err);
  }
}

/**
 * Streams an S3 object — used by the asset proxy route.
 * Returns the raw SDK response (with .Body ReadableStream and .ContentType).
 */
export async function getFromS3(filename) {
  if (!s3Client) return null;
  try {
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: filename,
    });
    return await s3Client.send(command);
  } catch (err) {
    console.error(`AWS S3 get failed for ${filename}:`, err);
    return null;
  }
}

/** Expose the raw client so routes can check if S3 is available. */
export { s3Client };
