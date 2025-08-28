import mongoose from 'mongoose';
import colors from 'colors';

const connectDB = async () => {
  try {
    console.log('🔄 Attempting to connect to MongoDB...'.yellow);
    
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
      family: 4 // Use IPv4, skip trying IPv6
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`.green.bold);
    console.log(`📊 Database: ${conn.connection.name}`.cyan);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:'.red, err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️  MongoDB disconnected'.yellow);
    });

    mongoose.connection.on('reconnected', () => {
      console.log('🔄 MongoDB reconnected'.green);
    });

  } catch (error) {
    console.error('❌ MongoDB connection failed:'.red);
    console.error('Error details:'.red, error.message);
    
    // More specific error handling
    if (error.code === 'ESERVFAIL') {
      console.error('🔍 DNS Resolution Failed:'.red);
      console.error('   - Check your internet connection'.yellow);
      console.error('   - Verify the cluster hostname is correct'.yellow);
      console.error('   - Try using a different DNS server'.yellow);
    } else if (error.code === 'ENOTFOUND') {
      console.error('🔍 Host Not Found:'.red);
      console.error('   - Check the cluster URL spelling'.yellow);
      console.error('   - Verify the cluster is active'.yellow);
    } else if (error.code === 'ECONNREFUSED') {
      console.error('🔍 Connection Refused:'.red);
      console.error('   - Check if the cluster is accessible'.yellow);
      console.error('   - Verify IP whitelist settings'.yellow);
    }
    
    console.error('\n🔧 Troubleshooting Steps:'.cyan);
    console.error('   1. Check your internet connection'.yellow);
    console.error('   2. Verify the MongoDB Atlas cluster is active'.yellow);
    console.error('   3. Check IP whitelist in MongoDB Atlas'.yellow);
    console.error('   4. Try connecting from MongoDB Compass first'.yellow);
    console.error('   5. Verify username/password are correct'.yellow);
    
    process.exit(1);
  }
};

export default connectDB;
