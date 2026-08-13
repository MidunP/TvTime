const mongoose = require('mongoose');

const connectDB = async () => {
  let uri = process.env.MONGODB_URI;
  if (!uri || uri.includes('<username>') || uri.includes('<password>')) {
    uri = 'mongodb://127.0.0.1:27017/cinetrack';
  }

  try {
    const conn = await mongoose.connect(uri);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`⚠️ Could not connect to primary MongoDB URI (${uri}):`, error.message);
    if (uri !== 'mongodb://127.0.0.1:27017/cinetrack') {
      try {
        console.log('🔄 Attempting connection to local MongoDB: mongodb://127.0.0.1:27017/cinetrack');
        const conn = await mongoose.connect('mongodb://127.0.0.1:27017/cinetrack');
        console.log(`✅ MongoDB Connected locally: ${conn.connection.host}`);
        return conn;
      } catch (localErr) {
        console.error('❌ Local MongoDB connection error:', localErr.message);
      }
    }
    console.warn('⚠️ Server running without MongoDB connection. Real database operations will fail until MongoDB is started.');
    return null;
  }
};

module.exports = connectDB;
