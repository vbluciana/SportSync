const express = require('express');
const router = express.Router();
const { login, registerPlayer } = require('../controllers/authController');

// Definimos que cuando hagan un POST a /login, se ejecute nuestra función
router.post('/login', login);
router.post('/register', registerPlayer);

module.exports = router;

