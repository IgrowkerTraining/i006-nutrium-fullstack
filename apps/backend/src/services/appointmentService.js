const { Appointment, User } = require("../models");
const { Op } = require("sequelize");

/**
 * AppointmentService
 *
 * Encapsula toda la lógica de negocio del módulo de citas.
 * El Controller solo llamaré estos métodos y delegará validaciones de BD aquí.
 */
class AppointmentService {
  // ─────────────────────────────────────────────────────────────
  // POST: Crear una nueva cita
  // ─────────────────────────────────────────────────────────────
  /**
   * Crea una nueva cita entre paciente y nutricionista.
   * Validaciones:
   *   - La fecha debe ser futura
   *   - El nutricionista debe ser un usuario válido
   *   - El paciente debe ser el usuario autenticado
   *
   * @param {string} patientId        - UUID del usuario autenticado (paciente)
   * @param {string} nutritionistId   - UUID del nutricionista
   * @param {string} date             - Fecha/hora ISO de la cita
   * @param {string} notes            - Notas opcionales del paciente
   * @returns {Object} Cita creada
   * @throws {Error} Si validaciones fallan
   */
  async createAppointment(patientId, nutritionistId, date, notes = "") {
    // 1. Validaciones básicas
    if (!patientId || !nutritionistId || !date) {
      const error = new Error(
        "patientId, nutritionistId y date son requeridos",
      );
      error.statusCode = 400;
      throw error;
    }

    // 2. Validar que la fecha sea futura
    const appointmentDate = new Date(date);
    if (isNaN(appointmentDate.getTime())) {
      const error = new Error("date debe ser una fecha válida en formato ISO");
      error.statusCode = 400;
      throw error;
    }

    const now = new Date();
    if (appointmentDate <= now) {
      const error = new Error("La fecha de la cita debe ser en el futuro");
      error.statusCode = 400;
      throw error;
    }

    // 3. Validar que el nutricionista exista y sea usuario activo
    const nutritionist = await User.findByPk(nutritionistId);
    if (!nutritionist) {
      const error = new Error("El nutricionista especificado no existe");
      error.statusCode = 404;
      throw error;
    }

    // 4. Validar que el nutricionista tenga rol de nutricionista
    if (nutritionist.role !== "nutritionist") {
      const error = new Error("El usuario especificado no es un nutricionista");
      error.statusCode = 400;
      throw error;
    }

    // 5. Validar que el paciente exista
    const patient = await User.findByPk(patientId);
    if (!patient) {
      const error = new Error("El paciente especificado no existe");
      error.statusCode = 404;
      throw error;
    }

    // 6. Validar que el paciente tenga rol de patient
    if (patient.role !== "patient") {
      const error = new Error("El usuario autenticado no es un paciente");
      error.statusCode = 400;
      throw error;
    }

    // 7. Crear la cita
    const appointment = await Appointment.create({
      patient_id: patientId,
      nutritionist_id: nutritionistId,
      date: appointmentDate,
      notes: notes?.trim() || null,
      status: "scheduled",
    });

    return appointment;
  }

  // ─────────────────────────────────────────────────────────────
  // GET: Obtener calendario del usuario autenticado
  // ─────────────────────────────────────────────────────────────
  /**
   * Devuelve todas las citas del usuario autenticado.
   * Si es paciente, filtra por patient_id.
   * Si es nutricionista, filtra por nutritionist_id.
   *
   * Ordenado cronológicamente (ASC por fecha).
   *
   * @param {string} userId - UUID del usuario autenticado
   * @param {string} role   - Rol del usuario ('patient' o 'nutritionist')
   * @returns {Array} Array de citas ordenadas by fecha
   * @throws {Error} Si las validaciones fallan
   */
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

    // Construir el filtro según el rol
    const whereClause =
      role === "patient" ? { patient_id: userId } : { nutritionist_id: userId };

    // Buscar todas las citas del usuario
    const appointments = await Appointment.findAll({
      where: whereClause,
      include: [
        // Incluir datos del paciente
        {
          model: User,
          as: "patient",
          attributes: ["id", "email", "first_name", "last_name"],
        },
        // Incluir datos del nutricionista
        {
          model: User,
          as: "nutritionist",
          attributes: ["id", "email", "first_name", "last_name"],
        },
      ],
      order: [["date", "ASC"]],
    });

