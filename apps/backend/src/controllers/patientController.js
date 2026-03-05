const patientService = require("../services/patientService");

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

      // ── Validaciones ──────────────────────────────────────────
      const errors = [];

      if (!birth_date || String(birth_date).trim() === "") {
        errors.push({
          field: "birth_date",
          message: "birth_date es requerido (formato YYYY-MM-DD)",
        });
      } else {
        const parsed = new Date(birth_date);
        if (isNaN(parsed.getTime())) {
          errors.push({
            field: "birth_date",
            message: "birth_date debe ser una fecha válida (YYYY-MM-DD)",
          });
        }
      }

      if (tag_ids !== undefined && !Array.isArray(tag_ids)) {
        errors.push({
          field: "tag_ids",
          message: "tag_ids debe ser un array de IDs numéricos",
        });
      }

      if (languages !== undefined && !Array.isArray(languages)) {
        errors.push({
          field: "languages",
          message: "languages debe ser un array de strings",
        });
      }

      if (errors.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Faltan campos requeridos o hay errores de validación",
          errors,
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

      const statusCode = error.statusCode || 500;
      const message =
        statusCode < 500 ? error.message : "Error al guardar el perfil";
      return res.status(statusCode).json({ success: false, message });
    }
  }
}

module.exports = new PatientController();
