const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const auth = require('../middleware/auth');
const { checkRole } = require('../middleware/roleCheck');
const {
   getContinentes,
   getContinenteById,
   createContinente,
   updateContinente,
   deleteContinente,
   createMultipleContinentes,
} = require('../controllers/continenteController');

// Obtener todos los continentes (público)
router.get('/', getContinentes);

// Obtener un continente por ID (público)
router.get('/:id', getContinenteById);

// Crear un continente (solo admin)
router.post(
   '/',
   [
      auth,
      checkRole(['admin']),
      check('nombre_continente', 'El nombre del continente es obligatorio')
         .not()
         .isEmpty(),
   ],
   createContinente
);

// Actualizar un continente (solo admin)
router.put(
   '/:id',
   [
      auth,
      checkRole(['admin']),
      check('nombre_continente', 'El nombre del continente es obligatorio')
         .not()
         .isEmpty(),
   ],
   updateContinente
);

// Eliminar un continente (solo admin)
router.delete('/:id', [auth, checkRole(['admin'])], deleteContinente);

// Crear múltiples continentes (solo admin)
router.post(
   '/batch',
   [
      auth,
      checkRole(['admin']),
      check(
         'continentes',
         'Debe proporcionar un array de continentes'
      ).isArray(),
      check(
         'continentes.*.nombre_continente',
         'El nombre del continente es obligatorio'
      )
         .not()
         .isEmpty(),
   ],
   createMultipleContinentes
);

module.exports = router;
