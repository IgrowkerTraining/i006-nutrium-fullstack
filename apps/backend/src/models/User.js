class User {
  constructor({ id, name, email, password, username, avatar }) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.password = password;
    this.username = username;
    this.avatar = avatar;
  }

  toJSON() {
    const { password, ...userWithoutPassword } = this;
    return userWithoutPassword;
  }

  static create(userData) {
    const user = new User({
      id: Math.random().toString(36).substr(2, 9),
      ...userData,
      username: userData.email.split("@")[0],
      avatar: `https://picsum.photos/seed/${userData.email}/200`,
    });
    return user;
  }
}

module.exports = User;
