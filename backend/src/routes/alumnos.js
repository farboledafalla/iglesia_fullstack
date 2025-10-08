// alumnos.js: este script define las rutas para la gestión de alumnos en una aplicación web.

// Importar express
const express = require('express');
// Crear un router
const router = express.Router();
// Importar el controlador de alumnos
const alumnoController = require('../controllers/alumnoController');
// Importar el middleware de autenticación para verificar si el usuario está autenticado
const auth = require('../middleware/auth');

// Todas las rutas requieren autenticación, esto es importante para que no puedan acceder a las rutas sin autenticación desde la url
router.use(auth);

// Obtener todos los alumnos
router.get('/', alumnoController.getAlumnos);

// Crear un nuevo alumno
router.post('/', alumnoController.createAlumno);

// Actualizar un alumno
router.put('/:id', alumnoController.updateAlumno);

// Cambiar estado del alumno
router.put('/:id/toggle-estado', alumnoController.toggleEstado);

// Obtener los datos de las tarjetas de la parte superior (Total Alumnos, Alumnos Activos, Alumnos Inactivos y Total Paises), esta ruta la se invoca desde el script AdminDashboard.jsx en el useEffect que se ejecuta cuando se carga la página y cada vez que cambia el estado del token
router.get('/total', alumnoController.getTotalAlumnos);

// Eliminar un alumno
router.delete('/:id', alumnoController.deleteAlumno);

// Obtener distribución de alumnos por país, esta ruta es para pintar el grafico de barras de Alumnos por país
router.get('/por-pais', alumnoController.getAlumnosPorPais);

// Ruta para obtener el perfil del alumno
router.get('/perfil/:id', alumnoController.getPerfil);

module.exports = router;
