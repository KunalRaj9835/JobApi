const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');

// POST /signup - Register new user
router.post('/signup', AuthController.signup.bind(AuthController));

// POST /login - Authenticate user
router.post('/login', AuthController.login.bind(AuthController));

module.exports = router;