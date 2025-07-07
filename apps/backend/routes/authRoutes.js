const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/login', authController.login);
router.post('/register', authController.register);
router.post('/google', authController.googleAuth);
router.post('/logout', authController.logout);
router.get('/profile', authController.getProfile);

module.exports = router; 