    return appointments;
  }

  // ─────────────────────────────────────────────────────────────
  // POST: Agregar reseña a una cita concluida
  // ─────────────────────────────────────────────────────────────
  /**
   * Permite a un paciente dejar una reseña sobre una cita.
   *
   * Validaciones:
   *   - La cita debe existir
   *   - La cita debe pertenecer al paciente autenticado
   *   - El rating debe estar entre 1 y 5
   *   - La cita puede estar en estado 'completed' o 'scheduled'
   *
   * @param {string} appointmentId - ID de la cita
   * @param {string} patientId     - UUID del paciente autenticado
   * @param {number} rating        - Calificación (1-5)
   * @param {string} comment       - Comentario de la reseña
   * @returns {Object} Cita actualizada con la reseña
   * @throws {Error} Si validaciones fallan
   */
  async addReview(appointmentId, patientId, rating, comment) {
    // 1. Validaciones básicas
    if (!appointmentId || !patientId || rating === undefined) {
      const error = new Error(
        "appointmentId, patientId y rating son requeridos",
      );
      error.statusCode = 400;
      throw error;
    }

    // 2. Validar rating
    const ratingNum = Number(rating);
    if (!Number.isInteger(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      const error = new Error("rating debe ser un número entero entre 1 y 5");
      error.statusCode = 400;
      throw error;
    }

    // 3. Buscar la cita
    const appointment = await Appointment.findByPk(appointmentId);
    if (!appointment) {
      const error = new Error("La cita especificada no existe");
      error.statusCode = 404;
      throw error;
    }

    // 4. Verificar que la cita pertenezca al paciente
    if (appointment.patient_id !== patientId) {
      const error = new Error(
        "No tienes permiso para dejar reseña en esta cita",
      );
      error.statusCode = 403;
      throw error;
    }

    // 5. Verificar que la cita ya haya pasado (opcional pero recomendado)
    const now = new Date();
    if (appointment.date > now) {
      const error = new Error(
        "Solo puedes dejar reseña después de que la cita haya concluido",
      );
      error.statusCode = 400;
      throw error;
    }

    // 6. Verificar que la cita no sea cancelada
    if (appointment.status === "cancelled") {
      const error = new Error("No puedes dejar reseña en una cita cancelada");
      error.statusCode = 400;
      throw error;
    }

    // 7. Actualizar la cita con los datos de la reseña
    await appointment.update({
      review_rating: ratingNum,
      review_comment: comment?.trim() || null,
      status: "completed", // Marcar como completada cuando se deja reseña
    });

    // 8. Recargar para devolver datos actualizados
    const updated = await Appointment.findByPk(appointmentId, {
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

    return updated;
  }

  // ─────────────────────────────────────────────────────────────
  // GET: Obtener detalles de una cita específica
  // ─────────────────────────────────────────────────────────────
  /**
   * Devuelve los detalles completos de una cita específica.
   * Incluye información del paciente y nutricionista.
   *
   * @param {string} appointmentId - ID de la cita
   * @param {string} userId        - UUID del usuario autenticado (para validación de acceso)
   * @returns {Object} Cita con detalles completos
   * @throws {Error} Si la cita no existe o no tiene permiso
   */
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

    // Verificar que el usuario tenga acceso (sea paciente o nutricionista de la cita)
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

  // ─────────────────────────────────────────────────────────────
  // DELETE/PUT: Cancelar una cita
  // ─────────────────────────────────────────────────────────────
  /**
   * Cancela una cita existente.
   * Solo puede cancelarse si está en estado 'scheduled'.
   *
   * @param {string} appointmentId - ID de la cita
   * @param {string} userId        - UUID del usuario autenticado
   * @returns {Object} Cita actualizada con status 'cancelled'
   * @throws {Error} Si validaciones fallan
   */
  async cancelAppointment(appointmentId, userId) {
    const appointment = await Appointment.findByPk(appointmentId);

    if (!appointment) {
      const error = new Error("La cita especificada no existe");
      error.statusCode = 404;
      throw error;
    }

    // Verificar que el usuario sea el paciente o nutricionista
    if (
      appointment.patient_id !== userId &&
      appointment.nutritionist_id !== userId
    ) {
      const error = new Error("No tienes permiso para cancelar esta cita");
      error.statusCode = 403;
      throw error;
    }

    // Verificar que no esté cancelada o completada
    if (appointment.status === "cancelled") {
      const error = new Error("La cita ya está cancelada");
      error.statusCode = 400;
      throw error;
    }

    if (appointment.status === "completed") {
      const error = new Error("No puedes cancelar una cita ya completada");
      error.statusCode = 400;
      throw error;
    }

    await appointment.update({ status: "cancelled" });

    return appointment;
  }
}

module.exports = new AppointmentService();
