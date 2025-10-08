//paises.js: este script definirá las rutas y el controlador para manejar las solicitudes relacionadas con los países.

const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { check } = require('express-validator');
const auth = require('../middleware/auth');
const { checkRole } = require('../middleware/roleCheck');
const {
   getPaises,
   getPaisById,
   createPais,
   updatePais,
   deletePais,
   createMultiplePaises,
} = require('../controllers/paisController');

router.get('/', getPaises);

// Crear múltiples países (solo admin)
router.post(
   '/batch',
   [
      auth,
      checkRole(['admin']),
      check('paises', 'Debe proporcionar un array de países').isArray(),
      check('paises.*.nombre_pais', 'El nombre del país es obligatorio')
         .not()
         .isEmpty(),
      check('paises.*.continente_id', 'El ID del continente es obligatorio')
         .not()
         .isEmpty()
         .isInt({ min: 1 }),
   ],
   createMultiplePaises
);

module.exports = router;
