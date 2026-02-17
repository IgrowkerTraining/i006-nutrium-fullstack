const userService = require('../services/userService');

class AuthController {
  /**
   * Registro de nuevo usuario
   * POST /api/v1/auth/register
   * Body: { name, email, password, role? }
   */
  async register(req, res) {
    try {
      const { name, email, password, role } = req.body;

      // Validar campos requeridos
      if (!name || !email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Los campos nombre, email y contraseña son requeridos',
        });
      }

      // Crear usuario en la BD
      const user = await userService.createUser({
        name,
        email,
        password,
        role,
      });

      // Respuesta exitosa
      return res.status(201).json({
        success: true,
        message: 'Usuario registrado exitosamente',
        data: { user },
      });
    } catch (error) {
      console.error('Error en registro:', error.message);

      // Errores de validación (email duplicado, etc)
      if (error.statusCode === 400) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      // Error de servidor
      return res.status(500).json({
        success: false,
        message: 'Error al registrar el usuario',
      });
    }
  }

  /**
   * Inicio de sesión de usuario
   * POST /api/v1/auth/login
   * Body: { email, password }
   */
  async login(req, res) {
    try {
      const { email, password } = req.body;

      // Validar campos requeridos
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email y contraseña son requeridos',
        });
      }

      // Autenticar usuario y generar JWT
      const { user, token } = await userService.loginUser(email, password);

      // Respuesta exitosa
      return res.status(200).json({
        success: true,
        message: 'Login exitoso',
        data: {
          user,
          token,
        },
      });
    } catch (error) {
      console.error('Error en login:', error.message);

      // Errores de autenticación
      if (error.statusCode === 401) {
        return res.status(401).json({
          success: false,
          message: error.message,
        });
      }

      // Error de servidor
      return res.status(500).json({
        success: false,
        message: 'Error al iniciar sesión',
      });
    }
  }
}

module.exports = new AuthController();
