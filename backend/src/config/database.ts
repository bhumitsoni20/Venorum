import mongoose from 'mongoose';
import logger from '../utils/logger';

import dns from 'dns';

export const connectDB = async () => {
  try {
    // Explicitly force Node.js to use Google's Public DNS (8.8.8.8) simply to bypass native restricted routers!
    dns.setServers(['8.8.8.8', '8.8.4.4']);
    
    const mongoURI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/venorum';
    await mongoose.connect(mongoURI, {
       family: 4 // Force IPv4 routing directly to bypass local Windows querySrv IPv6 rejections
    } as any);
    logger.info('MongoDB Connected...');
  } catch (err) {
    logger.error('Error connecting to MongoDB: ', err);
    process.exit(1);
  }
};
