const jwt = require('jsonwebtoken');
const User = require('../models/User');

class UserService {
  /**
   * Crea un nuevo usuario en la base de datos
   * @param {Object} userData - Datos del usuario { name, email, password, role }
   * @returns {Promise<Object>} Usuario creado sin contraseña
   * @throws {Error} Si el email ya existe
   */
  async createUser(userData) {
    const { email, password, name, role } = userData;

    // Verificar si el email ya existe
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      const error = new Error('El email ya está registrado');
      error.statusCode = 400;
      throw error;
    }

    // Crear usuario con password_hash en lugar de password
    const newUser = await User.create({
      email,
      password_hash: password, // beforeCreate hook de User hasheará esto automáticamente
      name,
      role: role || 'patient',
    });

    return newUser.toJSON();
  }

  /**
   * Autentica un usuario y genera un JWT
   * @param {string} email - Email del usuario
   * @param {string} password - Contraseña en texto plano
   * @returns {Promise<Object>} { user, token }
   * @throws {Error} Si las credenciales son inválidas
   */
  async loginUser(email, password) {
    // Buscar usuario por email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      const error = new Error('Email o contraseña inválidos');
      error.statusCode = 401;
      throw error;
    }

    // Validar contraseña usando bcrypt
    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) {
      const error = new Error('Email o contraseña inválidos');
      error.statusCode = 401;
      throw error;
    }

    // Generar JWT
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET || 'default-secret-key-change-in-production',
      {
        expiresIn: '7d', // Token válido por 7 días
      }
    );

    return {
      user: user.toJSON(),
      token,
    };
  }

  /**
   * Busca un usuario por ID
   * @param {string} id - UUID del usuario
   * @returns {Promise<Object>} Usuario encontrado
   */
  async findById(id) {
    return await User.findByPk(id);
  }

  /**
   * Obtiene todos los usuarios (sin contraseñas)
   * @returns {Promise<Array>} Lista de usuarios
   */
  async getAllUsers() {
    const users = await User.findAll();
    return users.map(user => user.toJSON());
  }
}

module.exports = new UserService();
