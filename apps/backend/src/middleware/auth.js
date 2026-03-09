const jwt = require('jsonwebtoken');

/**
 * Middleware de autenticación JWT
 *
 * Lee el token del header `Authorization: Bearer <token>`,
 * lo verifica y adjunta el payload decodificado en `req.user`.
 *
 * Así los controllers pueden acceder a `req.user.id` para
 * obtener el ID del usuario autenticado sin extraerlo del body.
 */
const authenticate = (req, res, next) => {
  try {
    // 1. Obtener el header
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Token de autenticación requerido',
      });
    }

    // 2. Extraer el token (quitar el prefijo "Bearer ")
    const token = authHeader.split(' ')[1];

    // 3. Verificar y decodificar
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'default-secret-key-change-in-production'
    );

    // 4. Adjuntar el payload al request para uso posterior
    //    decoded contiene: { id, email, role, iat, exp }
    req.user = decoded;

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'El token ha expirado, por favor inicia sesión nuevamente',
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Token inválido',
    });
  }
};

/**
 * Middleware de autorización por rol
 * Uso: router.get('/ruta', authenticate, authorize('nutritionist'), handler)
 *
 * @param {...string} roles - Roles permitidos
 */
const authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: `Acceso denegado. Se requiere uno de los roles: ${roles.join(', ')}`,
    });
  }
  next();
};

module.exports = { authenticate, authorize };
