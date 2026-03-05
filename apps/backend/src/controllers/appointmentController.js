const appointmentService = require("../services/appointmentService");

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
  async createAppointment(req, res) {
    try {
      const {
        nutritionist_id: nutritionistId,
        appointment_date: appointmentDate,
        start_time: startTime,
        end_time: endTime,
        notes,
      } = req.body;

      const errors = [];

      if (!nutritionistId) {
        errors.push({
          field: "nutritionist_id",
          message: "nutritionist_id es requerido",
        });
      }
      if (!appointmentDate) {
        errors.push({
          field: "appointment_date",
          message: "appointment_date es requerido (YYYY-MM-DD)",
        });
      }
      if (!startTime) {
        errors.push({
          field: "start_time",
          message: "start_time es requerido (HH:mm o HH:mm:ss)",
        });
      }
      if (!endTime) {
        errors.push({
          field: "end_time",
          message: "end_time es requerido (HH:mm o HH:mm:ss)",
        });
      }

      if (errors.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Faltan campos requeridos o hay errores de validación",
          data: { errors },
        });
      }

      const appointment = await appointmentService.createAppointment(
        req.user.id,
        nutritionistId,
        appointmentDate,
        startTime,
        endTime,
        notes || "",
      );

      return res.status(201).json({
        success: true,
        message: "Cita agendada exitosamente",
        data: { appointment },
      });
    } catch (error) {
      console.error("[Appointment Error]:", error);

      // Sequelize validation error (constraints del modelo)
      if (error.name === "SequelizeValidationError") {
        const messages = error.errors.map((e) => e.message);
        return res.status(400).json({
          success: false,
          message: "Error de validación",
          data: { errors: messages },
        });
      }

      // Sequelize DB error (ej: UUID mal formado → PostgreSQL 22P02,
      // violación de FK, constraint único, etc.)
      if (error.name === "SequelizeDatabaseError") {
        const pgCode = error.original && error.original.code;
        let clientMessage = "Error en los datos enviados";
        if (pgCode === "22P02") {
          clientMessage =
            "Formato de UUID inválido en patient_id o nutritionist_id";
        } else if (pgCode === "23503") {
          clientMessage = "El paciente o nutricionista referenciado no existe";
        } else if (pgCode === "23505") {
          clientMessage = "Ya existe una cita con esos datos";
        }
        return res.status(400).json({
          success: false,
          message: clientMessage,
          data: { pg_code: pgCode || null },
        });
      }

      const statusCode = error.statusCode || 500;
      const message =
        statusCode < 500 ? error.message : "Error al agendar la cita";
      return res
        .status(statusCode)
        .json({ success: false, message, data: null });
    }
  }

  async getMyCalendar(req, res) {
    try {
      const appointments = await appointmentService.getMyCalendar(
        req.user.id,
        req.user.role,
      );

      return res.status(200).json({
        success: true,
        message: "Calendario obtenido exitosamente",
        data: { appointments },
      });
    } catch (error) {
      const statusCode = error.statusCode || 500;
      const message =
        statusCode < 500 ? error.message : "Error al obtener el calendario";
      return res
        .status(statusCode)
        .json({ success: false, message, data: null });
    }
  }

  async getAppointmentById(req, res) {
    try {
      const { id: appointmentId } = req.params;

      if (!appointmentId || String(appointmentId).trim() === "") {
        return res.status(400).json({
          success: false,
          message: "ID de cita es requerido",
          data: null,
        });
      }

      const appointment = await appointmentService.getAppointmentById(
        appointmentId,
        req.user.id,
      );

      return res.status(200).json({
        success: true,
        message: "Cita obtenida exitosamente",
        data: { appointment },
      });
    } catch (error) {
      const statusCode = error.statusCode || 500;
      const message =
        statusCode < 500 ? error.message : "Error al obtener la cita";
      return res
        .status(statusCode)
        .json({ success: false, message, data: null });
    }
  }

  async confirmAppointment(req, res) {
    try {
      const { id: appointmentId } = req.params;

      if (!appointmentId || String(appointmentId).trim() === "") {
        return res.status(400).json({
          success: false,
          message: "ID de cita es requerido",
          data: null,
        });
      }

      const appointment = await appointmentService.confirmAppointment(
        appointmentId,
        req.user.id,
      );

      return res.status(200).json({
        success: true,
        message: "Cita confirmada exitosamente",
        data: { appointment },
      });
    } catch (error) {
      const statusCode = error.statusCode || 500;
      const message =
        statusCode < 500 ? error.message : "Error al confirmar la cita";
      return res
        .status(statusCode)
        .json({ success: false, message, data: null });
    }
  }

  async cancelAppointment(req, res) {
    try {
      const { id: appointmentId } = req.params;

      if (!appointmentId || String(appointmentId).trim() === "") {
        return res.status(400).json({
          success: false,
          message: "ID de cita es requerido",
          data: null,
        });
      }

      const appointment = await appointmentService.cancelAppointment(
        appointmentId,
        req.user.id,
      );

      return res.status(200).json({
        success: true,
        message: "Cita cancelada exitosamente",
        data: { appointment },
      });
    } catch (error) {
      const statusCode = error.statusCode || 500;
      const message =
        statusCode < 500 ? error.message : "Error al cancelar la cita";
      return res
        .status(statusCode)
        .json({ success: false, message, data: null });
    }
  }

  // ──────────────────────────────────────────────────────────────
  // PATCH /api/v1/appointments/:id
  // Modificar campos de una cita (solo si está en estado pending)
  // ──────────────────────────────────────────────────────────────
  /**
   * Actualiza uno o más campos de una cita existente.
   * Solo está permitido si la cita está en estado `pending`.
   *
   * Body opcional (al menos uno requerido):
   * {
   *   "appointment_date": "YYYY-MM-DD",
   *   "start_time": "HH:mm",
   *   "end_time":   "HH:mm",
   *   "notes":      "Texto libre"
   * }
   */
  async update(req, res) {
    try {
      const { id: appointmentId } = req.params;

      if (!appointmentId || String(appointmentId).trim() === "") {
        return res.status(400).json({
          success: false,
          message: "ID de cita es requerido",
          data: null,
        });
      }

      const { appointment_date, start_time, end_time, notes } = req.body;

      // Construir el objeto con solo los campos enviados explícitamente
      const updateData = {};
      if (appointment_date !== undefined)
        updateData.appointment_date = appointment_date;
      if (start_time !== undefined) updateData.start_time = start_time;
      if (end_time !== undefined) updateData.end_time = end_time;
      if (notes !== undefined) updateData.notes = notes;

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({
          success: false,
          message:
            "Debes enviar al menos un campo editable: appointment_date, start_time, end_time o notes",
          data: null,
        });
      }

      const appointment = await appointmentService.updateAppointment(
        appointmentId,
        req.user.id,
        updateData,
      );

      return res.status(200).json({
        success: true,
        message: "Cita actualizada exitosamente",
        data: { appointment },
      });
    } catch (error) {
      console.error("[AppointmentController.update]:", error);

      if (error.name === "SequelizeValidationError") {
        const messages = error.errors.map((e) => e.message);
        return res.status(400).json({
          success: false,
          message: "Error de validación",
          data: { errors: messages },
        });
      }

      if (error.name === "SequelizeDatabaseError") {
        const pgCode = error.original && error.original.code;
        const clientMessage =
          pgCode === "22P02"
            ? "Formato de UUID inválido"
            : "Error en los datos enviados";
        return res.status(400).json({
          success: false,
          message: clientMessage,
          data: { pg_code: pgCode || null },
        });
      }

      const statusCode = error.statusCode || 500;
      const message =
        statusCode < 500 ? error.message : "Error al actualizar la cita";
      return res
        .status(statusCode)
        .json({ success: false, message, data: null });
    }
  }
}

module.exports = new AppointmentController();
