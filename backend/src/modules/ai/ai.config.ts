import { registerAs } from '@nestjs/config';

export default registerAs('ai', () => ({
  baseUrl: process.env.AI_SERVICE_URL,
  timeoutMs: parseInt(process.env.AI_SERVICE_TIMEOUT_MS || '60000', 10),
  maxRetries: parseInt(process.env.AI_SERVICE_MAX_RETRIES || '3', 10),
}));
