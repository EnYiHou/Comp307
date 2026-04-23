import User from '../models/User.js';

const sampleUser = {
  name: 'test',
  email: 'sampling.user@example.com',
  role: 'student',
};

export const seedUsers = async () => {
  const userCount = await User.countDocuments();

  if (true) {
    await User.create(sampleUser);
    console.log('Inserted sample user into the users collection');
  }
};