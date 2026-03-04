const appointmentService = require('../services/appointmentService');

/**
 * AppointmentController
 *
 * Responsabilidades:
 *  - Extraer y validar los datos de `req` (body, params, user).
 *  - Llamar al método correspondiente del Service.
 *  - Formatear y devolver la respuesta HTTP.
 *  - Delegar cualquier lógica de negocio al Service, NUNCA aquí.
 */
class AppointmentController {
  // ──────────────────────────────────────────────────────────────
  // POST /api/v1/appointments
  // ──────────────────────────────────────────────────────────────
  /**
   * Crea una nueva cita entre el usuario autenticado (paciente)
   * y un nutricionista especificado.
   *
   * Body esperado:
   * {
   *   "nutritionistId": "uuid-del-nutricionista",
   *   "date": "2026-03-15T10:00:00Z",
   *   "notes": "Tengo problemas con digestión" (opcional)
   * }
   *
   * Requiere: Bearer token con role 'patient'
   */
  async createAppointment(req, res) {
    try {
      const { nutritionistId, date, notes } = req.body;

      // ── Validaciones ──────────────────────────────────────────
      const errors = [];

      if (!nutritionistId || String(nutritionistId).trim() === '') {
        errors.push({ field: 'nutritionistId', message: 'nutritionistId es requerido' });
      }

      if (!date || String(date).trim() === '') {
        errors.push({ field: 'date', message: 'date es requerido (formato ISO: YYYY-MM-DDTHH:mm:ssZ)' });
      } else {
        const parsed = new Date(date);
        if (isNaN(parsed.getTime())) {
          errors.push({ field: 'date', message: 'date debe ser una fecha válida en formato ISO' });
        }
      }

      if (errors.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Faltan campos requeridos o hay errores de validación',
          errors,
        });
      }

      // ── Llamar al servicio ────────────────────────────────────
      const appointment = await appointmentService.createAppointment(
        req.user.id,      // patientId desde JWT
        nutritionistId,
        date,
        notes || ''
      );

