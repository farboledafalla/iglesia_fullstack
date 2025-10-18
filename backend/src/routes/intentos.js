const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const intentosController = require('../controllers/intentosController');

router.post('/lecciones/:leccion_id', auth, intentosController.startAttempt);
router.get('/:attempt_id', auth, intentosController.getAttempt);
router.post('/:attempt_id/submit', auth, intentosController.submitAttempt);

module.exports = router;
