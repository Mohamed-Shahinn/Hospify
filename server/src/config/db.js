const mongoose = require('mongoose');

/**
 * Connect to MongoDB.
 * Returns the mongoose connection promise so server.js can await it.
 */
const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI;

  if (!mongoURI) {
    throw new Error('MONGO_URI is not defined in environment variables');
  }

  try {
    const conn = await mongoose.connect(mongoURI, {
      // These are the recommended options for Mongoose 8+
    });

    console.log(`✅  MongoDB connected: ${conn.connection.host}`);

    // Connection event listeners
    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected. Attempting to reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅  MongoDB reconnected.');
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌  MongoDB connection error:', err.message);
    });

    return conn;
  } catch (error) {
    console.error('❌  MongoDB initial connection failed:', error.message);
    throw error;
  }
};

module.exports = connectDB;
