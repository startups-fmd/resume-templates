const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Check if we're in development and MongoDB is not available
    if (process.env.NODE_ENV === 'development' && !process.env.MONGODB_URI.includes('mongodb+srv')) {
      console.log('Development mode: Using local MongoDB...');
    }
    
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    
    // If MongoDB is not available, show helpful message
    if (error.code === 'ECONNREFUSED' || error.message.includes('ECONNREFUSED')) {
      console.log('\n❌ MongoDB is not running!');
      console.log('\n📋 To fix this, you have 2 options:');
      console.log('\n1️⃣ Install MongoDB locally:');
      console.log('   - Download from: https://www.mongodb.com/try/download/community');
      console.log('   - Or use MongoDB Atlas (free): https://www.mongodb.com/atlas');
      console.log('\n2️⃣ Use MongoDB Atlas (Recommended):');
      console.log('   - Go to https://www.mongodb.com/atlas');
      console.log('   - Create free account');
      console.log('   - Create cluster and get connection string');
      console.log('   - Update MONGODB_URI in .env file');
      console.log('\n🔄 For now, the server will exit. Please set up MongoDB and try again.');
    }
    
    process.exit(1);
  }
};

module.exports = connectDB;
