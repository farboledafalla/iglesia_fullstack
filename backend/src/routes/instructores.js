const express = require('express');
const router = express.Router();
const instructorController = require('../controllers/instructorController');
const auth = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.use(auth);

// Obtener todos los instructores
router.get('/', instructorController.getInstructores);

// Obtener un instructor específico
router.get('/:id', instructorController.getInstructor);

// Crear un nuevo instructor
router.post('/', instructorController.createInstructor);

// Actualizar un instructor
router.put('/:id', instructorController.updateInstructor);

module.exports = router;
