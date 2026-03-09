const { Op } = require("sequelize");
const {
  NutritionistProfile,
  ClinicalTag,
  Availability,
  Appointment,
  User,
} = require("../models");

/**
 * NutritionistService
 *
 * Encapsula toda la lógica de negocio del módulo de nutricionistas.
 * El Controller sólo llama estos métodos y delega validaciones de BD aquí.
 */
class NutritionistService {
  // ─────────────────────────────────────────────────────────────
  // GET profile del nutricionista autenticado
  // ─────────────────────────────────────────────────────────────
  /**
   * Obtiene el perfil del nutricionista autenticado junto con
   * sus tags clínicos y sus franjas de disponibilidad.
   *
   * @param {string} userId - ID del usuario autenticado (req.user.id)
   * @returns {Object} Perfil completo con tags y disponibilidad
   */
  async getProfile(userId) {
    const profile = await NutritionistProfile.findOne({
      where: { user_id: userId },
      include: [
        {
          model: ClinicalTag,
          as: "tags",
          through: { attributes: [] }, // Oculta columnas de la tabla pivote
          attributes: ["id", "name", "category"],
        },
        {
          model: Availability,
          as: "availabilities",
          where: { is_active: true },
          required: false, // LEFT JOIN: retorna perfil aunque no tenga horarios
          attributes: ["id", "day_of_week", "start_time", "end_time"],
        },
      ],
    });

    if (!profile) {
      const error = new Error("El nutricionista aún no tiene perfil creado");
      error.statusCode = 404;
      throw error;
    }

    return profile;
  }

  // ─────────────────────────────────────────────────────────────
  // UPSERT (crear o actualizar) el perfil del nutricionista
  // ─────────────────────────────────────────────────────────────
  /**
   * Crea o actualiza el perfil del nutricionista autenticado.
   * Usa findOrCreate para evitar duplicados basados en user_id.
   *
   * @param {string} userId       - ID del usuario autenticado
   * @param {Object} profileData  - { license_number, bio, modality, years_of_experience, country, city }
   * @param {Array}  tagIds       - Array opcional de IDs de ClinicalTag
   * @returns {Object} { profile, created }
   */
  async upsertProfile(userId, profileData, tagIds = []) {
    const {
      license_number,
      bio,
      modality,
      years_of_experience,
      country,
      city,
    } = profileData;

    // Validar campos obligatorios solo en creación
    const existingProfile = await NutritionistProfile.findOne({
      where: { user_id: userId },
    });

    let profile;
    let created = false;

    if (!existingProfile) {
      // ── CREAR ─────────────────────────────────────────────
      if (!license_number) {
        const error = new Error(
          "El número de matrícula es obligatorio al crear el perfil",
        );
        error.statusCode = 400;
        throw error;
      }

      // Verificar que la matrícula no esté en uso por otro nutricionista
      const duplicateLicense = await NutritionistProfile.findOne({
        where: { license_number },
      });
      if (duplicateLicense) {
        const error = new Error("El número de matrícula ya está registrado");
        error.statusCode = 409;
        throw error;
      }

      profile = await NutritionistProfile.create({
        user_id: userId,
        license_number,
        bio,
        modality,
        years_of_experience,
        country: country || null,
        city: city || null,
      });
      created = true;
    } else {
      // ── ACTUALIZAR ────────────────────────────────────────
      // Solo actualizamos los campos que llegan en el body
      const updatePayload = {};
      if (license_number !== undefined) {
        // Verificar unicidad si cambia la matrícula
        if (license_number !== existingProfile.license_number) {
          const duplicateLicense = await NutritionistProfile.findOne({
            where: { license_number, id: { [Op.ne]: existingProfile.id } },
          });
          if (duplicateLicense) {
            const error = new Error(
              "El número de matrícula ya está registrado",
            );
            error.statusCode = 409;
            throw error;
          }
        }
        updatePayload.license_number = license_number;
      }
      if (bio !== undefined) updatePayload.bio = bio;
      if (modality !== undefined) updatePayload.modality = modality;
      if (years_of_experience !== undefined)
        updatePayload.years_of_experience = years_of_experience;
      if (country !== undefined) updatePayload.country = country;
      if (city !== undefined) updatePayload.city = city;

      await existingProfile.update(updatePayload);
      profile = existingProfile;
    }

    // ── SINCRONIZAR TAGS (N:M) ─────────────────────────────────
    /**
     * profile.setTags() es el método mágico que Sequelize genera
     * para relaciones belongsToMany:
     *  1. DELETE FROM nutritionist_tags WHERE nutritionist_profile_id = profile.id
     *  2. INSERT INTO nutritionist_tags (nutritionist_profile_id, clinical_tag_id)
     *     VALUES (...) para cada tagId recibido.
     *
     * Esto garantiza que los tags del perfil reflejen exactamente
     * lo que se envió, sin necesidad de comparar manualmente.
     */
    if (tagIds.length > 0) {
      // Validar que todos los IDs sean números enteros positivos
      const allNumeric = tagIds.every(
        (id) => Number.isInteger(Number(id)) && Number(id) > 0,
      );
      if (!allNumeric) {
        const error = new Error(
          "tagIds debe ser un array de IDs numéricos enteros positivos",
        );
        error.statusCode = 400;
        throw error;
      }

      const tags = await ClinicalTag.findAll({ where: { id: tagIds } });
      if (tags.length !== tagIds.length) {
        const error = new Error("Uno o más tagIds son inválidos o no existen");
        error.statusCode = 400;
        throw error;
      }
      await profile.setTags(tags);
    }

    // Recargar con asociaciones para devolver el objeto completo
    const fullProfile = await this.getProfile(userId);
    return { profile: fullProfile, created };
  }

