import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

let mongodInstance = null;

export async function connectDB() {
  const targetUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/mailsender';
  
  try {
    await mongoose.connect(targetUri, { serverSelectionTimeoutMS: 2000 });
    console.log('✅ Connected to native MongoDB daemon at:', targetUri);
  } catch (err) {
    console.log('⚠️ Native MongoDB service not detected on port 27017. Launching database server bound to port 27017 for MongoDB Compass...');
    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      mongodInstance = await MongoMemoryServer.create({
        instance: {
          port: 27017,
          dbName: 'mailsender',
        },
      });
      const memUri = 'mongodb://127.0.0.1:27017/mailsender';
      await mongoose.connect(memUri);
      console.log('═══════════════════════════════════════════════════');
      console.log('✅ Local MongoDB instance active on port 27017!');
      console.log('📌 MongoDB Compass Connection String: mongodb://localhost:27017/mailsender');
      console.log('═══════════════════════════════════════════════════');

      // Seed demo data into database so Compass has initial collections
      const { seedData } = await import('../seed.js');
      await seedData(false);
    } catch (memErr) {
      console.log('⚠️ Port 27017 busy, trying fallback port...');
      try {
        const { MongoMemoryServer } = await import('mongodb-memory-server');
        mongodInstance = await MongoMemoryServer.create({
          instance: {
            dbName: 'mailsender',
          },
        });
        const fallbackUri = mongodInstance.getUri();
        await mongoose.connect(fallbackUri);
        console.log('✅ MongoDB server active at:', fallbackUri);

        const { seedData } = await import('../seed.js');
        await seedData(false);
      } catch (e2) {
        console.error('❌ Failed to initialize MongoDB database:', e2.message);
        process.exit(1);
      }
    }
  }
}

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️ MongoDB disconnected');
});
