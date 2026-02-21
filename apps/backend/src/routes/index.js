const express = require('express');
const authRoutes          = require('./auth');
const healthRoutes        = require('./health');
const nutritionistRoutes  = require('./nutritionists');

const router = express.Router();

router.use('/auth',          authRoutes);
router.use('/health',        healthRoutes);
router.use('/nutritionists', nutritionistRoutes);

module.exports = router;