  // ─────────────────────────────────────────────────────────────
  // POST availability – gestionar franjas horarias
  // ─────────────────────────────────────────────────────────────
  /**
   * Reemplaza TODAS las franjas horarias activas del nutricionista
   * por el array recibido. Estrategia: soft-delete de las antiguas
   * + insert de las nuevas dentro de una transaction.
   *
   * @param {string} userId        - ID del usuario autenticado
   * @param {Array}  slots         - Array de { day_of_week, start_time, end_time }
   * @returns {Array} Franjas creadas
   */
  async setAvailability(userId, slots) {
    if (!Array.isArray(slots) || slots.length === 0) {
      const error = new Error(
        "Debes enviar al menos una franja horaria en el array `slots`",
      );
      error.statusCode = 400;
      throw error;
    }

    // El perfil debe existir antes de establecer horarios
    const profile = await NutritionistProfile.findOne({
      where: { user_id: userId },
    });
    if (!profile) {
      const error = new Error(
        "Primero debes crear tu perfil (PUT /api/v1/nutritionists/profile)",
      );
      error.statusCode = 404;
      throw error;
    }

    // Validar estructura de cada slot
    // day_of_week: 0=Domingo, 1=Lunes, ..., 6=Sábado
    for (const slot of slots) {
      if (
        slot.day_of_week === undefined ||
        slot.day_of_week === null ||
        !slot.start_time ||
        !slot.end_time
      ) {
        const error = new Error(
          "Cada slot debe tener day_of_week (0-6), start_time y end_time",
        );
        error.statusCode = 400;
        throw error;
      }
      const day = Number(slot.day_of_week);
      if (!Number.isInteger(day) || day < 0 || day > 6) {
        const error = new Error(
          `day_of_week "${slot.day_of_week}" no es válido. Debe ser un entero entre 0 (Domingo) y 6 (Sábado)`,
        );
        error.statusCode = 400;
        throw error;
      }
    }

    // Usar una transacción: o se guardan todos o ninguno
    const sequelize = NutritionistProfile.sequelize;
    const result = await sequelize.transaction(async (t) => {
      // 1. Desactivar franjas anteriores (soft-delete)
      await Availability.update(
        { is_active: false },
        { where: { nutritionist_profile_id: profile.id }, transaction: t },
      );

      // 2. Insertar las nuevas franjas con bulkCreate (un solo INSERT)
      const newSlots = slots.map((s) => ({
        nutritionist_profile_id: profile.id,
        day_of_week: s.day_of_week,
        start_time: s.start_time,
        end_time: s.end_time,
        is_active: true,
      }));

      const created = await Availability.bulkCreate(newSlots, {
        ignoreDuplicates: true, // Si ya existe el mismo slot, omitir en lugar de lanzar error
        transaction: t,
      });

      return created;
    });

    return result;
  }

