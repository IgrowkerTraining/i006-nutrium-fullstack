const {
  User,
  Patient,
  NutritionistProfile,
  ClinicalTag,
} = require("../models");

/**
 * MatchmakingService
 *
 * Orquesta el flujo completo de recomendación AI:
 *   Fetch DB → Anonimización → HTTP → Hidratación → Retorno
 *
 * Regla de privacidad: el payload enviado al microservicio Python
 * nunca contiene email, nombre real ni fecha exacta de nacimiento.
 */
class MatchmakingService {
  // ─────────────────────────────────────────────────────────────
  // HELPER: Cálculo de edad
  // ─────────────────────────────────────────────────────────────

  /**
   * Calcula la edad en años completos a partir de una fecha YYYY-MM-DD.
   *
   * Estrategia anti-timezone:
   *   1. Se descompone birth_date en partes numéricas (año, mes, día).
   *   2. Se obtiene la fecha actual en UTC (getUTCFullYear/Month/Date)
   *      para evitar que la zona horaria del servidor desplace el día.
   *   3. Si el cumpleaños de este año aún no llegó (mes o día posterior
   *      al actual), se resta 1 al valor inicial.
   *
   * Ejemplo: birth_date='1995-08-20', hoy=2026-03-05 → age = 30
   *          (el cumpleaños 2026 todavía no ocurrió → 2026-1995-1 = 30)
   *
   * @param {string} birthDate  Fecha de nacimiento en formato YYYY-MM-DD
   * @returns {number}          Edad en años completos
   */
  calculateAge(birthDate) {
    const [birthYear, birthMonth, birthDay] = String(birthDate)
      .split("-")
      .map(Number);

    const now = new Date();
    const currentYear = now.getUTCFullYear();
    const currentMonth = now.getUTCMonth() + 1; // 0-indexed → 1-indexed
    const currentDay = now.getUTCDate();

    let age = currentYear - birthYear;

    // El cumpleaños aún no ocurrió este año → restar 1
    if (
      currentMonth < birthMonth ||
      (currentMonth === birthMonth && currentDay < birthDay)
    ) {
      age -= 1;
    }

    return age;
  }

  // ─────────────────────────────────────────────────────────────
  // MAIN: Orquestador de recomendaciones
  // ─────────────────────────────────────────────────────────────

