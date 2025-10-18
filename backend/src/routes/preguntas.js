const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const preguntasController = require('../controllers/preguntasController');

router.post('/', auth, preguntasController.createQuestion);
router.get('/:id', auth, preguntasController.getQuestion);

module.exports = router;
