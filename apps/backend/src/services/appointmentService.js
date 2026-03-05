const { Appointment, User } = require("../models");
const { Op } = require("sequelize");

/**
 * AppointmentService
 *
 * Encapsula toda la lógica de negocio del módulo de citas.
 * El Controller solo llamaré estos métodos y delegará validaciones de BD aquí.
 */
class AppointmentService {
  parseDateOnly(value) {
    if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const error = new Error("appointment_date debe tener formato YYYY-MM-DD");
      error.statusCode = 400;
      throw error;
    }

    const parsed = new Date(`${value}T00:00:00.000Z`);
    if (Number.isNaN(parsed.getTime())) {
      const error = new Error("appointment_date no es una fecha válida");
      error.statusCode = 400;
      throw error;
    }

    return value;
  }

  normalizeTime(value, fieldName) {
    if (!value || !/^\d{2}:\d{2}(:\d{2})?$/.test(value)) {
      const error = new Error(
        `${fieldName} debe tener formato HH:mm o HH:mm:ss`,
      );
      error.statusCode = 400;
      throw error;
    }

    return value.length === 5 ? `${value}:00` : value;
  }

  validateTimeRange(startTime, endTime) {
    if (startTime >= endTime) {
      const error = new Error("start_time debe ser menor que end_time");
      error.statusCode = 400;
      throw error;
    }
  }

  async validateParticipants(patientId, nutritionistId) {
    const [patient, nutritionist] = await Promise.all([
      User.findByPk(patientId),
      User.findByPk(nutritionistId),
    ]);

    if (!patient) {
      const error = new Error("El paciente especificado no existe");
      error.statusCode = 404;
      throw error;
    }

    if (patient.role !== "patient") {
      const error = new Error("El usuario autenticado no es un paciente");
      error.statusCode = 400;
      throw error;
    }

    if (!nutritionist) {
      const error = new Error("El nutricionista especificado no existe");
      error.statusCode = 404;
      throw error;
    }

    if (nutritionist.role !== "nutritionist") {
      const error = new Error("El usuario especificado no es un nutricionista");
      error.statusCode = 400;
      throw error;
    }
  }

  async ensureNoDoubleBooking(
    nutritionistId,
    appointmentDate,
    startTime,
    endTime,
  ) {
    // Overlapping condition: (new_start < exist_end) AND (new_end > exist_start)
    // Since start_time and end_time are different columns, they are safe as
    // separate top-level keys – Sequelize ANDs all string-keyed conditions
    // implicitly, avoiding the [Op.and]+string-key mixing bug.
    const overlap = await Appointment.findOne({
      where: {
        nutritionist_id: nutritionistId,
        appointment_date: appointmentDate,
        status: { [Op.ne]: "cancelled" },
        start_time: { [Op.lt]: endTime }, // existing_start < new_end
        end_time: { [Op.gt]: startTime }, // existing_end   > new_start
      },
    });

    if (overlap) {
      const error = new Error(
        "El nutricionista ya tiene un turno en ese rango horario",
      );
      error.statusCode = 409;
      throw error;
    }
  }

  async createAppointment(
    patientId,
    nutritionistId,
    appointmentDate,
    startTime,
    endTime,
    notes = "",
  ) {
    if (
      !patientId ||
      !nutritionistId ||
      !appointmentDate ||
      !startTime ||
      !endTime
    ) {
      const error = new Error(
        "patientId, nutritionistId, appointmentDate, startTime y endTime son requeridos",
      );
      error.statusCode = 400;
      throw error;
    }

    const normalizedDate = this.parseDateOnly(appointmentDate);
    const normalizedStart = this.normalizeTime(startTime, "start_time");
    const normalizedEnd = this.normalizeTime(endTime, "end_time");
    this.validateTimeRange(normalizedStart, normalizedEnd);

    await this.validateParticipants(patientId, nutritionistId);
    await this.ensureNoDoubleBooking(
      nutritionistId,
      normalizedDate,
      normalizedStart,
      normalizedEnd,
    );

    return Appointment.create({
      patient_id: patientId,
      nutritionist_id: nutritionistId,
      appointment_date: normalizedDate,
      start_time: normalizedStart,
      end_time: normalizedEnd,
      notes: notes?.trim() || null,
      status: "pending",
    });
  }

  async getMyCalendar(userId, role) {
    if (!userId || !role) {
      const error = new Error("userId y role son requeridos");
      error.statusCode = 400;
      throw error;
    }

    if (!["patient", "nutritionist"].includes(role)) {
      const error = new Error('role debe ser "patient" o "nutritionist"');
      error.statusCode = 400;
      throw error;
    }

    const whereClause =
      role === "patient" ? { patient_id: userId } : { nutritionist_id: userId };

    return Appointment.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: "patient",
          attributes: ["id", "email", "first_name", "last_name"],
        },
        {
          model: User,
          as: "nutritionist",
          attributes: ["id", "email", "first_name", "last_name"],
        },
      ],
      order: [
        ["appointment_date", "ASC"],
        ["start_time", "ASC"],
      ],
    });
  }

  async getAppointmentById(appointmentId, userId) {
    const appointment = await Appointment.findByPk(appointmentId, {
      include: [
        {
          model: User,
          as: "patient",
          attributes: ["id", "email", "first_name", "last_name"],
        },
        {
          model: User,
          as: "nutritionist",
          attributes: ["id", "email", "first_name", "last_name"],
        },
      ],
    });

    if (!appointment) {
      const error = new Error("La cita especificada no existe");
      error.statusCode = 404;
      throw error;
    }

    if (
      appointment.patient_id !== userId &&
      appointment.nutritionist_id !== userId
    ) {
      const error = new Error("No tienes permiso para ver esta cita");
      error.statusCode = 403;
      throw error;
    }

    return appointment;
  }

  async updateStatus(appointmentId, userId, nextStatus) {
    if (!["confirmed", "cancelled"].includes(nextStatus)) {
      const error = new Error("Estado de transición no soportado");
      error.statusCode = 400;
      throw error;
    }

    const appointment = await Appointment.findByPk(appointmentId);

    if (!appointment) {
      const error = new Error("La cita especificada no existe");
      error.statusCode = 404;
      throw error;
    }

    if (
      appointment.patient_id !== userId &&
      appointment.nutritionist_id !== userId
    ) {
      const error = new Error("No tienes permiso para actualizar esta cita");
      error.statusCode = 403;
      throw error;
    }

    if (appointment.status === nextStatus) {
      const error = new Error(`La cita ya está en estado ${nextStatus}`);
      error.statusCode = 400;
      throw error;
    }

    if (appointment.status === "cancelled") {
      const error = new Error(
        "No se puede cambiar el estado de una cita cancelada",
      );
      error.statusCode = 400;
      throw error;
    }

    await appointment.update({ status: nextStatus });
    return appointment;
  }

  async confirmAppointment(appointmentId, userId) {
    return this.updateStatus(appointmentId, userId, "confirmed");
  }

  async cancelAppointment(appointmentId, userId) {
    return this.updateStatus(appointmentId, userId, "cancelled");
  }
  // ─────────────────────────────────────────────────────────────
  // Double-booking excluyendo la cita que se está editando
  // ─────────────────────────────────────────────────────────────
  /**
   * Igual que ensureNoDoubleBooking pero ignora el appointmentId
   * indicado  —necesario al editar para que la cita no colisione
   * consigo misma.
   *
   * La clave es el predicado `[Op.ne]: excludeId` en la cláusula
   * WHERE, que descarta la fila de la propia cita antes de buscar
   * solapamientos.
   *
   * @param {string} nutritionistId
   * @param {string} appointmentDate  YYYY-MM-DD
   * @param {string} startTime        HH:mm:ss
   * @param {string} endTime          HH:mm:ss
   * @param {string} excludeId        ID de la cita que se está editando
   */
  async ensureNoDoubleBookingExcluding(
    nutritionistId,
    appointmentDate,
    startTime,
    endTime,
    excludeId,
  ) {
    // Same flat-key approach: no [Op.and] mixing, all conditions ANDed
    // implicitly at the top level of the where object.
    const overlap = await Appointment.findOne({
      where: {
        id: { [Op.ne]: excludeId }, // exclude current appointment
        nutritionist_id: nutritionistId,
        appointment_date: appointmentDate,
        status: { [Op.ne]: "cancelled" },
        start_time: { [Op.lt]: endTime }, // existing_start < new_end
        end_time: { [Op.gt]: startTime }, // existing_end   > new_start
      },
    });

    if (overlap) {
      const error = new Error(
        "El nutricionista ya tiene un turno en ese rango horario",
      );
      error.statusCode = 409;
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // PATCH – modificar una cita existente (solo si está pending)
  // ─────────────────────────────────────────────────────────────
  /**
   * Actualiza appointment_date, start_time, end_time y/o notes
   * de una cita que pertenezca al usuario autenticado, siempre
   * y cuando la cita esté en estado `pending`.
   *
   * @param {string} appointmentId
   * @param {string} userId          ID del usuario autenticado
   * @param {Object} updateData      Campos opcionales a modificar
   * @returns {Appointment}
   */
  async updateAppointment(appointmentId, userId, updateData) {
    if (!appointmentId) {
      const error = new Error("appointmentId es requerido");
      error.statusCode = 400;
      throw error;
    }

    // Regla 1: buscar la cita y verificar que pertenezca al usuario
    const appointment = await Appointment.findByPk(appointmentId);

    if (!appointment) {
      const error = new Error("La cita especificada no existe");
      error.statusCode = 404;
      throw error;
    }

    if (
      appointment.patient_id !== userId &&
      appointment.nutritionist_id !== userId
    ) {
      const error = new Error("No tienes permiso para modificar esta cita");
      error.statusCode = 403;
      throw error;
    }

    // Regla 2: solo citas en estado `pending` pueden editarse
    if (appointment.status !== "pending") {
      const error = new Error(
        `Solo se pueden modificar citas en estado "pending". Estado actual: "${appointment.status}"`,
      );
      error.statusCode = 400;
      throw error;
    }

    // Normalizar y validar los campos de tiempo que lleguen en el body
    const updatedDate = updateData.appointment_date
      ? this.parseDateOnly(updateData.appointment_date)
      : appointment.appointment_date;

    const updatedStart = updateData.start_time
      ? this.normalizeTime(updateData.start_time, "start_time")
      : appointment.start_time;

    const updatedEnd = updateData.end_time
      ? this.normalizeTime(updateData.end_time, "end_time")
      : appointment.end_time;

    this.validateTimeRange(String(updatedStart), String(updatedEnd));

    // Regla 3: si cambia la fecha/hora, re-validar double-booking
    // excluyendo la propia cita con [Op.ne]: appointmentId
    const isTimeChanged =
      updateData.appointment_date ||
      updateData.start_time ||
      updateData.end_time;

    if (isTimeChanged) {
      await this.ensureNoDoubleBookingExcluding(
        appointment.nutritionist_id,
        updatedDate,
        String(updatedStart),
        String(updatedEnd),
        appointmentId,
      );
    }

    // Construir payload con solo los campos que llegaron
    const updatePayload = {};
    if (updateData.appointment_date)
      updatePayload.appointment_date = updatedDate;
    if (updateData.start_time) updatePayload.start_time = updatedStart;
    if (updateData.end_time) updatePayload.end_time = updatedEnd;
    if (updateData.notes !== undefined)
      updatePayload.notes = updateData.notes?.trim() || null;

    await appointment.update(updatePayload);
    return appointment;
  }
}

module.exports = new AppointmentService();
