const patientService = require("../services/patientService");
const Validator = require("../utils/validator");

/**
 * PatientController
 *
 * Responsabilidades:
 *  - Extraer y validar los datos de `req` (body, user).
 *  - Llamar al método correspondiente del Service.
 *  - Formatear y devolver la respuesta HTTP.
 *  - Delegar cualquier lógica de negocio al Service, NUNCA aquí.
 */
class PatientController {
  // ──────────────────────────────────────────────────────────────
  // GET /api/v1/patients/profile
  // ──────────────────────────────────────────────────────────────
  /**
   * Devuelve el perfil completo del paciente autenticado,
   * incluyendo sus tags clínicos.
   *
   * Requiere: Bearer token con role 'patient'
   */
  async getProfile(req, res) {
    try {
      const profile = await patientService.getProfile(req.user.id);

      return res.status(200).json({
        success: true,
        message: "Perfil obtenido exitosamente",
        data: { profile },
      });
    } catch (error) {
      console.error("[PatientController.getProfile]", error.message);

      if (error.statusCode === 404) {
        return res.status(404).json({ success: false, message: error.message });
      }
      return res
        .status(500)
        .json({ success: false, message: "Error al obtener el perfil" });
    }
  }

  // ──────────────────────────────────────────────────────────────
  // PUT /api/v1/patients/profile
  // ──────────────────────────────────────────────────────────────
  /**
   * Crea o actualiza el perfil del paciente autenticado.
   *
   * Body esperado:
   * {
   *   "birth_date":      "1995-08-20",          ← requerido
   *   "gender":          "femenino",            ← opcional
   *   "health_goals":    "Mejorar digestión",   ← opcional
   *   "languages":       ["es", "en"],          ← opcional
   *   "modality":        "online",              ← opcional
   *   "profile_picture": "path/to/pic.jpg",     ← opcional
   *   "country":         "Argentina",           ← opcional
   *   "city":            "Buenos Aires",        ← opcional
   *   "tag_ids":         [1, 3, 5]              ← opcional
   * }
   */
  async upsertProfile(req, res) {
    try {
      const {
        birth_date,
        gender,
        health_goals,
        languages,
        modality,
        profile_picture,
        country,
        city,
        tag_ids,
      } = req.body;

      // ── 1. Verificación de campos obligatorios (Defensa en Profundidad) ──────
      const REQUIRED_PATIENT_FIELDS = [
        "birth_date",
        "gender",
        "country",
        "city",
        "modality",
      ];
      const missingFields = REQUIRED_PATIENT_FIELDS.filter(
        (f) => !req.body[f] || String(req.body[f]).trim() === "",
      );
      if (missingFields.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Faltan campos obligatorios",
          data: { missing_fields: missingFields },
        });
      }

      // ── 2. Validaciones de formato ────────────────────────────────────────
      const errors = [];

      // Validación estricta: formato YYYY-MM-DD + existencia real en el calendario
      if (!Validator.isValidDate(birth_date)) {
        return res.status(400).json({
          success: false,
          message:
            "Formato de fecha inválido. Use YYYY-MM-DD y una fecha real del calendario.",
        });
      }

      const VALID_MODALITIES = ["online", "presencial", "hibrido"];
      if (!VALID_MODALITIES.includes(modality)) {
        errors.push({
          field: "modality",
          message: "modality debe ser: online, presencial o hibrido",
        });
      }

      if (languages !== undefined) {
        if (!Array.isArray(languages)) {
          errors.push({
            field: "languages",
            message: "languages debe ser un array de strings",
          });
        } else if (languages.length === 0) {
          errors.push({
            field: "languages",
            message: "languages debe contener al menos un idioma",
          });
        }
      }

      if (tag_ids !== undefined && !Array.isArray(tag_ids)) {
        errors.push({
          field: "tag_ids",
          message: "tag_ids debe ser un array de IDs numéricos",
        });
      }

      if (errors.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Hay errores de validación en los datos enviados",
          data: { errors },
        });
      }

      // ── Llamar al servicio ────────────────────────────────────
      const { profile, created } = await patientService.upsertProfile(
        req.user.id,
        {
          birth_date,
          gender,
          health_goals,
          languages,
          modality,
          profile_picture,
          country,
          city,
        },
        tag_ids || [],
      );

      return res.status(created ? 201 : 200).json({
        success: true,
        message: created
          ? "Perfil creado exitosamente"
          : "Perfil actualizado exitosamente",
        data: { profile },
      });
    } catch (error) {
      console.error("[PatientController.upsertProfile]", error.message);

      // Sequelize validation error (constraints del modelo)
      if (error.name === "SequelizeValidationError") {
        const messages = error.errors.map((e) => e.message);
        return res.status(400).json({
          success: false,
          message: "Error de validación de datos",
          data: { errors: messages },
        });
      }

      const statusCode = error.statusCode || 500;
      const message =
        statusCode < 500 ? error.message : "Error al guardar el perfil";
      return res.status(statusCode).json({ success: false, message });
    }
  }
}

module.exports = new PatientController();
