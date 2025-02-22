const express = require('express');
const router = express.Router();
const progresoAlumnosController = require('../controllers/progresoAlumnosController');
const auth = require('../middleware/auth');

router.use(auth);

router.get('/', progresoAlumnosController.getProgresoAlumnos);
router.get('/:alumno_id', progresoAlumnosController.getProgresoAlumno);
router.post('/', progresoAlumnosController.createProgresoAlumno);
router.put('/:id', progresoAlumnosController.updateProgresoAlumno);

module.exports = router; 