const patientService = require('../services/patientService');
const ResponseHelper = require('../utils/responseHelper');

class PatientController {
  /**
   * GET /api/v1/patients/profile
   * Obtiene el perfil del paciente autenticado
   * 
   * Headers requeridos:
   * - Authorization: Bearer <token>
   * 
   * @param {Request} req - req.user.id debe estar inyectado por middleware de auth
   * @param {Response} res
   */
  async getProfile(req, res) {
    try {
      const userId = req.user.id;

      if (!userId) {
        return ResponseHelper.error(res, 'Usuario no autenticado', 401);
      }

      const profile = await patientService.getProfile(userId);

      if (!profile) {
        return ResponseHelper.success(res, null, 'No hay perfil registrado', 200);
      }

      return ResponseHelper.success(res, profile, 'Perfil obtenido exitosamente', 200);
    } catch (error) {
      console.error('Error en getProfile:', error);
      return ResponseHelper.error(res, 'Error al obtener perfil', 500, error.message);
    }
  }

  /**
   * POST /api/v1/patients/profile
   * Crea o actualiza el perfil del paciente
   * 
   * Headers requeridos:
   * - Authorization: Bearer <token>
   * 
   * Body requeridos:
   * - nombreCompleto: string
   * - fechaNacimiento: date (YYYY-MM-DD)
   * - pais: string
   * - ciudad: string
   * - modalidad: enum (Virtual|Presencial|Mixto)
   * - disponibilidad: enum (Mañana|Tarde)
   * - objetivo: enum (ver opciones en documento)
   * 
   * @param {Request} req
   * @param {Response} res
   */
  async createOrUpdateProfile(req, res) {
    try {
      const userId = req.user.id;

      if (!userId) {
        return ResponseHelper.error(res, 'Usuario no autenticado', 401);
      }

      const { nombreCompleto, fechaNacimiento, pais, ciudad, modalidad, disponibilidad, objetivo } = req.body;

      // === Validaciones de campos requeridos ===
      const errors = [];

      if (!nombreCompleto || nombreCompleto.trim() === '') {
        errors.push({ field: 'nombreCompleto', message: 'nombreCompleto es requerido' });
      }

      if (!fechaNacimiento) {
        errors.push({ field: 'fechaNacimiento', message: 'fechaNacimiento es requerida' });
      } else {
        // Validar que sea una fecha válida
        const date = new Date(fechaNacimiento);
        if (isNaN(date.getTime())) {
          errors.push({ field: 'fechaNacimiento', message: 'fechaNacimiento debe ser una fecha válida (YYYY-MM-DD)' });
        }
      }

      if (!pais || pais.trim() === '') {
        errors.push({ field: 'pais', message: 'pais es requerido' });
      }

      if (!ciudad || ciudad.trim() === '') {
        errors.push({ field: 'ciudad', message: 'ciudad es requerida' });
      }

      if (!modalidad) {
        errors.push({ field: 'modalidad', message: 'modalidad es requerida' });
      }

      if (!disponibilidad) {
        errors.push({ field: 'disponibilidad', message: 'disponibilidad es requerida' });
      }

      if (!objetivo) {
        errors.push({ field: 'objetivo', message: 'objetivo es requerido' });
      }

      if (errors.length > 0) {
        return ResponseHelper.validationError(res, errors);
      }

      // === Llamar al servicio ===
      const updatedProfile = await patientService.upsertProfile(userId, {
        nombreCompleto,
        fechaNacimiento,
        pais,
        ciudad,
        modalidad,
        disponibilidad,
        objetivo,
      });

      return ResponseHelper.success(
        res,
        updatedProfile,
        'Perfil actualizado exitosamente',
        201
      );
    } catch (error) {
      console.error('Error en createOrUpdateProfile:', error);

      // Capturar errores de validación del modelo
      if (error.message.includes('inválida') || error.message.includes('inválido') || error.message.includes('Permitidas')) {
        return ResponseHelper.error(res, error.message, 400);
      }

      return ResponseHelper.error(res, 'Error al actualizar perfil', 500, error.message);
    }
  }

  /**
   * GET /api/v1/patients/tags
   * Obtiene las etiquetas (condiciones de salud) del paciente
   * 
   * Headers requeridos:
   * - Authorization: Bearer <token>
   * 
   * @param {Request} req
   * @param {Response} res
   */
  async getTags(req, res) {
    try {
      const userId = req.user.id;

      if (!userId) {
        return ResponseHelper.error(res, 'Usuario no autenticado', 401);
      }

      const tags = await patientService.getTags(userId);

      return ResponseHelper.success(res, tags, 'Tags obtenidos exitosamente', 200);
    } catch (error) {
      console.error('Error en getTags:', error);
      return ResponseHelper.error(res, 'Error al obtener tags', 500, error.message);
    }
  }

  /**
   * POST /api/v1/patients/tags
   * Agrega o actualiza las etiquetas del paciente
   * 
   * Headers requeridos:
   * - Authorization: Bearer <token>
   * 
   * Body opcionales:
   * - condiciones: array de strings (ver opciones permitidas en documento)
   * - otraCondicion: string (texto libre)
   * 
   * @param {Request} req
   * @param {Response} res
   */
  async createOrUpdateTags(req, res) {
    try {
      const userId = req.user.id;

      if (!userId) {
        return ResponseHelper.error(res, 'Usuario no autenticado', 401);
      }

      const { condiciones, otraCondicion } = req.body;

      // === Validaciones ===
      const errors = [];

      // Validar que condiciones sea un array si se proporciona
      if (condiciones !== undefined && !Array.isArray(condiciones)) {
        errors.push({ field: 'condiciones', message: 'condiciones debe ser un array de strings' });
      }

      // Validar que otraCondicion sea string si se proporciona
      if (otraCondicion !== undefined && typeof otraCondicion !== 'string') {
        errors.push({ field: 'otraCondicion', message: 'otraCondicion debe ser un string' });
      }

      if (errors.length > 0) {
        return ResponseHelper.validationError(res, errors);
      }

      // === Llamar al servicio ===
      const updatedTags = await patientService.updateTags(userId, {
        condiciones: condiciones || [],
        otraCondicion: otraCondicion || null,
      });

      return ResponseHelper.success(res, updatedTags, 'Tags actualizados exitosamente', 201);
    } catch (error) {
      console.error('Error en createOrUpdateTags:', error);

      // Capturar errores de validación
      if (error.message.includes('inválidas') || error.message.includes('Permitidas')) {
        return ResponseHelper.error(res, error.message, 400);
      }

      return ResponseHelper.error(res, 'Error al actualizar tags', 500, error.message);
    }
  }
}

module.exports = new PatientController();
