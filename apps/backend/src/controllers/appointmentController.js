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
}

module.exports = new AppointmentController();
