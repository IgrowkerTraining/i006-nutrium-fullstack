const express = require('express');
const patientController = require('../controllers/patientController');
const { authenticateUser } = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * Middleware de autenticación
 * Todos los endpoints de pacientes requieren autenticación
 */
router.use(authenticateUser);

// ============ ENDPOINTS DE PERFIL (Profile) ============

/**
 * GET /api/v1/patients/profile
 * Obtiene el perfil del paciente autenticado
 */
router.get('/profile', patientController.getProfile);

/**
 * POST /api/v1/patients/profile
 * Crea o actualiza el perfil del paciente
 */
router.post('/profile', patientController.createOrUpdateProfile);

// ============ ENDPOINTS DE ETIQUETAS/SALUD (Tags) ============

/**
 * GET /api/v1/patients/tags
 * Obtiene las etiquetas (condiciones de salud) del paciente
 */
router.get('/tags', patientController.getTags);

/**
 * POST /api/v1/patients/tags
 * Agrega o actualiza las etiquetas del paciente
 */
router.post('/tags', patientController.createOrUpdateTags);

module.exports = router;
