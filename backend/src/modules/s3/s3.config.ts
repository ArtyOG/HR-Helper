import { registerAs } from '@nestjs/config';

export default registerAs('s3', () => ({
    accessKeyId: process.env.S3_ACCESS_KEY_ID || 'placeholder_access_key',
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || 'placeholder_secret_key',
    region: process.env.S3_REGION || 'us-east-1',
    endpoint: process.env.S3_ENDPOINT || 'https://s3.us-east-1.amazonaws.com',
    bucketName: process.env.S3_BUCKET_NAME || 'hr-helper-resumes',
}));