  // ─────────────────────────────────────────────────────────────
  // PUT availability – reemplazar franjas (hard delete + bulkCreate)
  // ─────────────────────────────────────────────────────────────
  /**
   * Elimina PERMANENTEMENTE todas las franjas del nutricionista
   * y crea las nuevas con un bulkCreate dentro de una transacción.
   *
   * Diferencia frente a setAvailability: éste usa Availability.destroy
   * (hard delete) en lugar de soft-delete, lo que mantiene la tabla
   * limpia sin filas inactivas históricas.
   *
   * @param {string} userId   ID del usuario autenticado
   * @param {Array}  slots    [{ day_of_week, start_time, end_time }]
   * @returns {Array} Franjas recién creadas
   */
  async replaceAvailability(userId, slots) {
    if (!Array.isArray(slots) || slots.length === 0) {
      const error = new Error(
        "Debes enviar al menos una franja horaria en el array `slots`",
      );
      error.statusCode = 400;
      throw error;
    }

    const profile = await NutritionistProfile.findOne({
      where: { user_id: userId },
    });
    if (!profile) {
      const error = new Error(
        "Primero debes crear tu perfil (PUT /api/v1/nutritionists/profile)",
      );
      error.statusCode = 404;
      throw error;
    }

    // Validar estructura de cada slot
    for (const slot of slots) {
      if (
        slot.day_of_week === undefined ||
        slot.day_of_week === null ||
        !slot.start_time ||
        !slot.end_time
      ) {
        const error = new Error(
          "Cada slot debe tener day_of_week (0-6), start_time y end_time",
        );
        error.statusCode = 400;
        throw error;
      }
      const day = Number(slot.day_of_week);
      if (!Number.isInteger(day) || day < 0 || day > 6) {
        const error = new Error(
          `day_of_week "${slot.day_of_week}" no es válido. Debe ser un entero entre 0 (Domingo) y 6 (Sábado)`,
        );
        error.statusCode = 400;
        throw error;
      }
    }

    const sequelize = NutritionistProfile.sequelize;
    const result = await sequelize.transaction(async (t) => {
      // 1. Hard delete: elimina permanentemente las franjas anteriores
      //    Se filtra por nutritionist_profile_id (FK del perfil).
      await Availability.destroy({
        where: { nutritionist_profile_id: profile.id },
        transaction: t,
      });

      // 2. Insertar las nuevas franjas de una sola vez (un INSERT)
      const newSlots = slots.map((s) => ({
        nutritionist_profile_id: profile.id,
        day_of_week: Number(s.day_of_week),
        start_time: s.start_time,
        end_time: s.end_time,
        is_active: true,
      }));

      return Availability.bulkCreate(newSlots, { transaction: t });
    });

    return result;
  }

