// Simple in-memory storage for demonstration
let users = [];

const seedUsers = () => {
  users = [
    {
      id: '1',
      name: 'Admin User Test',
      email: 'admin@test.com',
      password: '123456789', // In production, this should be hashed!
      role: 'admin'
    },
    {
      id: '2',
      name: 'Jack Sparrow',
      email: 'jack@test.com',
      password: '123456789',
      role: 'user'
    }
  ];
  console.log('Users seeded successfully');
};

const getUsers = () => {
  return users;
};

module.exports = {
  seedUsers,
  getUsers
};