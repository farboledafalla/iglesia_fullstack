const express = require('express');
const router = express.Router();
const rolController = require('../controllers/rolController');
const auth = require('../middleware/auth');
const { checkRole } = require('../middleware/roleCheck');

// Ruta protegida solo para administradores
router.get('/', [auth, checkRole(['admin'])], rolController.getRoles);

module.exports = router;
