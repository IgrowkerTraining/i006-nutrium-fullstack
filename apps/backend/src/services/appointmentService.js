const {
  Appointment,
  User,
  NutritionistProfile,
  Availability,
} = require("../models");
const { Op } = require("sequelize");

/**
 * AppointmentService
 *
 * Encapsula toda la lógica de negocio del módulo de citas.
 * El Controller solo llamará estos métodos y delegará validaciones de BD aquí.
 */
class AppointmentService {
  // ─────────────────────────────────────────────────────────────
  // HELPERS DE VALIDACIÓN Y NORMALIZACIÓN
  // ─────────────────────────────────────────────────────────────

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

  /**
   * Valida que la combinación de fecha y hora de inicio sea estrictamente
   * futura respecto al momento actual.
   *
   * IMPORTANTE — Manejo de timezone:
   *   Los campos `appointment_date` y `start_time` llegan como strings
   *   naive (sin offset).  Para comparar correctamente contra "ahora"
   *   se construye el timestamp de la cita descomponiendo las partes
   *   numéricas y usando Date.UTC(), de modo que la comparación es
   *   siempre en UTC puro, independientemente del TZ del servidor.
   *   El frontend debe enviar los horarios en UTC (ver AppointmentModal.tsx).
   *
   * @param {string} dateString   YYYY-MM-DD  (ya normalizado)
   * @param {string} timeString   HH:mm:ss    (ya normalizado)
   */
  validateFutureDate(dateString, timeString) {
    // Descomponemos las partes para construir un timestamp UTC explícito,
    // evitando que `new Date(string)` lo parsee como hora local del servidor.
    const [year, month, day] = dateString.split("-").map(Number);
    const [hour, minute, second] = timeString.split(":").map(Number);
    const appointmentUTC = Date.UTC(year, month - 1, day, hour, minute, second || 0);

    if (appointmentUTC <= Date.now()) {
      const error = new Error(
        "La fecha y hora de la cita deben ser en el futuro",
      );
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

  // ─────────────────────────────────────────────────────────────
  // VALIDACIÓN DE DISPONIBILIDAD (Working Hours)
  // ─────────────────────────────────────────────────────────────

  /**
   * Verifica que el horario solicitado se encuentre dentro de alguna
   * franja activa del nutricionista para ese día de la semana.
   *
   * Estrategia anti-timezone:
   *   Se destruye el string YYYY-MM-DD en sus partes numéricas y se
   *   construye con Date.UTC() para obtener el día de la semana en UTC
   *   puro, sin que la zona horaria del servidor desplace la fecha.
   *
   * @param {string} nutritionistId  UUID del usuario nutricionista
   * @param {string} dateString      YYYY-MM-DD (ya normalizado)
   * @param {string} startTime       HH:mm:ss  (ya normalizado)
   * @param {string} endTime         HH:mm:ss  (ya normalizado)
   */
  async ensureWithinAvailability(
    nutritionistId,
    dateString,
    startTime,
    endTime,
  ) {
    // 1. Calcular day_of_week en UTC para evitar cualquier desfase horario.
    //    Ejemplo: '2026-03-09' → [2026, 3, 9] → Date.UTC(2026, 2, 9) → lunes → 1
    const [year, month, day] = dateString.split("-").map(Number);
    const utcDate = new Date(Date.UTC(year, month - 1, day));
    const dayOfWeek = utcDate.getUTCDay(); // 0=Domingo … 6=Sábado

    // 2. Obtener el perfil del nutricionista (la FK de Availability apunta
    //    a NutritionistProfile.id, NO al User.id).
    const profile = await NutritionistProfile.findOne({
      where: { user_id: nutritionistId },
    });

    if (!profile) {
      const error = new Error(
        "El nutricionista no tiene un perfil configurado",
      );
      error.statusCode = 404;
      throw error;
    }

    // 3. Buscar slots activos para ese día.
    const slots = await Availability.findAll({
      where: {
        nutritionist_profile_id: profile.id,
        day_of_week: dayOfWeek,
        is_active: true,
      },
    });

    if (slots.length === 0) {
      const error = new Error(
        "El nutricionista no tiene disponibilidad definida para ese día",
      );
      error.statusCode = 400;
      throw error;
    }

    // 4. Verificar que la cita quepa completamente dentro de al menos un slot.
    //    Normalización estricta a HH:mm:ss: si el valor llega como HH:mm
    //    (longitud 5) se concatena ':00' para garantizar comparación lexicográfica
    //    uniforme contra los valores HH:mm:ss almacenados en la BD.
    const normalizedStart =
      startTime.length === 5 ? `${startTime}:00` : startTime;
    const normalizedEnd = endTime.length === 5 ? `${endTime}:00` : endTime;

    const fits = slots.some(
      (slot) =>
        normalizedStart >= slot.start_time && normalizedEnd <= slot.end_time,
    );

    if (!fits) {
      const error = new Error(
        "El horario solicitado está fuera de los rangos de disponibilidad del nutricionista.",
      );
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

  // ─────────────────────────────────────────────────────────────
  // POST: Crear una nueva cita
  // ─────────────────────────────────────────────────────────────
  /**
   * Crea una nueva cita entre paciente y nutricionista.
   *
   * @param {string} patientId        - UUID del paciente autenticado
   * @param {string} nutritionistId   - UUID del nutricionista
   * @param {string} appointmentDate  - Fecha en formato YYYY-MM-DD
   * @param {string} startTime        - Hora de inicio HH:mm o HH:mm:ss
   * @param {string} endTime          - Hora de fin HH:mm o HH:mm:ss
   * @param {string} notes            - Notas opcionales del paciente
   * @returns {Object} Cita creada
   * @throws {Error} Si validaciones fallan
   */
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
    this.validateFutureDate(normalizedDate, normalizedStart);

    // Regla Anti-Spam: un paciente no puede tener más de un turno pendiente.
    const pendingAppointment = await Appointment.findOne({
      where: { patient_id: patientId, status: "pending" },
    });
    if (pendingAppointment) {
      const error = new Error(
        "Ya tienes un turno pendiente. Debes esperar a que sea confirmado o cancelarlo antes de solicitar uno nuevo.",
      );
      error.statusCode = 400;
      throw error;
    }

    await this.validateParticipants(patientId, nutritionistId);
    await this.ensureWithinAvailability(
      nutritionistId,
      normalizedDate,
      normalizedStart,
      normalizedEnd,
    );
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

  // ─────────────────────────────────────────────────────────────
  // GET: Obtener calendario del usuario autenticado
  // ─────────────────────────────────────────────────────────────
  /**
   * Devuelve todas las citas del usuario autenticado.
   * Si es paciente, filtra por patient_id.
   * Si es nutricionista, filtra por nutritionist_id.
   *
   * @param {string} userId - UUID del usuario autenticado
   * @param {string} role   - Rol del usuario ('patient' o 'nutritionist')
   * @returns {Array} Array de citas ordenadas por fecha
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

    const whereClause =
      role === "patient" ? { patient_id: userId } : { nutritionist_id: userId };

    return Appointment.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: "patient",
          attributes: ["id", "email", "name"],
        },
        {
          model: User,
          as: "nutritionist",
          attributes: ["id", "email", "name"],
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
          attributes: ["id", "email", "name"],
        },
        {
          model: User,
          as: "nutritionist",
          attributes: ["id", "email", "name"],
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
  // PATCH: Confirmar cita (solo nutricionista, solo desde pending)
  // ─────────────────────────────────────────────────────────────
  /**
   * Confirma una cita existente.
   *
   * Reglas de negocio:
   *  1. Filtro de Rol  → solo el nutricionista dueño de la cita puede confirmar.
   *  2. Máquina de Estados → la cita debe estar en estado `pending`.
   *
   * @param {string} appointmentId  UUID de la cita
   * @param {string} userId         UUID del usuario autenticado (req.user.id)
   * @returns {Appointment} Cita actualizada
   */
  async confirmAppointment(appointmentId, userId) {
    const appointment = await Appointment.findByPk(appointmentId);

    if (!appointment) {
      const error = new Error("La cita especificada no existe");
      error.statusCode = 404;
      throw error;
    }

    // ── Filtro de Rol: solo el nutricionista asignado puede confirmar ──
    if (appointment.nutritionist_id !== userId) {
      const error = new Error(
        "No tienes permisos para confirmar esta cita. Solo el nutricionista puede hacerlo.",
      );
      error.statusCode = 403;
      throw error;
    }

    // ── Máquina de Estados: solo se puede confirmar desde pending ──
    if (appointment.status !== "pending") {
      const error = new Error(
        "Solo se pueden confirmar citas en estado pendiente.",
      );
      error.statusCode = 400;
      throw error;
    }

    await appointment.update({ status: "confirmed" });
    return appointment;
  }

  // ─────────────────────────────────────────────────────────────
  // PATCH: Cancelar cita (paciente o nutricionista, no si ya cancelada)
  // ─────────────────────────────────────────────────────────────
  /**
   * Cancela una cita existente.
   *
   * Reglas de negocio:
   *  1. Filtro de Rol  → cualquiera de los dos participantes puede cancelar;
   *                      un tercero recibe 403.
   *  2. Máquina de Estados → se permite cancelar desde `pending` o `confirmed`,
   *                          pero NO si ya está `cancelled`.
   *
   * @param {string} appointmentId  UUID de la cita
   * @param {string} userId         UUID del usuario autenticado (req.user.id)
   * @returns {Appointment} Cita actualizada
   */
  async cancelAppointment(appointmentId, userId) {
    const appointment = await Appointment.findByPk(appointmentId);

    if (!appointment) {
      const error = new Error("La cita especificada no existe");
      error.statusCode = 404;
      throw error;
    }

    // ── Filtro de Rol: solo paciente o nutricionista de la cita ──
    if (
      appointment.patient_id !== userId &&
      appointment.nutritionist_id !== userId
    ) {
      const error = new Error("No tienes permisos para cancelar esta cita.");
      error.statusCode = 403;
      throw error;
    }

    // ── Máquina de Estados: no se puede volver a cancelar ──
    if (appointment.status === "cancelled") {
      const error = new Error("La cita ya se encuentra cancelada.");
      error.statusCode = 400;
      throw error;
    }

    await appointment.update({ status: "cancelled" });
    return appointment;
  }

  // ─────────────────────────────────────────────────────────────
  // POST: Agregar reseña a una cita concluida
  // ─────────────────────────────────────────────────────────────
  /**
   * Permite a un paciente dejar una reseña sobre una cita.
   *
   * @param {string} appointmentId - ID de la cita
   * @param {string} patientId     - UUID del paciente autenticado
   * @param {number} rating        - Calificación (1-5)
   * @param {string} comment       - Comentario de la reseña
   * @returns {Object} Cita actualizada con la reseña
   * @throws {Error} Si validaciones fallan
   */
  async addReview(appointmentId, patientId, rating, comment) {
    if (!appointmentId || !patientId || rating === undefined) {
      const error = new Error(
        "appointmentId, patientId y rating son requeridos",
      );
      error.statusCode = 400;
      throw error;
    }

    const ratingNum = Number(rating);
    if (!Number.isInteger(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      const error = new Error("rating debe ser un número entero entre 1 y 5");
      error.statusCode = 400;
      throw error;
    }

    const appointment = await Appointment.findByPk(appointmentId);
    if (!appointment) {
      const error = new Error("La cita especificada no existe");
      error.statusCode = 404;
      throw error;
    }

    if (appointment.patient_id !== patientId) {
      const error = new Error(
        "No tienes permiso para dejar reseña en esta cita",
      );
      error.statusCode = 403;
      throw error;
    }

    // Verificar que la cita ya haya concluido (appointment_date + end_time)
    const now = new Date();
    const appointmentEnd = new Date(
      `${appointment.appointment_date}T${appointment.end_time}`,
    );
    if (appointmentEnd > now) {
      const error = new Error(
        "Solo puedes dejar reseña después de que la cita haya concluido",
      );
      error.statusCode = 400;
      throw error;
    }

    if (appointment.status === "cancelled") {
      const error = new Error("No puedes dejar reseña en una cita cancelada");
      error.statusCode = 400;
      throw error;
    }

    await appointment.update({
      review_rating: ratingNum,
      review_comment: comment?.trim() || null,
      status: "completed",
    });

    return Appointment.findByPk(appointmentId, {
      include: [
        {
          model: User,
          as: "patient",
          attributes: ["id", "email", "name"],
        },
        {
          model: User,
          as: "nutritionist",
          attributes: ["id", "email", "name"],
        },
      ],
    });
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
    this.validateFutureDate(String(updatedDate), String(updatedStart));

    // Regla 3: si cambia la fecha/hora, re-validar double-booking
    // excluyendo la propia cita con [Op.ne]: appointmentId
    const isTimeChanged =
      updateData.appointment_date ||
      updateData.start_time ||
      updateData.end_time;

    if (isTimeChanged) {
      await this.ensureWithinAvailability(
        appointment.nutritionist_id,
        String(updatedDate),
        String(updatedStart),
        String(updatedEnd),
      );
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
