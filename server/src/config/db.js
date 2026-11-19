const mongoose = require('mongoose');

/**
 * Connects to MongoDB database using Mongoose.
 * Supports both local MongoDB instances and cloud databases like MongoDB Atlas.
 */
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/flowforge';
    const conn = await mongoose.connect(mongoUri);
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`[Database Error] Failed to connect to MongoDB: ${error.message}`);
    console.error('[Database Tip] Ensure MongoDB is running locally or provide a valid MONGODB_URI in your .env file.');
    // Do not terminate process immediately so health check/info can still respond if desired
    return null;
  }
};

module.exports = connectDB;
