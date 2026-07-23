import mongoose from 'mongoose';
import 'dotenv/config';
import { User } from './lib/models.js';

async function check() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mailsender');
  const users = await User.find({}).populate('organization');
  console.log(JSON.stringify(users, null, 2));
  await mongoose.disconnect();
}

check().catch(console.error);
