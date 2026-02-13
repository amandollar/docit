/// <reference path="../types/backblaze-b2.d.ts" />
import B2 from 'backblaze-b2';
import env from './env';
import logger from '../utils/logger';

const b2 = new B2({
  applicationKeyId: env.B2_APPLICATION_KEY_ID,
  applicationKey: env.B2_APPLICATION_KEY,
});

let authorized = false;
let cachedBucketId: string | null = null;

export const authorizeB2 = async (): Promise<void> => {
  try {
    if (!authorized) {
      await b2.authorize();
      const { data } = await b2.listBuckets();
      const bucket = data.buckets.find((b) => b.bucketName === env.B2_BUCKET_NAME);
      if (!bucket) {
        throw new Error(
          `Bucket "${env.B2_BUCKET_NAME}" not found. ` +
          'Check that B2_BUCKET_NAME in .env exactly matches an existing bucket in your Backblaze B2 account (case-sensitive).'
        );
      }
      cachedBucketId = bucket.bucketId;
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
  if (cachedBucketId == null) {
    throw new Error('B2 not authorized yet; call getB2Instance() first');
  }
  return cachedBucketId;
};

export const getB2BucketName = (): string => {
  return env.B2_BUCKET_NAME;
};

export const getB2Endpoint = (): string => {
  if (!authorized || !b2.downloadUrl) {
    throw new Error('B2 not authorized yet; call getB2Instance() first');
  }
  return b2.downloadUrl;
};

export default b2;
