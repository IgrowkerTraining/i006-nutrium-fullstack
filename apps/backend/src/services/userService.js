const User = require('../models/User');

class UserService {
  constructor() {
    this.users = [];
  }

  findByEmail(email) {
    return this.users.find(user => user.email === email);
  }

  findById(id) {
    return this.users.find(user => user.id === id);
  }

  async create(userData) {
    const existingUser = this.findByEmail(userData.email);
    if (existingUser) {
      throw new Error('User already exists');
    }

    const newUser = User.create(userData);
    this.users.push(newUser);
    return newUser;
  }

  async authenticate(email, password) {
    const user = this.findByEmail(email);
    if (!user || user.password !== password) {
      throw new Error('Invalid email or password');
    }
    return user;
  }

  getAllUsers() {
    return this.users.map(user => user.toJSON());
  }
}

module.exports = new UserService();
