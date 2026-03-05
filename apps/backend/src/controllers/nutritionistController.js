const nutritionistService = require("../services/nutritionistService");

/**
 * NutritionistController
 *
 * Responsabilidades:
 *  - Extraer y validar los datos de `req` (params, body, query, user).
 *  - Llamar al método correspondiente del Service.
 *  - Formatear y devolver la respuesta HTTP.
 *  - Delegar cualquier lógica de negocio al Service, NUNCA aquí.
 */
class NutritionistController {
  // ──────────────────────────────────────────────────────────────
  // GET /api/v1/nutritionists/profile
  // ──────────────────────────────────────────────────────────────
  /**
   * Devuelve el perfil completo del nutricionista autenticado,
   * incluyendo sus tags clínicos y franjas de disponibilidad.
   *
   * Requiere: Bearer token con role 'nutritionist'
   */
  async getProfile(req, res) {
    try {
      // req.user.id proviene del middleware `authenticate`
      const profile = await nutritionistService.getProfile(req.user.id);

      return res.status(200).json({
        success: true,
        message: "Perfil obtenido exitosamente",
        data: { profile },
      });
    } catch (error) {
      console.error("[NutritionistController.getProfile]", error.message);

      if (error.statusCode === 404) {
        return res.status(404).json({ success: false, message: error.message });
      }
      return res
        .status(500)
        .json({ success: false, message: "Error al obtener el perfil" });
    }
  }

  // ──────────────────────────────────────────────────────────────
  // PUT /api/v1/nutritionists/profile
  // ──────────────────────────────────────────────────────────────
  /**
   * Crea o actualiza el perfil del nutricionista autenticado.
   *
   * Body esperado:
   * {
   *   "license_number": "MP-12345",
   *   "bio": "Especialista en nutrición deportiva...",
   *   "modality": "online" | "presencial" | "hibrido",
   *   "years_of_experience": 5,
   *   "country": "Argentina",         ← opcional
   *   "city": "Buenos Aires",         ← opcional
   *   "tag_ids": [1, 2]   ← requerido
   * }
   */
  async upsertProfile(req, res) {
    try {
      const {
        license_number,
        bio,
        modality,
        years_of_experience,
        country,
        city,
        tag_ids,
      } = req.body;

      // Validar campos requeridos
      const errors = [];

      if (!license_number || String(license_number).trim() === "") {
        errors.push({
          field: "license_number",
          message: "license_number es requerido",
        });
      }

      if (!bio || String(bio).trim() === "") {
        errors.push({ field: "bio", message: "bio es requerido" });
      }

      if (!modality || String(modality).trim() === "") {
        errors.push({
          field: "modality",
          message: "modality es requerida (online | presencial | hibrido)",
        });
      }

      if (
        years_of_experience === undefined ||
        years_of_experience === null ||
        years_of_experience === ""
      ) {
        errors.push({
          field: "years_of_experience",
          message: "years_of_experience es requerido",
        });
      } else if (
        isNaN(Number(years_of_experience)) ||
        Number(years_of_experience) < 0
      ) {
        errors.push({
          field: "years_of_experience",
          message: "years_of_experience debe ser un número mayor o igual a 0",
        });
      }

      if (!tag_ids || !Array.isArray(tag_ids) || tag_ids.length === 0) {
        errors.push({
          field: "tag_ids",
          message:
            "tag_ids es requerido y debe ser un array con al menos un elemento",
        });
      }

      if (errors.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Faltan campos requeridos",
          errors,
        });
      }

      const { profile, created } = await nutritionistService.upsertProfile(
        req.user.id,
        { license_number, bio, modality, years_of_experience, country, city },
        tag_ids,
      );

