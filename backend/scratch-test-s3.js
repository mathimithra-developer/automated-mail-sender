import { uploadToS3 } from './lib/s3.js';
import 'dotenv/config';

async function main() {
  console.log('ENV keys:', {
    id: process.env.AWS_ACCESS_KEY_ID,
    secret: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
    bucket: process.env.AWS_S3_BUCKET,
    url: process.env.AWS_S3_PUBLIC_URL
  });
  const buffer = Buffer.from('hello s3');
  const result = await uploadToS3(buffer, 'test-file-antigravity.txt', 'text/plain');
  console.log('Result:', result);
}

main().catch(console.error);
