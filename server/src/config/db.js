import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

export const connectDB = async () => {
  const dbUser = process.env.MONGODB_USERNAME;
  const dbPassword = process.env.MONGODB_PASSWORD;
  const defaultMongoUri = `mongodb+srv://${dbUser}:${dbPassword}@comp307-berk.mj9lurk.mongodb.net/?appName=COMP307-BERK`;
  console.log('Connecting to MongoDB with URI:', defaultMongoUri);
  const mongoUri = process.env.MONGODB_URI || defaultMongoUri;

  mongoose.set('strictQuery', true);

  await mongoose.connect(mongoUri);

  return mongoose.connection;
};