      return res.status(created ? 201 : 200).json({
        success: true,
        message: created
          ? "Perfil creado exitosamente"
          : "Perfil actualizado exitosamente",
        data: { profile },
      });
    } catch (error) {
      console.error("[NutritionistController.upsertProfile]", error.message);

      const statusCode = error.statusCode || 500;
      const message =
        statusCode < 500 ? error.message : "Error al guardar el perfil";
      return res.status(statusCode).json({ success: false, message });
    }
  }

  // ──────────────────────────────────────────────────────────────
  // POST /api/v1/nutritionists/availability
  // ──────────────────────────────────────────────────────────────
  /**
   * Gestiona el horario del nutricionista.
   * REEMPLAZA completamente las franjas activas con el array enviado.
   *
   * Body esperado:
   * {
   *   "slots": [
   *     { "day_of_week": 1, "start_time": "09:00", "end_time": "13:00" },
   *     { "day_of_week": 3, "start_time": "14:00", "end_time": "18:00" }
   *   ]
   * }
   * Convención day_of_week: 0=Domingo, 1=Lunes, 2=Martes, 3=Miércoles,
   *                          4=Jueves, 5=Viernes, 6=Sábado
   */
  async setAvailability(req, res) {
    try {
      const { slots } = req.body;

      const created = await nutritionistService.setAvailability(
        req.user.id,
        slots,
      );

      return res.status(200).json({
        success: true,
        message: `Disponibilidad actualizada: ${created.length} franja(s) guardada(s)`,
        data: { slots: created },
      });
    } catch (error) {
      console.error("[NutritionistController.setAvailability]", error.message);

      const statusCode = error.statusCode || 500;
      const message =
        statusCode < 500 ? error.message : "Error al guardar la disponibilidad";
      return res.status(statusCode).json({ success: false, message });
    }
  }

  // ──────────────────────────────────────────────────────────────
  // PUT /api/v1/nutritionists/availability
  // Reemplazar disponibilidad (hard delete + bulkCreate)
  // ──────────────────────────────────────────────────────────────
  /**
   * Recibe un array de slots y reemplaza COMPLETAMENTE la disponibilidad
   * del nutricionista: elimina las franjas anteriores (destroy) y crea
   * las nuevas (bulkCreate) dentro de una transacción atómica.
   *
   * Body esperado:
   * {
   *   "slots": [
   *     { "day_of_week": 1, "start_time": "09:00", "end_time": "13:00" },
   *     { "day_of_week": 3, "start_time": "14:00", "end_time": "18:00" }
   *   ]
   * }
   */
  async replaceAvailability(req, res) {
    try {
      const { slots } = req.body;

      if (!slots || !Array.isArray(slots)) {
        return res.status(400).json({
          success: false,
          message: "`slots` es requerido y debe ser un array",
          data: null,
        });
      }

      const created = await nutritionistService.replaceAvailability(
        req.user.id,
        slots,
      );

      return res.status(200).json({
        success: true,
        message: `Disponibilidad reemplazada: ${created.length} franja(s) guardada(s)`,
        data: { slots: created },
      });
    } catch (error) {
      console.error(
        "[NutritionistController.replaceAvailability]",
        error.message,
      );

      const statusCode = error.statusCode || 500;
      const message =
        statusCode < 500
          ? error.message
          : "Error al reemplazar la disponibilidad";
      return res
        .status(statusCode)
        .json({ success: false, message, data: null });
    }
  }

  // ──────────────────────────────────────────────────────────────
  // GET /api/v1/nutritionists  (público)
  // ──────────────────────────────────────────────────────────────
  /**
   * Lista nutricionistas con sus especialidades.
   * Endpoint público – no requiere autenticación.
   *
   * Query params:
   *   ?page=1            → página actual (default 1)
   *   ?limit=10          → resultados por página (default 10)
   *   ?tag=deportiva     → filtrar por slug de tag (opcional)
   */
  async listNutritionists(req, res) {
    try {
      const { page, limit, tag } = req.query;

      const result = await nutritionistService.listNutritionists({
        page,
        limit,
        tag,
      });

      return res.status(200).json({
        success: true,
        message: "Listado de nutricionistas obtenido",
        data: result,
      });
    } catch (error) {
      console.error(
        "[NutritionistController.listNutritionists]",
        error.message,
      );
      return res
        .status(500)
        .json({ success: false, message: "Error al listar nutricionistas" });
    }
  }
}

module.exports = new NutritionistController();
