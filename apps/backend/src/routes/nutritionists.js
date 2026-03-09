const express = require("express");
const nutritionistController = require("../controllers/nutritionistController");
const { authenticate, authorize } = require("../middleware/auth");

const router = express.Router();

/**
 * RUTAS DEL MÓDULO DE NUTRICIONISTAS
 *
 * Base: /api/v1/nutritionists
 *
 * Públicas (no requieren token):
 *   GET  /                → Lista de nutricionistas con sus especialidades
 *
 * Protegidas (requieren Bearer token + role nutritionist):
 *   GET  /profile         → Perfil del nutricionista autenticado
 *   PUT  /profile         → Crear o actualizar perfil
 *   POST /availability    → Gestionar franjas horarias
 */

// ─── Rutas públicas ────────────────────────────────────────────────────────────
router.get("/", nutritionistController.listNutritionists);
// Agenda pública de un nutricionista: slots del día + citas activas
// Requiere autenticación (cualquier rol) para evitar exposición de datos
// de turnos. El frontend lo llama al seleccionar una fecha en el booking flow.
router.get("/:id/agenda", authenticate, nutritionistController.getAgenda);
// ─── Rutas protegidas (solo nutricionistas autenticados) ───────────────────────
router.get(
  "/profile",
  authenticate,
  authorize("nutritionist"),
  nutritionistController.getProfile,
);

router.put(
  "/profile",
  authenticate,
  authorize("nutritionist"),
  nutritionistController.upsertProfile,
);

router.post(
  "/availability",
  authenticate,
  authorize("nutritionist"),
  nutritionistController.setAvailability,
);

// ─── PUT /availability ─────────────────────────────────────────────────────────
// Reemplaza la disponibilidad completa del nutricionista:
// hard-delete de todas las franjas anteriores + bulkCreate de las nuevas.
// Semánticamente más correcto que POST para una operación de reemplazo total.
router.put(
  "/availability",
  authenticate,
  authorize("nutritionist"),
  (req, res) => nutritionistController.replaceAvailability(req, res),
);

module.exports = router;
