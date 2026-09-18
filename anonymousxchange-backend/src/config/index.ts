import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',

  databaseUrl: process.env.DATABASE_URL || '',
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',

  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'dev-access-secret-change-me',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-change-me',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
  },

  rates: {
    usdToNgn: parseFloat(process.env.USD_TO_NGN || '1585'),
    refreshIntervalMs: parseInt(process.env.RATES_REFRESH_INTERVAL_MS || '300000', 10),
    cacheTtlMs: parseInt(process.env.RATES_CACHE_TTL_MS || '60000', 10),
    coinGeckoApiKey: process.env.COINGECKO_API_KEY || '',
  },

  telegram: {
    webhookUrl: process.env.TELEGRAM_WEBHOOK_URL || '',
  },
} as const;
