const express = require('express');
const router = express.Router();
const leccionController = require('../controllers/leccionController');
const auth = require('../middleware/auth');

router.use(auth);

router.get('/', leccionController.getLecciones);
router.post('/', leccionController.createLeccion);
router.put('/:id', leccionController.updateLeccion);
router.put('/:id/toggle-estado', leccionController.toggleEstado);
router.delete('/:id', leccionController.deleteLeccion);

module.exports = router;
