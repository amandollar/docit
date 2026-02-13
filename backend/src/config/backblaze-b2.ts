import B2 from 'backblaze-b2';
import env from './env';
import logger from '../utils/logger';

const b2 = new B2({
  applicationKeyId: env.B2_APPLICATION_KEY_ID,
  applicationKey: env.B2_APPLICATION_KEY,
});

let authorized = false;

export const authorizeB2 = async (): Promise<void> => {
  try {
    if (!authorized) {
      await b2.authorize();
      authorized = true;
      logger.info('✅ Backblaze B2 authorized successfully');
    }
  } catch (error) {
    logger.error('❌ Backblaze B2 authorization error:', error);
    throw error;
  }
};

export const getB2Instance = async () => {
  if (!authorized) {
    await authorizeB2();
  }
  return b2;
};

export const getB2BucketId = (): string => {
  return env.B2_BUCKET_ID;
};

export const getB2BucketName = (): string => {
  return env.B2_BUCKET_NAME;
};

export const getB2Endpoint = (): string => {
  return env.B2_ENDPOINT;
};

export default b2;