  // ─────────────────────────────────────────────────────────────
  // GET público – listar nutricionistas con sus especialidades
  // ─────────────────────────────────────────────────────────────
  /**
   * Retorna una lista paginada de nutricionistas verificados
   * con su nombre (de `users`), tags y datos de contacto.
   *
   * Query params: page, limit, tag (slug del tag para filtrar)
   *
   * @param {Object} filters - { page, limit, tag }
   * @returns {Object} { nutritionists, total, page, totalPages }
   */
  async listNutritionists({ page = 1, limit = 10, tag } = {}) {
    const offset = (page - 1) * limit;

    // Construir condición de filtro por tag (opcional, filtra por category)
    const tagWhere = tag ? { category: tag } : undefined;

    const { count, rows } = await NutritionistProfile.findAndCountAll({
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "email"],
        },
        {
          model: ClinicalTag,
          as: "tags",
          through: { attributes: [] },
          attributes: ["id", "name", "category"],
          // Si se filtra por tag, solo incluir perfiles que tengan ese tag
          ...(tagWhere && { where: tagWhere, required: true }),
        },
      ],
      order: [["rating", "DESC"]],
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10),
      distinct: true, // Necesario para count correcto con includes
    });

    return {
      nutritionists: rows,
      total: count,
      page: parseInt(page, 10),
      totalPages: Math.ceil(count / limit),
    };
  }

  // ─────────────────────────────────────────────────────────────
  // GET /api/v1/nutritionists/:id/agenda?date=YYYY-MM-DD
  // ─────────────────────────────────────────────────────────────
  /**
   * Devuelve la agenda de un nutricionista para una fecha dada:
   *   - slots: franjas de disponibilidad activas para ese día de la semana.
   *   - booked_appointments: citas pending/confirmed en esa fecha.
   *
   * El cálculo del día de la semana se realiza con Date.UTC + getUTCDay()
   * para evitar cualquier desfase producido por la zona horaria del servidor.
   * Ejemplo: '2026-03-09' → Date.UTC(2026, 2, 9) → getUTCDay() = 1 (lunes)
   *
   * @param {string} nutritionistUserId  UUID del usuario nutricionista
   * @param {string} dateString          YYYY-MM-DD
   * @returns {{ slots: Array, booked_appointments: Array }}
   */
  async getAgenda(nutritionistUserId, dateString) {
    // 1. Validar formato de fecha
    if (!dateString || !/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      const error = new Error("date debe tener formato YYYY-MM-DD");
      error.statusCode = 400;
      throw error;
    }

    // 2. Calcular day_of_week en UTC puro
    const [year, month, day] = dateString.split("-").map(Number);
    const utcDate = new Date(Date.UTC(year, month - 1, day));
    if (Number.isNaN(utcDate.getTime())) {
      const error = new Error("date no es una fecha válida");
      error.statusCode = 400;
      throw error;
    }
    const dayOfWeek = utcDate.getUTCDay(); // 0=Domingo … 6=Sábado

    // 3. Verificar que el nutricionista exista y tenga perfil
    const profile = await NutritionistProfile.findOne({
      where: { user_id: nutritionistUserId },
    });

    if (!profile) {
      const error = new Error(
        "El nutricionista no tiene un perfil configurado",
      );
      error.statusCode = 404;
      throw error;
    }

    // 4. En paralelo: slots del día + citas activas para esa fecha
    const [slots, bookedAppointments] = await Promise.all([
      Availability.findAll({
        where: {
          nutritionist_profile_id: profile.id,
          day_of_week: dayOfWeek,
          is_active: true,
        },
        attributes: ["id", "day_of_week", "start_time", "end_time"],
        order: [["start_time", "ASC"]],
      }),
      Appointment.findAll({
        where: {
          nutritionist_id: nutritionistUserId,
          appointment_date: dateString,
          status: { [Op.in]: ["pending", "confirmed"] },
        },
        include: [
          {
            model: User,
            as: "patient",
            attributes: ["id", "name", "email"],
          },
        ],
        attributes: [
          "id",
          "patient_id",
          "appointment_date",
          "start_time",
          "end_time",
          "status",
          "notes",
        ],
        order: [["start_time", "ASC"]],
      }),
    ]);

    return { slots, booked_appointments: bookedAppointments };
  }
}

module.exports = new NutritionistService();
