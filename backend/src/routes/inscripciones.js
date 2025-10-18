const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const inscripcionesController = require('../controllers/inscripcionesController');

router.post('/', auth, inscripcionesController.create);
router.get('/', auth, inscripcionesController.listByAlumno);
router.patch('/:id', auth, inscripcionesController.update);

module.exports = router;
