require('dotenv').config();
const http = require('http');
const app = require('./src/app');
const connectDB = require('./src/config/db');

const PORT = process.env.PORT || 5000;

// Create HTTP server
const server = http.createServer(app);

// Connect to MongoDB then start server
connectDB()
  .then(async () => {
    // Seed database if empty
    const seedDB = require('./src/utils/seeder');
    await seedDB();

    server.listen(PORT, () => {
      console.log(`\n🏥  Hospify API running on port ${PORT}`);
      console.log(`📡  Environment : ${process.env.NODE_ENV}`);
      console.log(`🌐  URL         : http://localhost:${PORT}/api\n`);
    });
  })
  .catch((err) => {
    console.error('❌  Failed to connect to MongoDB:', err.message);
    process.exit(1);
  });

// Graceful shutdown
const gracefulShutdown = (signal) => {
  console.log(`\n⚡  Received ${signal}. Shutting down gracefully...`);
  server.close(() => {
    console.log('✅  HTTP server closed.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('⚠️  Unhandled Rejection at:', promise, 'reason:', reason);
  server.close(() => process.exit(1));
});
