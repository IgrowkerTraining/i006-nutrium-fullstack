const express = require('express');
const nutritionistController = require('../controllers/nutritionistController');
const { authenticate, authorize } = require('../middleware/auth');

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
router.get(
  '/',
  nutritionistController.listNutritionists
);

// ─── Rutas protegidas (solo nutricionistas autenticados) ───────────────────────
router.get(
  '/profile',
  authenticate,
  authorize('nutritionist'),
  nutritionistController.getProfile
);

router.put(
  '/profile',
  authenticate,
  authorize('nutritionist'),
  nutritionistController.upsertProfile
);

router.post(
  '/availability',
  authenticate,
  authorize('nutritionist'),
  nutritionistController.setAvailability
);

module.exports = router;
