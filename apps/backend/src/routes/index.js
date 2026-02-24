const express = require('express');
const authRoutes = require('./auth');
const healthRoutes = require('./health');
const patientRoutes = require('./patient');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/health', healthRoutes);
router.use('/patients', patientRoutes);

module.exports = router;
