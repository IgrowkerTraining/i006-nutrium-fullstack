const bcrypt = require('bcrypt');
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
    const { email: rawEmail, password, name, role } = userData;

    // Normalizar email: eliminar espacios y convertir a minúsculas
    const email = rawEmail.trim().toLowerCase();

    // Verificar si el email ya existe
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      const error = new Error('El email ya está registrado');
      error.statusCode = 400;
      throw error;
    }

    // Hashear la contraseña con bcrypt (10 rondas de sal)
    // El hook beforeCreate del modelo también hashea, pero hacerlo aquí
    // hace explícita la responsabilidad de seguridad en la capa de servicio.
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario – password_hash ya viene hasheado, se deshabilita el hook
    // pasando el hash directamente para evitar doble hashing.
    const newUser = await User.create(
      {
        email,
        password_hash: hashedPassword,
        name,
        role: role || 'patient',
      },
      { hooks: false } // ← evita que beforeCreate vuelva a hashear
    );

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
    // Normalizar email antes de buscar
    const normalizedEmail = email.trim().toLowerCase();

    // Buscar usuario por email
    const user = await User.findOne({ where: { email: normalizedEmail } });
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

    // Verificar que la cuenta esté activa (Soft Delete)
    // Se comprueba DESPUÉS de validar la contraseña: solo un usuario que conoce
    // sus credenciales recibe esta información, evitando filtrar si una cuenta existe.
    if (!user.is_active) {
      const error = new Error('Tu cuenta ha sido desactivada. Contacta al administrador.');
      error.statusCode = 403;
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
