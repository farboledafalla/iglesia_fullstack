const express = require('express');
const router = express.Router();
const moduloController = require('../controllers/moduloController');
const auth = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.use(auth);

// Obtener todos los módulos
router.get('/', moduloController.getModulos);

// Crear un nuevo módulo
router.post('/', moduloController.createModulo);

// Actualizar un módulo
router.put('/:id', moduloController.updateModulo);

// Cambiar estado del módulo
router.put('/:id/toggle-estado', moduloController.toggleEstado);

// Eliminar un módulo
router.delete('/:id', moduloController.deleteModulo);

// Obtener módulos con sus lecciones
router.get('/con-lecciones', moduloController.getModulosConLecciones);

module.exports = router;
