import mongoose from 'mongoose';

const connectDB = async () => {
  if (!process.env.MONGODB_URI) {
    console.warn('No MongoDB URI provided. Running with in-memory fallback data.');
    return;
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected');
  } catch (error) {
    console.warn('MongoDB connection failed, continuing with fallback data:', error.message);
  }
};

export default connectDB;
