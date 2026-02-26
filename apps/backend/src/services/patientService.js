const { Patient, ClinicalTag } = require('../models');

/**
 * PatientService
 *
 * Encapsula toda la lógica de negocio del módulo de pacientes.
 * El Controller sólo llama estos métodos y delega validaciones de BD aquí.
 */
class PatientService {
  // ─────────────────────────────────────────────────────────────
  // GET perfil del paciente autenticado
  // ─────────────────────────────────────────────────────────────
  /**
   * Obtiene el perfil del paciente junto con sus tags clínicos.
   *
   * @param {string} userId - ID UUID del usuario autenticado (req.user.id)
   * @returns {Object} Perfil completo con tags
   */
  async getProfile(userId) {
    const profile = await Patient.findOne({
      where: { user_id: userId },
      include: [
        {
          model: ClinicalTag,
          as: 'tags',
          through: { attributes: [] }, // Oculta columnas de la tabla pivote
          attributes: ['id', 'name', 'category'],
        },
      ],
    });

    if (!profile) {
      const error = new Error('El paciente aún no tiene perfil creado');
      error.statusCode = 404;
      throw error;
    }

    return profile;
  }

  // ─────────────────────────────────────────────────────────────
  // UPSERT (crear o actualizar) el perfil del paciente
  // ─────────────────────────────────────────────────────────────
  /**
   * Crea o actualiza el perfil del paciente autenticado.
   * Usa findOrCreate para evitar duplicados basados en user_id.
   *
   * @param {string} userId      - ID UUID del usuario autenticado
   * @param {Object} profileData - { birth_date, gender, health_goals }
   * @param {Array}  tagIds      - Array opcional de IDs de ClinicalTag
   * @returns {Object} { profile, created }
   */
  async upsertProfile(userId, profileData, tagIds = []) {
    const { birth_date, gender, health_goals } = profileData;

    const existingProfile = await Patient.findOne({ where: { user_id: userId } });

    let profile;
    let created = false;

    if (!existingProfile) {
      // ── CREAR ─────────────────────────────────────────────
      profile = await Patient.create({
        user_id: userId,
        birth_date,
        gender: gender || null,
        health_goals: health_goals || null,
      });
      created = true;
    } else {
      // ── ACTUALIZAR ────────────────────────────────────────
      // Solo se sobreescriben los campos que llegan en el body
      const updatePayload = {};
      if (birth_date !== undefined)    updatePayload.birth_date    = birth_date;
      if (gender !== undefined)        updatePayload.gender        = gender;
      if (health_goals !== undefined)  updatePayload.health_goals  = health_goals;

      await existingProfile.update(updatePayload);
      profile = existingProfile;
    }

    // ── SINCRONIZAR TAGS (N:M) ─────────────────────────────────
    /**
     * profile.setTags() es el método que Sequelize genera para
     * relaciones belongsToMany:
     *  1. DELETE FROM patient_tags WHERE patient_id = profile.id
     *  2. INSERT INTO patient_tags (patient_id, tag_id)
     *     VALUES (...) para cada tagId recibido.
     */
    if (tagIds.length > 0) {
      const allNumeric = tagIds.every((id) => Number.isInteger(Number(id)) && Number(id) > 0);
      if (!allNumeric) {
        const error = new Error('tag_ids debe ser un array de IDs numéricos enteros positivos');
        error.statusCode = 400;
        throw error;
      }

      const tags = await ClinicalTag.findAll({ where: { id: tagIds } });
      if (tags.length !== tagIds.length) {
        const error = new Error('Uno o más tag_ids son inválidos o no existen');
        error.statusCode = 400;
        throw error;
      }

      await profile.setTags(tags);
    }

    // Recargar con asociaciones para devolver el objeto completo
    const fullProfile = await this.getProfile(userId);
    return { profile: fullProfile, created };
  }
}

module.exports = new PatientService();

