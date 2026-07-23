import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import 'dotenv/config';

async function main() {
  const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });

  const bucket = process.env.AWS_S3_BUCKET;
  const key = "1784528681168_iqx61fiugka.png"; // app.png

  console.log(`Fetching ${key} from bucket ${bucket} in region ${process.env.AWS_REGION}...`);
  try {
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });
    const res = await s3Client.send(command);
    console.log("Success! ContentLength:", res.ContentLength);
  } catch (err) {
    console.error("Failed to fetch from S3:", err.message);
  }
}

main().catch(console.error);
