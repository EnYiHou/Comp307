import mongoose from 'mongoose';


export const connectDB = async () => {
  const dbUser = process.env.MONGODB_USERNAME;
  const dbPassword = process.env.MONGODB_PASSWORD;
  const defaultMongoUri = `mongodb+srv://${dbUser}:${dbPassword}@comp307-berk.mj9lurk.mongodb.net/?appName=COMP307-BERK`;
  const mongoUri = process.env.MONGODB_URI || defaultMongoUri;

  mongoose.set('strictQuery', true);

  await mongoose.connect(mongoUri);

  return mongoose.connection;
};