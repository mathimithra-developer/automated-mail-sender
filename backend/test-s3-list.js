// test-s3-list.js – list objects in the configured S3 bucket
import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";
import dotenv from "dotenv";

import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const region = process.env.AWS_REGION;
const bucket = process.env.AWS_S3_BUCKET;
if (!region || !bucket) {
  console.error("Missing AWS_REGION or AWS_S3_BUCKET env vars");
  process.exit(1);
}
const client = new S3Client({ region });

(async () => {
  try {
    const command = new ListObjectsV2Command({ Bucket: bucket, MaxKeys: 20 });
    const response = await client.send(command);
    console.log("✅ S3 connection successful. Objects (up to 20):");
    if (response.Contents && response.Contents.length > 0) {
      response.Contents.forEach((obj) => console.log("- " + obj.Key));
    } else {
      console.log("(bucket is empty)");
    }
  } catch (err) {
    console.error("❌ Error accessing S3:", err.message);
  }
})();
