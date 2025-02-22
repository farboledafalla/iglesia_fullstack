const express = require('express');
const router = express.Router();
const alumnoController = require('../controllers/alumnoController');
const auth = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.use(auth);

// Obtener todos los alumnos
router.get('/', alumnoController.getAlumnos);

// Crear un nuevo alumno
router.post('/', alumnoController.createAlumno);

// Actualizar un alumno
router.put('/:id', alumnoController.updateAlumno);

// Cambiar estado del alumno
router.put('/:id/toggle-estado', alumnoController.toggleEstado);

// Obtener total de alumnos
router.get('/total', alumnoController.getTotalAlumnos);

// Eliminar un alumno
router.delete('/:id', alumnoController.deleteAlumno);

// Obtener distribución de alumnos por país
router.get('/por-pais', alumnoController.getAlumnosPorPais);

// Ruta para obtener el perfil del alumno
router.get('/perfil/:id', alumnoController.getPerfil);

module.exports = router;
