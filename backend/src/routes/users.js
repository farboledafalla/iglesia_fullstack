const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { checkRole } = require('../middleware/roleCheck');
const userController = require('../controllers/userController');

// Controladores (los crearemos después)
const {
   getUsers,
   getUserById,
   updateUser,
   deleteUser,
} = require('../controllers/userController');

// Obtener todos los usuarios (solo admin)
router.get('/', [auth, checkRole(['admin'])], getUsers);

// Obtener usuario por ID
router.get('/:id', auth, getUserById);

// Actualizar usuario
router.put('/:id', auth, updateUser);

// Eliminar usuario (solo admin)
router.delete('/:id', [auth, checkRole(['admin'])], deleteUser);

// Ruta para cambiar estado del usuario
router.put('/toggle-estado/:id', auth, userController.toggleEstado);

module.exports = router;
