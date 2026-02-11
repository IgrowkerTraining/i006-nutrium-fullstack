const userService = require('../services/userService');

class AuthController {
  async register(req, res) {
    try {
      const { name, email, password } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({ 
          error: "All fields are required" 
        });
      }

      const newUser = await userService.create({ name, email, password });
      
      res.status(201).json({
        user: newUser.toJSON(),
        message: "User registered successfully",
      });
    } catch (error) {
      if (error.message === 'User already exists') {
        return res.status(409).json({ error: error.message });
      }
      res.status(500).json({ error: "Registration failed" });
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ 
          error: "Email and password are required" 
        });
      }

      const user = await userService.authenticate(email, password);
      
      res.json({
        user: user.toJSON(),
        token: "mock-jwt-token-" + user.id,
        message: "Login successful",
      });
    } catch (error) {
      if (error.message === 'Invalid email or password') {
        return res.status(401).json({ error: error.message });
      }
      res.status(500).json({ error: "Login failed" });
    }
  }
}

module.exports = new AuthController();
