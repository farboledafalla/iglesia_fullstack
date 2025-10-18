const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { checkRole } = require('../middleware/roleCheck');
const userController = require('../controllers/userController');

// Obtener todos los usuarios (solo admin)
router.get('/', [auth, checkRole(['admin'])], userController.getUsers);

//Obtener la distribución de usuarios por país
router.get('/por-pais', auth, userController.getUsuariosPorPais);

// Obtener total de usuarios y total de países con usuarios
router.get('/total', auth, userController.getTotalUsuarios);

// Crear nuevo usuario (solo admin)
router.post('/', [auth, checkRole(['admin'])], userController.createUser);

// Obtener usuario por ID
router.get('/:id', auth, userController.getUserById);

// Actualizar usuario
router.put('/:id', auth, userController.updateUser);

// Eliminar usuario (solo admin)
router.delete('/:id', [auth, checkRole(['admin'])], userController.deleteUser);

// Ruta para cambiar estado del usuario
router.put('/toggle-estado/:id', auth, userController.toggleEstado);

module.exports = router;
