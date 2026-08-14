const mongoose = require('mongoose');
const { logger } = require('../utils/logger');

const connectDB = async () => {
  let uri = process.env.MONGODB_URI;
  if (!uri || uri.includes('<username>') || uri.includes('<password>')) {
    uri = 'mongodb://127.0.0.1:27017/cinetrack';
  }

  const options = {
    maxPoolSize: 20,   // Cap connections — prevents exhausting DB provider limits
  };

  try {
    const conn = await mongoose.connect(uri, options);
    logger.info(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    logger.error(`⚠️ Could not connect to primary MongoDB URI (${uri}): ${error.message}`);
    if (uri !== 'mongodb://127.0.0.1:27017/cinetrack') {
      try {
        logger.info('🔄 Attempting connection to local MongoDB: mongodb://127.0.0.1:27017/cinetrack');
        const conn = await mongoose.connect('mongodb://127.0.0.1:27017/cinetrack', options);
        logger.info(`✅ MongoDB Connected locally: ${conn.connection.host}`);
        return conn;
      } catch (localErr) {
        logger.error(`❌ Local MongoDB connection error: ${localErr.message}`);
      }
    }
    logger.warn('⚠️ Server running without MongoDB connection. Real database operations will fail until MongoDB is started.');
    return null;
  }
};

module.exports = connectDB;
