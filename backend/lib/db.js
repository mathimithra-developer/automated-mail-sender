import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import net from 'net';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env'), override: true });
dotenv.config({ override: true });

let mongodInstance = null;
let activeUri = null;
let isReconnecting = false;

function isPortOpen(port, host) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    const onError = () => { socket.destroy(); resolve(false); };
    socket.setTimeout(800);
    socket.once('error', onError);
    socket.once('timeout', onError);
    socket.connect(port, host, () => { socket.end(); resolve(true); });
  });
}

async function launchMemoryServer() {
  const { MongoMemoryServer } = await import('mongodb-memory-server');
  const persistentDbPath = path.resolve(__dirname, '../../.mongodb_data');

  // Ensure database directory exists to prevent MongoMemoryServer ENOENT crash
  if (!fs.existsSync(persistentDbPath)) {
    fs.mkdirSync(persistentDbPath, { recursive: true });
  }

  // Try on fixed port 27017 first with persistent disk storage (for Compass and durability)
  try {
    mongodInstance = await MongoMemoryServer.create({
      instance: {
        port: 27017,
        dbName: 'mailsender',
        dbPath: persistentDbPath,
        storageEngine: 'wiredTiger',
      },
    });
    const uri = 'mongodb://127.0.0.1:27017/mailsender';
    await mongoose.connect(uri);
    activeUri = uri;
    console.log('═══════════════════════════════════════════════════');
    console.log('✅ Local MongoDB instance active on port 27017 (persistent)!');
    console.log('📌 MongoDB Compass Connection String: mongodb://localhost:27017/mailsender');
    console.log('═══════════════════════════════════════════════════');
    return uri;
  } catch (err) {
    console.log('⚠️ Failed to launch persistent MongoDB on port 27017:', err.message);
    // Port busy or lock failed — use dynamic in-memory port as fallback
    mongodInstance = await MongoMemoryServer.create({
      instance: { dbName: 'mailsender' },
    });
    const uri = mongodInstance.getUri();
    await mongoose.connect(uri);
    activeUri = uri;
    console.log('✅ MongoDB fallback server active at:', uri);
    return uri;
  }
}

async function doReconnect() {
  if (isReconnecting) return;
  isReconnecting = true;
  console.warn('🔄 MongoDB disconnected — attempting reconnect in 2s...');

  await new Promise(r => setTimeout(r, 2000));

  try {
    // If we have a stored URI, try reconnecting to it directly first
    if (activeUri) {
      try {
        await mongoose.connect(activeUri, { serverSelectionTimeoutMS: 3000 });
        console.log('✅ MongoDB reconnected at:', activeUri);
        isReconnecting = false;
        return;
      } catch (_) {
        console.warn('⚠️ Reconnect to existing URI failed, restarting database...');
      }
    }

    // Stop and restart the memory server if it was one
    if (mongodInstance) {
      try { await mongodInstance.stop(); } catch (_) {}
      mongodInstance = null;
    }

    await launchMemoryServer();
    // Re-seed so data is available
    const { seedData } = await import('../seed.js');
    await seedData(false);
    console.log('✅ MongoDB restarted and data restored.');
  } catch (err) {
    console.error('❌ MongoDB reconnect failed:', err.message);
  } finally {
    isReconnecting = false;
  }
}

export async function connectDB() {
  const targetUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/mailsender';

  // Parse host/port from URI
  let host = 'localhost';
  let port = 27017;
  try {
    const url = new URL(targetUri.replace('mongodb://', 'http://'));
    host = url.hostname || 'localhost';
    port = parseInt(url.port) || 27017;
  } catch (_) {}

  const portOpen = await isPortOpen(port, host);

  if (portOpen) {
    try {
      await mongoose.connect(targetUri, { serverSelectionTimeoutMS: 3000 });
      activeUri = targetUri;
      console.log('✅ Connected to native MongoDB daemon at:', targetUri);
      return;
    } catch (err) {
      console.log('⚠️ Failed to connect to native MongoDB on open port:', err.message);
    }
  }

  console.log('⚠️ Native MongoDB not found — launching embedded database server...');
  try {
    const uri = await launchMemoryServer();
    activeUri = uri;
    const { seedData } = await import('../seed.js');
    await seedData(false);
  } catch (err) {
    console.error('❌ Failed to initialize MongoDB database:', err.message);
    process.exit(1);
  }
}

// Auto-reconnect on disconnect
mongoose.connection.on('disconnected', () => {
  console.warn('⚠️ MongoDB disconnected');
  doReconnect();
});

mongoose.connection.on('error', (err) => {
  console.warn('⚠️ MongoDB connection error:', err.message);
});
