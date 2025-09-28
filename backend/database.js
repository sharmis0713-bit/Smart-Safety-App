const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    
    // Create indexes for better performance
    await mongoose.connection.collection('safetydatas').createIndex({ location: '2dsphere' });
    await mongoose.connection.collection('users').createIndex({ location: '2dsphere' });
    await mongoose.connection.collection('emergencies').createIndex({ timestamp: -1 });
    
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

module.exports = connectDB;
