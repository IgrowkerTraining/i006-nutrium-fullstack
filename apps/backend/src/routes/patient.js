const express = require('express');
const patientController = require('../controllers/patientController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

/**
 * Middleware de autenticación JWT
 * Todos los endpoints de pacientes requieren un Bearer token válido.
 * El middleware inyecta req.user = { id, email, role }
 */
router.use(authenticate);

// ── GET /api/v1/patients/profile ─────────────────────────────────
// Devuelve el perfil del paciente autenticado junto con sus tags clínicos.
router.get('/profile', patientController.getProfile);

// ── PUT /api/v1/patients/profile ─────────────────────────────────
// Crea o actualiza el perfil. Acepta: birth_date, gender, health_goals, tag_ids[].
router.put('/profile', patientController.upsertProfile);

module.exports = router;

