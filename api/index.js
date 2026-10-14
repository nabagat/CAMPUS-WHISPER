import app from '../server/src/app.js';
import { connectDB } from '../server/src/config/db.js';

// Auto-initialize the Inbuilt Firebase store on serverless function invocation
try {
  await connectDB();
} catch (err) {
  console.error('[VERCEL_API] Failed to initialize DB:', err);
}

export default app;
