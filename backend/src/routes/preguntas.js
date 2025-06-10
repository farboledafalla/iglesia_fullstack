const express = require('express');
const router = express.Router();
const preguntaController = require('../controllers/preguntaController');
const auth = require('../middleware/auth');

router.use(auth);

router.get('/', preguntaController.getPreguntasPorLeccion);
router.post('/', preguntaController.createPregunta);
router.put('/:id', preguntaController.updatePregunta);
router.put('/:id/toggle-estado', preguntaController.toggleEstado);
router.get('/leccion/:leccionId', preguntaController.getPreguntasPorLeccion);

module.exports = router;
