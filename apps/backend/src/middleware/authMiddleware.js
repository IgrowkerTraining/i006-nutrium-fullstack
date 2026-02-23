/**
 * Middleware de autenticación básico
 * En producción, esto debería verificar un JWT real
 * Por ahora, espera un token en el formato: Bearer <userId>
 * 
 * En producción: Importar jsonwebtoken y verificar JWT real
 * Ejemplo: const jwt = require('jsonwebtoken');
 */

const authenticateUser = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Token no proporcionado o formato inválido',
      });
    }

    // Extraer el token del header
    const token = authHeader.substring(7); // Quitar "Bearer "

    // TODO: En producción, verificar JWT real con jwt.verify()
    // const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // req.user = decoded;

    // Por ahora: asumir que el token es el userId (para desarrollo)
    if (!token || token.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Token inválido',
      });
    }

    // Inyectar usuario en request (en producción, esto vendría del JWT)
    req.user = {
      id: token, // En producción, esto sería decoded.userId
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Error al verificar token',
      error: error.message,
    });
  }
};

module.exports = { authenticateUser };
