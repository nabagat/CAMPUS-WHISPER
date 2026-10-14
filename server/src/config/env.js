import dotenv from 'dotenv';
dotenv.config();

export const ENV = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  DATABASE_ENGINE: process.env.DATABASE_ENGINE || 'firebase_inbuilt',
  FIREBASE_USE_LOCAL: process.env.FIREBASE_USE_LOCAL !== 'false',
  JWT_SECRET: process.env.JWT_SECRET || 'campus_voice_secure_jwt_secret_dev_2026',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  AI_AUTO_APPROVE_THRESHOLD: parseFloat(process.env.AI_AUTO_APPROVE_THRESHOLD || '0.35'),
  AI_AUTO_REJECT_THRESHOLD: parseFloat(process.env.AI_AUTO_REJECT_THRESHOLD || '0.75'),
  ANONYMITY_SALT: process.env.ANONYMITY_SALT || 'campus_voice_anonymity_salt_key_2026'
};
