const express = require('express');
const router = express.Router();
const { getUsers, createUser, updateUser, softDeleteUser } = require('../controllers/userController');
const { checkAuthAndRole } = require('../authMiddleware');

// Solo el rol_id = 1 (Coordinador) puede acceder a estas rutas
router.get('/', checkAuthAndRole([1]), getUsers);
router.post('/', checkAuthAndRole([1]), createUser);
router.put('/:id', checkAuthAndRole([1]), updateUser);
router.delete('/:id', checkAuthAndRole([1]), softDeleteUser);

module.exports = router;