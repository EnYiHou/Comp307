import mongoose from 'mongoose';

const defaultMongoUri = 'mongodb://127.0.0.1:27017/comp307';

export const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI || defaultMongoUri;

  mongoose.set('strictQuery', true);

  await mongoose.connect(mongoUri);

  return mongoose.connection;
};