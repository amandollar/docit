import mongoose from 'mongoose';
import env from './env';
import logger from '../utils/logger';

const connectDatabase = async (): Promise<void> => {
  try {
    await mongoose.connect(env.MONGODB_URI);
    logger.info('✅ MongoDB connected successfully');
  } catch (error) {
    logger.error('❌ MongoDB connection error:', error);
    logger.warn('⚠️ Server will continue without MongoDB connection. Please update MONGODB_URI in .env');
    // Don't exit in development - allow server to start for testing
    if (env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

mongoose.connection.on('disconnected', () => {
  logger.warn('⚠️ MongoDB disconnected');
});

mongoose.connection.on('error', (error) => {
  logger.error('❌ MongoDB error:', error);
});

export default connectDatabase;
