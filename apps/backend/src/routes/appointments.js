const express = require("express");
const appointmentController = require("../controllers/appointmentController");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

/**
 * Rutas de Appointments
 *
 * Todas las rutas requieren autenticación JWT mediante el middleware authenticate
 * que inyecta req.user con { id, email, role, ... }
 */

// ──────────────────────────────────────────────────────────────
// POST /api/v1/appointments
// Crear una nueva cita
// ──────────────────────────────────────────────────────────────
router.post("/", authenticate, (req, res) =>
  appointmentController.createAppointment(req, res),
);

// ──────────────────────────────────────────────────────────────
// GET /api/v1/appointments/my-calendar
// Obtener calendario del usuario autenticado
// ──────────────────────────────────────────────────────────────
// NOTA: Esta ruta debe estar ANTES de /:id para evitar que
// "my-calendar" se interprete como un ID
router.get("/my-calendar", authenticate, (req, res) =>
  appointmentController.getMyCalendar(req, res),
);

// ──────────────────────────────────────────────────────────────
// GET /api/v1/appointments/:id
// Obtener detalles de una cita específica
// ──────────────────────────────────────────────────────────────
router.get("/:id", authenticate, (req, res) =>
  appointmentController.getAppointmentById(req, res),
);

router.patch("/:id/confirm", authenticate, (req, res) =>
  appointmentController.confirmAppointment(req, res),
);

router.patch("/:id/cancel", authenticate, (req, res) =>
  appointmentController.cancelAppointment(req, res),
);

// ──────────────────────────────────────────────────────────────
// DELETE /api/v1/appointments/:id
// Cancelar una cita
// ──────────────────────────────────────────────────────────────
router.delete("/:id", authenticate, (req, res) =>
  appointmentController.cancelAppointment(req, res),
);

module.exports = router;
