const Patient = require('../models/Patient');
const {
  MODALITIES,
  AVAILABILITY,
  OBJECTIVES,
  HEALTH_CONDITIONS,
} = require('../models/Patient');

class PatientService {
  /**
   * Obtiene el perfil completo del paciente
   * @param {string} userId - ID del usuario autenticado
   * @returns {Promise<Patient|null>} Perfil del paciente o null si no existe
   */
  async getProfile(userId) {
    try {
      const patient = await Patient.findOne({
        where: { userId },
        attributes: ['id', 'nombreCompleto', 'fechaNacimiento', 'pais', 'ciudad', 'modalidad', 'disponibilidad', 'objetivo', 'createdAt', 'updatedAt'],
      });
      return patient;
    } catch (error) {
      throw new Error(`Error al obtener perfil: ${error.message}`);
    }
  }

  /**
   * Crea o actualiza el perfil del paciente
   * @param {string} userId - ID del usuario
   * @param {Object} profileData - Datos del perfil
   * @returns {Promise<Patient>} Paciente creado/actualizado
   */
  async upsertProfile(userId, profileData) {
    try {
      // Validar que la modalidad sea válida
      if (profileData.modalidad && !MODALITIES.includes(profileData.modalidad)) {
        throw new Error(`Modalidad inválida. Permitidas: ${MODALITIES.join(', ')}`);
      }

      // Validar que la disponibilidad sea válida
      if (profileData.disponibilidad && !AVAILABILITY.includes(profileData.disponibilidad)) {
        throw new Error(`Disponibilidad inválida. Permitidas: ${AVAILABILITY.join(', ')}`);
      }

      // Validar que el objetivo sea válido
      if (profileData.objetivo && !OBJECTIVES.includes(profileData.objetivo)) {
        throw new Error(`Objetivo inválido. Permitidos: ${OBJECTIVES.join(', ')}`);
      }

      // Buscar paciente existente o crear uno nuevo
      const [patient, created] = await Patient.findOrCreate({
        where: { userId },
        defaults: {
          userId,
          nombreCompleto: profileData.nombreCompleto || null,
          fechaNacimiento: profileData.fechaNacimiento || null,
          pais: profileData.pais || null,
          ciudad: profileData.ciudad || null,
          modalidad: profileData.modalidad || null,
          disponibilidad: profileData.disponibilidad || null,
          objetivo: profileData.objetivo || null,
        },
      });

      // Si el paciente ya existe, actualizar sus datos
      if (!created) {
        await patient.update({
          nombreCompleto: profileData.nombreCompleto !== undefined ? profileData.nombreCompleto : patient.nombreCompleto,
          fechaNacimiento: profileData.fechaNacimiento !== undefined ? profileData.fechaNacimiento : patient.fechaNacimiento,
          pais: profileData.pais !== undefined ? profileData.pais : patient.pais,
          ciudad: profileData.ciudad !== undefined ? profileData.ciudad : patient.ciudad,
          modalidad: profileData.modalidad !== undefined ? profileData.modalidad : patient.modalidad,
          disponibilidad: profileData.disponibilidad !== undefined ? profileData.disponibilidad : patient.disponibilidad,
          objetivo: profileData.objetivo !== undefined ? profileData.objetivo : patient.objetivo,
        });
      }

      return patient;
    } catch (error) {
      throw new Error(`Error al actualizar perfil: ${error.message}`);
    }
  }

  /**
   * Obtiene las etiquetas (condiciones de salud) del paciente
   * @param {string} userId - ID del usuario autenticado
   * @returns {Promise<Object>} Condiciones y otra condición
   */
  async getTags(userId) {
    try {
      const patient = await Patient.findOne({
        where: { userId },
        attributes: ['id', 'condiciones', 'otraCondicion'],
      });

      if (!patient) {
        return {
          condiciones: [],
          otraCondicion: null,
        };
      }

      return {
        condiciones: patient.condiciones || [],
        otraCondicion: patient.otraCondicion || null,
      };
    } catch (error) {
      throw new Error(`Error al obtener tags: ${error.message}`);
    }
  }

  /**
   * Actualiza las etiquetas (condiciones de salud) del paciente
   * @param {string} userId - ID del usuario
   * @param {Object} tagsData - Datos de tags { condiciones: [], otraCondicion: string }
   * @returns {Promise<Patient>} Paciente actualizado
   */
  async updateTags(userId, tagsData) {
    try {
      // Validar condiciones si se proporcionan
      if (Array.isArray(tagsData.condiciones) && tagsData.condiciones.length > 0) {
        const invalidConditions = tagsData.condiciones.filter(
          (condition) => !HEALTH_CONDITIONS.includes(condition)
        );
        if (invalidConditions.length > 0) {
          throw new Error(
            `Condiciones inválidas: ${invalidConditions.join(', ')}. Permitidas: ${HEALTH_CONDITIONS.join(', ')}`
          );
        }
      }

      // Buscar o crear paciente
      const [patient, created] = await Patient.findOrCreate({
        where: { userId },
        defaults: {
          userId,
          condiciones: tagsData.condiciones || [],
          otraCondicion: tagsData.otraCondicion || null,
        },
      });

      // Si el paciente ya existe, actualizar sus tags
      if (!created) {
        await patient.update({
          condiciones: tagsData.condiciones || patient.condiciones,
          otraCondicion: tagsData.otraCondicion !== undefined ? tagsData.otraCondicion : patient.otraCondicion,
        });
      }

      return patient;
    } catch (error) {
      throw new Error(`Error al actualizar tags: ${error.message}`);
    }
  }
}

module.exports = new PatientService();
