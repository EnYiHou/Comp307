import User from '../models/User.js';

const sampleUser = {
  name: 'Sample User',
  email: 'sample.user@example.com',
  role: 'student',
};

export const seedUsers = async () => {
  const userCount = await User.countDocuments();

  if (userCount === 0) {
    await User.create(sampleUser);
    console.log('Inserted sample user into the users collection');
  }
};