      return res.status(201).json({
        success: true,
        message: 'Cita agendada exitosamente',
        data: { appointment },
      });
    } catch (error) {
      console.error('[AppointmentController.createAppointment]', error.message);

      const statusCode = error.statusCode || 500;
      const message = statusCode < 500 ? error.message : 'Error al agendar la cita';
      return res.status(statusCode).json({ success: false, message });
    }
  }

  // ──────────────────────────────────────────────────────────────
  // GET /api/v1/appointments/my-calendar
  // ──────────────────────────────────────────────────────────────
  /**
   * Devuelve el listado de citas asociadas al usuario autenticado.
   *
   * Funciona tanto para pacientes como para nutricionistas:
   *   - Si es paciente: devuelve todas sus citas agendadas
   *   - Si es nutricionista: devuelve todas sus citas como profesional
   *
   * Query params: ninguno requerido
   *
   * Requiere: Bearer token
   */
  async getMyCalendar(req, res) {
    try {
      const appointments = await appointmentService.getMyCalendar(
        req.user.id,      // userId desde JWT
        req.user.role     // role desde JWT
      );

      return res.status(200).json({
        success: true,
        message: 'Calendario obtenido exitosamente',
        data: { appointments },
      });
    } catch (error) {
      console.error('[AppointmentController.getMyCalendar]', error.message);

      const statusCode = error.statusCode || 500;
      const message = statusCode < 500 ? error.message : 'Error al obtener el calendario';
      return res.status(statusCode).json({ success: false, message });
    }
  }

  // ──────────────────────────────────────────────────────────────
  // POST /api/v1/appointments/:id/review
  // ──────────────────────────────────────────────────────────────
  /**
   * Permite al paciente dejar una reseña sobre una cita concluida.
   *
   * Params:
   *   id: ID de la cita
   *
   * Body esperado:
   * {
   *   "rating": 5,                           ← requerido (1-5)
   *   "comment": "Excelente atención"        ← opcional
   * }
   *
   * Requiere: Bearer token con role 'patient'
   * Validaciones adicionales:
   *   - La cita debe pertenecer al usuario autenticado
   *   - La fecha de la cita debe haber pasado
   *   - No debe estar cancelada
   */
  async addReview(req, res) {
    try {
      const { id: appointmentId } = req.params;
      const { rating, comment } = req.body;

      // ── Validaciones ──────────────────────────────────────────
      const errors = [];

      if (!appointmentId || String(appointmentId).trim() === '') {
        errors.push({ field: 'id', message: 'ID de cita es requerido' });
      }

      if (rating === undefined || rating === null || String(rating).trim() === '') {
        errors.push({ field: 'rating', message: 'rating es requerido (número 1-5)' });
      } else {
        const ratingNum = Number(rating);
        if (!Number.isInteger(ratingNum) || ratingNum < 1 || ratingNum > 5) {
          errors.push({
            field: 'rating',
            message: 'rating debe ser un número entero entre 1 y 5',
          });
        }
      }

      if (errors.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Faltan campos requeridos o hay errores de validación',
          errors,
        });
      }

      // ── Llamar al servicio ────────────────────────────────────
      const appointment = await appointmentService.addReview(
        appointmentId,
        req.user.id,      // patientId desde JWT
        rating,
        comment || ''
      );

      return res.status(200).json({
        success: true,
        message: 'Reseña añadida exitosamente',
        data: { appointment },
      });
    } catch (error) {
      console.error('[AppointmentController.addReview]', error.message);

      const statusCode = error.statusCode || 500;
      const message = statusCode < 500 ? error.message : 'Error al añadir la reseña';
      return res.status(statusCode).json({ success: false, message });
    }
  }

  // ──────────────────────────────────────────────────────────────
  // GET /api/v1/appointments/:id
  // ──────────────────────────────────────────────────────────────
  /**
   * Obtiene los detalles de una cita específica.
   * Solo el paciente o nutricionista pueden ver la cita.
   *
   * Params:
   *   id: ID de la cita
   *
   * Requiere: Bearer token
   */
  async getAppointmentById(req, res) {
    try {
      const { id: appointmentId } = req.params;

      if (!appointmentId || String(appointmentId).trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'ID de cita es requerido',
        });
      }

      const appointment = await appointmentService.getAppointmentById(
        appointmentId,
        req.user.id
      );

      return res.status(200).json({
        success: true,
        message: 'Cita obtenida exitosamente',
        data: { appointment },
      });
    } catch (error) {
      console.error('[AppointmentController.getAppointmentById]', error.message);

      const statusCode = error.statusCode || 500;
      const message = statusCode < 500 ? error.message : 'Error al obtener la cita';
      return res.status(statusCode).json({ success: false, message });
    }
  }

  // ──────────────────────────────────────────────────────────────
  // DELETE /api/v1/appointments/:id
  // ──────────────────────────────────────────────────────────────
  /**
   * Cancela una cita existente.
   * Solo puede cancelarse si está en estado 'scheduled'.
   *
   * Params:
   *   id: ID de la cita
   *
   * Requiere: Bearer token
   */
  async cancelAppointment(req, res) {
    try {
      const { id: appointmentId } = req.params;

      if (!appointmentId || String(appointmentId).trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'ID de cita es requerido',
        });
      }

      const appointment = await appointmentService.cancelAppointment(
        appointmentId,
        req.user.id
      );

      return res.status(200).json({
        success: true,
        message: 'Cita cancelada exitosamente',
        data: { appointment },
      });
    } catch (error) {
      console.error('[AppointmentController.cancelAppointment]', error.message);

      const statusCode = error.statusCode || 500;
      const message = statusCode < 500 ? error.message : 'Error al cancelar la cita';
      return res.status(statusCode).json({ success: false, message });
    }
  }
}

module.exports = new AppointmentController();
