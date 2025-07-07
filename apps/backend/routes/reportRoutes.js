const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

router.get('/global', reportController.globalSales);
router.get('/periodic', reportController.periodicSales);
router.get('/income', reportController.periodicIncome);
router.get('/complex', reportController.complexReport);

module.exports = router; 