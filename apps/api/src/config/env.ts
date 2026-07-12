import dotenv from 'dotenv';
import path from 'path';

// Load environmental variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000', 10),
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/school-timetable-system',
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || 'fallback_super_secret_access_key_98241',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'fallback_super_secret_refresh_key_98241',
  JWT_ACCESS_EXPIRY: process.env.JWT_ACCESS_EXPIRY || '15m',
  JWT_REFRESH_EXPIRY: process.env.JWT_REFRESH_EXPIRY || '7d',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',
};
