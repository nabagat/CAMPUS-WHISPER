import app from './app.js';
import { connectDB, closeDB } from './config/db.js';
import { ENV } from './config/env.js';
import { Post } from './models/Post.js';
import { seedDatabase } from './utils/seedData.js';

let server;

async function startServer() {
  try {
    console.log('🚀 [SERVER] Initializing CampusVoice Backend Server...');
    await connectDB();

    // Auto-seed if database is fresh
    const postCount = await Post.countDocuments();
    if (postCount === 0) {
      console.log('🌱 [SERVER] Fresh database detected. Running initial seed...');
      await seedDatabase();
    }

    server = app.listen(ENV.PORT, () => {
      console.log(`📡 [SERVER] CampusVoice API listening on port ${ENV.PORT} [${ENV.NODE_ENV}]`);
      console.log(`🔒 [SERVER] Privacy-by-design active: PII stripping, NoSQL injection shield & rate limiting enabled.`);
      console.log(`🔗 [SERVER] API Health Check: http://localhost:${ENV.PORT}/api/health`);
    });
  } catch (err) {
    console.error('💥 [SERVER] Fatal startup error:', err);
    process.exit(1);
  }
}

// Graceful shutdown handlers
async function handleShutdown(signal) {
  console.log(`\n🛑 [SERVER] Received ${signal}. Gracefully shutting down...`);
  if (server) {
    server.close(async () => {
      console.log('🔌 [SERVER] HTTP server closed.');
      await closeDB();
      process.exit(0);
    });
  } else {
    await closeDB();
    process.exit(0);
  }
}

process.on('SIGINT', () => handleShutdown('SIGINT'));
process.on('SIGTERM', () => handleShutdown('SIGTERM'));

startServer();
