const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // Optimized MongoDB connection options
    const options = {
      // Connection pool settings
      maxPoolSize: 10, // Maximum number of connections
      minPoolSize: 2,  // Minimum number of connections
      maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
      
      // Timeout settings
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      connectTimeoutMS: 10000, // Give up initial connection after 10 seconds
      
      // Compression
      compressors: ['zlib'],
      zlibCompressionLevel: 6,
      
      // Read preference
      readPreference: 'secondaryPreferred', // Read from secondary when possible
      
      // Write concern
      writeConcern: {
        w: 'majority',
        j: true,
        wtimeout: 1000
      }
    };

    // Set mongoose-specific options separately
    mongoose.set('bufferCommands', false);

    await mongoose.connect(process.env.MONGO_URI, options);
    
    // Connection event handlers
    mongoose.connection.on('connected', () => {
      console.log('✅ MongoDB Atlas Connected');
    });
    
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB disconnected');
    });
    
    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed through app termination');
      process.exit(0);
    });
    
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err);
    process.exit(1);
  }
};

module.exports = connectDB;
