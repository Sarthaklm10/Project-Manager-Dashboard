const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // Try to connect to MongoDB, but don't fail if not available
    if (process.env.MONGO_URI && !process.env.MONGO_URI.includes("localhost")) {
      const conn = await mongoose.connect(process.env.MONGO_URI);
      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } else {
      console.log(`⚠️  MongoDB not available, using mock data for testing`);
      // We'll handle this in the controllers
    }
  } catch (err) {
    console.log(`⚠️  MongoDB connection failed, using mock data: ${err.message}`);
  }
};

module.exports = connectDB;