  /**
   * Devuelve la lista de nutricionistas recomendados para un paciente,
   * enriquecida con datos reales (nombre, foto, precio).
   *
   * Flujo:
   *   A. Fetch DB   – paciente + todos los nutricionistas activos
   *   B. Payload    – construye el JSON anónimo para Python
   *   C. HTTP       – POST al microservicio de IA
   *   D. Hidratación – reemplaza datos anónimos por datos reales
   *
   * @param {string} patientId  UUID del usuario paciente
   * @returns {Array}           Matches hidratados con datos del nutricionista
   */
  async getRecommendationsForPatient(patientId) {
    // ── A. Fetch DB ──────────────────────────────────────────────────────────

    // Buscar usuario paciente y su perfil en una sola consulta (JOIN)
    const patientUser = await User.findOne({
      where: { id: patientId, role: "patient", is_active: true },
      include: [
        {
          model: Patient,
          as: "patientProfile",
          required: true, // INNER JOIN – descarta usuarios sin perfil
        },
      ],
    });

    if (!patientUser || !patientUser.patientProfile) {
      const error = new Error(
        "El paciente no tiene un perfil configurado. Complete su perfil para obtener recomendaciones.",
      );
      error.statusCode = 404;
      throw error;
    }

    const patientProfile = patientUser.patientProfile;

    // Buscar todos los nutricionistas activos que acepten nuevos pacientes,
    // incluyendo el User asociado (para hidratación posterior) y sus tags.
    const nutritionistProfiles = await NutritionistProfile.findAll({
      where: { accepts_new_patients: true },
      include: [
        {
          model: User,
          as: "user",
          where: { role: "nutritionist", is_active: true },
          attributes: ["id", "name"], // Solo los campos necesarios
          required: true, // INNER JOIN – descarta perfiles huérfanos
        },
        {
          model: ClinicalTag,
          as: "tags",
          through: { attributes: [] }, // Oculta columnas de la tabla pivote
          attributes: ["name", "category"],
          required: false, // LEFT JOIN – un perfil puede no tener tags
        },
      ],
    });

    if (nutritionistProfiles.length === 0) {
      return [];
    }

    // ── B. Anonimización ─────────────────────────────────────────────────────

    // Perfil del paciente: edad calculada, sin nombre ni fecha exacta
    const age = this.calculateAge(patientProfile.birth_date);

    // Python requiere health_goal con min_length=10; usar fallback si está
    // vacío o es demasiado corto para evitar un 422 del servicio de IA.
    const healthGoal =
      patientProfile.health_goals &&
      patientProfile.health_goals.trim().length >= 10
        ? patientProfile.health_goals.trim()
        : "Mejorar mi estado de salud y bienestar general";

    const patientPayload = {
      health_goal: healthGoal,
      age,
      gender: patientProfile.gender || null,
      location: `${patientProfile.city}, ${patientProfile.country}`,
      // Primer idioma de la lista (o "es" por defecto)
      preferred_language:
        Array.isArray(patientProfile.languages) &&
        patientProfile.languages.length > 0
          ? patientProfile.languages[0]
          : "es",
      // Modalidad como referencia de estilo de comunicación
      communication_style: patientProfile.modality || null,
    };

    // Lista de nutricionistas: id real para hidratación, nombre anónimo
    const nutritionistPayloads = nutritionistProfiles.map((profile, index) => {
      // Preferir specializations JSONB; si está vacío, derivar de tags clínicos
      const tagNames = Array.isArray(profile.tags)
        ? profile.tags.map((t) => t.name)
        : [];
      const specializations =
        Array.isArray(profile.specializations) &&
        profile.specializations.length > 0
          ? profile.specializations
          : tagNames;

      return {
        id: profile.user_id, // UUID real → usado en hidratación
        name: `Nutricionista #${index + 1}`, // Anonimizado
        specializations,
        years_of_experience: profile.years_of_experience,
        languages: Array.isArray(profile.languages)
          ? profile.languages
          : ["es"],
        location: profile.location || profile.country || null,
        rating: parseFloat(profile.rating) || 0.0,
        total_reviews: profile.total_reviews || 0,
        consultation_fee_range: profile.consultation_fee_range || null,
        accepts_new_patients: profile.accepts_new_patients,
        // bio, email y nombre real omitidos intencionalmente
      };
    });

    // ── C. HTTP Request al microservicio de IA ───────────────────────────────

    const aiServiceUrl =
      process.env.AI_SERVICE_URL || "http://localhost:8000/api/v1";
    const endpoint = `${aiServiceUrl}/match/analyze`;

    const requestBody = {
      patient_profile: patientPayload,
      nutritionists: nutritionistPayloads,
      top_n: 5,
    };

    let aiResponse;

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        const error = new Error(
          `El servicio de IA respondió con error ${response.status}: ${errorText}`,
        );
        error.statusCode = 502;
        throw error;
      }

      aiResponse = await response.json();
    } catch (err) {
      // Re-lanzar errores controlados (statusCode ya asignado)
      if (err.statusCode) throw err;
      // Error de red / conexión rechazada (ECONNREFUSED = Python está caído)
      if (err.code === 'ECONNREFUSED') {
        console.error(`[MatchmakingService] ECONNREFUSED al llamar a ${endpoint} — ¿está corriendo el servicio Python en AI_SERVICE_URL=${process.env.AI_SERVICE_URL}?`);
      } else {
        console.error('[MatchmakingService] Error de red inesperado al llamar al servicio de IA:', err.message);
      }
      const error = new Error(
        "No se pudo conectar con el servicio de recomendaciones. Intente nuevamente.",
      );
      error.statusCode = 502;
      throw error;
    }

    // ── D. Hidratación ───────────────────────────────────────────────────────

    // Índice O(1): user_id → perfil completo (para lookup rápido en el mapeo)
    const profilesByUserId = new Map(
      nutritionistProfiles.map((p) => [p.user_id, p]),
    );

    const hydratedMatches = (aiResponse.matches || []).map((match) => {
      const profile = profilesByUserId.get(match.nutritionist_id);

      return {
        ...match,
        // Reemplazar nombre anónimo por el nombre real del nutricionista
        nutritionist_name: profile?.user?.name || match.nutritionist_name,
        // Adjuntar foto de perfil (no enviada a Python por privacidad)
        profile_picture_url: profile?.profile_picture_url || null,
        // Asegurar que el precio sea el dato real de la BD
        consultation_fee_range:
          profile?.consultation_fee_range ||
          match.consultation_fee_range ||
          null,
      };
    });

    return hydratedMatches;
  }
}

module.exports = new MatchmakingService();
