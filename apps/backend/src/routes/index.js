const express = require('express');
const authRoutes          = require('./auth');
const healthRoutes        = require('./health');
const nutritionistRoutes  = require('./nutritionists');
const patientRoutes       = require('./patient');
const appointmentRoutes   = require('./appointments');

const router = express.Router();

router.use('/auth',          authRoutes);
router.use('/health',        healthRoutes);
router.use('/nutritionists', nutritionistRoutes);
router.use('/patients',      patientRoutes);
router.use('/appointments',  appointmentRoutes);

module.exports = router;
