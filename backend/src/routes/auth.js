const express = require('express');
const router = express.Router();
const { check } = require('express-validator');

// Controladores (los crearemos después)
const {
   login,
   register,
   forgotPassword,
   resetPassword,
} = require('../controllers/authController');

// Ruta para login
router.post(
   '/login',
   [
      check('email', 'El email es obligatorio').isEmail(),
      check('password', 'La contraseña es obligatoria').not().isEmpty(),
   ],
   login
);

// Ruta para registro
router.post(
   '/register',
   [
      check('nombre', 'El nombre es obligatorio').not().isEmpty(),
      check('email', 'El email es obligatorio').isEmail(),
      check(
         'password',
         'La contraseña debe tener al menos 6 caracteres'
      ).isLength({ min: 6 }),
      check('pais_id', 'El país es obligatorio').isNumeric(),
   ],
   register
);

// Ruta para solicitar recuperación de contraseña
router.post(
   '/forgot-password',
   [check('email', 'El email es obligatorio').isEmail()],
   forgotPassword
);

// Ruta para restablecer contraseña
router.post(
   '/reset-password',
   [
      check('token', 'El token es obligatorio').not().isEmpty(),
      check(
         'newPassword',
         'La contraseña debe tener al menos 6 caracteres'
      ).isLength({ min: 6 }),
   ],
   resetPassword
);

module.exports = router;
