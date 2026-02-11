const express = require('express');
const authRoutes = require('./auth');
const healthRoutes = require('./health');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/health', healthRoutes);

module.exports = router;
