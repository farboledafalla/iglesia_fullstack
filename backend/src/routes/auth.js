//express es un framework de node.js que nos permite crear aplicaciones web de manera rápida y fácil.
const express = require('express');
// Creamos un router para manejar las rutas
const router = express.Router();
//express-validator es un middleware que nos permite validar los datos que recibimos en las peticiones.
//check es una función que nos permite validar un campo en particular.
const { check } = require('express-validator');

//Traemos el autController que contiene las funciones para manejar las peticiones de autenticación
const {
   login,
   register,
   forgotPassword,
   resetPassword,
} = require('../controllers/authController');

// Esta ruta responderá a las solicitudes POST al endpoint (/api/auth/login) que recibe el email y la contraseña y vienedesde el cliente FrontEnd del script (AuthContext.jsx)
// El contenido entre [] son los middlewares que se ejecutarán antes de la función login del controlador.
//login es la función controladora que se ejecuta si las validaciones de los middlewares son correctas.
router.post(
   '/login',
   [
      check('email', 'El email es obligatorio').isEmail(),
      check('password', 'La contraseña es obligatoria').not().isEmpty(),
   ],
   login
);

// Ruta para registro, este endpoint es consumido cuando se envía la petición desde el FrontEnd en el script (RegisterForm.jsx)
// El contenido entre [] son los middlewares que se ejecutarán antes de la función register del controlador.
// register es la función controladora que se ejecuta si las validaciones de los middlewares son correctas.
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
// Esta ruta es invocada desde el FrontEnd en el script (Login.jsx) cuando se hace click en el enlace "¿Olvidaste tu contraseña?"
router.post(
   '/forgot-password',
   [check('email', 'El email es obligatorio').isEmail()],
   forgotPassword
);

// Ruta para restablecer contraseña
// Esta ruta es invocada al hacer click en el link que se envía el email de recuperación de contraseña
// Ejemplo: http://localhost:5174/reset-password?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjo0fSwiaWF0IjoxNzQ5NDQwNTU1LCJleHAiOjE3NDk0NDQxNTV9.WWYI5fasg3HZEWOBzgEhcbDdL-8v5RWTIbQJ1B5Gpjg
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
