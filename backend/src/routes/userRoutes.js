const express = require('express');
const router = express.Router();
const { getUsers, createUser, updateUser, softDeleteUser, updateOwnProfile } = require('../controllers/userController');
const { authMiddleware, roleMiddleware } = require('../authMiddleware');

router.put('/me/profile', authMiddleware, updateOwnProfile);

// Solo el rol_id = 1 (Coordinador) puede acceder a estas rutas
router.use(authMiddleware, roleMiddleware([1]));
router.get('/', getUsers);
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', softDeleteUser);

module.exports = router;