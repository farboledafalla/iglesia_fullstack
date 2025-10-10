// authController.js: es un script que contiene las funciones para manejar las peticiones de autenticación

// Para enviar email
const sendMail = require('../utils/mailer');
//bcryptjs es un paquete que te permite hashear contraseñas
const bcrypt = require('bcryptjs');
//jsonwebtoken es un paquete que te permite crear tokens JWT
const jwt = require('jsonwebtoken');
//express-validator es un paquete que te permite validar los datos que se envían en las peticiones
//validationResult es una función que te permite obtener los errores de validación de una petición
const { validationResult } = require('express-validator');
//pool es una función que te permite conectar a la base de datos
const pool = require('../config/database');
//Importar función obtenerFechaHoraActual
const { obtenerFechaHoraActual } = require('../utils/funciones');

// Controlador para manejar las peticiones de autenticación
const authController = {
   // Login de usuario, esta función es invocada si los middlewares de validación en el script (/src/routes/auth.js) en la ruta (router.post::/login) son correctos
   // Esta función recibe dos parametros: req y res que son los objetos que se pasan a la función
   // req es el objeto que contiene la información de la petición
   // res es el objeto que contiene la información de la respuesta
   login: async (req, res) => {
      // Validar los datos de entrada
      // validationResult es una función que te permite obtener los errores de validación de una petición, por ejemplo si el email no es válido
      const errors = validationResult(req);
      // Si hay errores, se devuelve un mensaje de error con los errores
      if (!errors.isEmpty()) {
         return res.status(400).json({ errors: errors.array() });
      }

      // Obtener los datos del usuario que viajan en el body de la petición
      const { email, password } = req.body;

      try {
         // Verificar si ese email está asociado a un usuario y que ese usuario tenga un rol_id asociado a un rol en la tabla roles
         // Esta petición retorna un array con los usuarios que coinciden con el email
         const [users] = await pool.query(
            'SELECT u.*, r.nombre_rol FROM usuarios u JOIN roles r ON u.rol_id = r.rol_id WHERE u.email = ?',
            [email]
         );

         console.log('\n\n------------------------------------------------');
         console.log(obtenerFechaHoraActual());
         console.log('/controllers/authController.js');
         console.log(
            'Consulta alumnos:',
            'SELECT u.*, r.nombre_rol FROM usuarios u JOIN roles r ON u.rol_id = r.rol_id WHERE u.email =',
            email
         );

         // Si no hay usuarios con ese email, se devuelve un mensaje de error
         if (users.length === 0) {
            console.log('\n\n------------------------------------------------');
            console.log(obtenerFechaHoraActual());
            console.log('/controllers/authController.js');
            console.log('No existe el email', email);
            return res
               .status(400)
               .json({ msg: 'No existe el email', email: email });
         }

         // Extraer el primer usuario del array, si existe un usuario con ese email, se guarda en la variable user
         const user = users[0];

         // Verificar la contraseña
         const isMatch = await bcrypt.compare(password, user.password_hash);
         // Si la contraseña no coincide, se devuelve un mensaje de error
         if (!isMatch) {
            console.log('\n\n------------------------------------------------');
            console.log(obtenerFechaHoraActual());
            console.log('/controllers/authController.js');
            console.error(
               'La contraseña no es la correcta para el email',
               email
            );
            return res.status(400).json({
               msg: 'La contraseña no es la correcta para el email',
               email: email,
            });
         }

         // Crear payload para el JWT, esto se puede ver desde el navegador en la pestaña Network > Headers > Request Headers > Authorization
         const payload = {
            user: {
               id: user.usuario_id,
               nombre: user.nombre,
               email: user.email,
               rol: user.nombre_rol.toLowerCase(),
            },
         };

         // Generar el token
         jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '24h' },
            (err, token) => {
               if (err) throw err;

               // Enviar al FrontEnd tanto el token como la información del usuario
               res.json({
                  token,
                  user: {
                     id: user.usuario_id,
                     nombre: user.nombre,
                     email: user.email,
                     rol: user.nombre_rol.toLowerCase(),
                  },
               });
            }
         );
      } catch (err) {
         console.error('Error completo:', err);
         res.status(500).send('Error del servidor');
      }
   },

   // Registro de usuario, función que se ejecuta cuando los middlewares de validación en el script (/src/routes/auth.js) en la ruta (router.post::/register) son correctos
   // req es el objeto que contiene la información de la petición
   // res es el objeto que contiene la información de la respuesta
   register: async (req, res) => {
      // Usar una conexión dedicada del pool para la transacción
      let connection;
      try {
         // Tomar los datos de entrada
         const { identificacion, nombre, email, password, telefono, pais_id } = req.body;

         connection = await pool.getConnection();

         // Promisify de connection.query para usar async/await
         const query = (sql, params) =>
            new Promise((resolve, reject) => {
               connection.query(sql, params, (err, results) => {
                  if (err) return reject(err);
                  resolve(results);
               });
            });

         // Iniciar transacción en esta conexión
         await new Promise((resB, rejB) => connection.beginTransaction((err) => (err ? rejB(err) : resB())));

         // Generar el hash de la contraseña ingresada
         const salt = await bcrypt.genSalt(10);
         const hashedPassword = await bcrypt.hash(password, salt);

         // Obtener el rol_id para el rol 'estudiante'
         const roles = await query('SELECT rol_id FROM roles WHERE nombre_rol = ?', ['estudiante']);
         const rol_id = roles[0].rol_id;

         // Insertar el usuario
         const result = await query(
            'INSERT INTO usuarios (nombre, email, password_hash, pais_id, rol_id) VALUES (?, ?, ?, ?, ?)',
            [nombre, email, hashedPassword, pais_id, rol_id]
         );

         const usuario_id = result.insertId;

         // Crear el registro en la tabla alumnos automáticamente
         await query(
            'INSERT INTO alumnos (usuario_id, identificacion, nombre, email, telefono, pais_id) VALUES (?, ?, ?, ?, ?, ?)',
            [usuario_id, identificacion, nombre, email, telefono, pais_id]
         );

         // Confirmar la transacción
         await new Promise((resC, rejC) => connection.commit((err) => (err ? rejC(err) : resC())));

         // Generar token JWT
         const payload = {
            user: {
               id: usuario_id,
               nombre,
               email,
               rol: 'estudiante',
            },
         };

         jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' }, (err, token) => {
            if (err) throw err;
            res.json({ token });
         });
      } catch (error) {
         // Rollback si hay conexión iniciada
         try {
            if (connection) await new Promise((resR, rejR) => connection.rollback((err) => (err ? rejR(err) : resR())));
         } catch (rbErr) {
            console.error('Error during rollback:', rbErr);
         }

         console.error(error);
         res.status(500).json({ msg: 'Error en el registro', error: error.message });
      } finally {
         // Liberar la conexión si fue tomada
         if (connection) connection.release();
      }
   },

   // Solicitar recuperación de contraseña
   forgotPassword: async (req, res) => {
      const { email } = req.body;

      try {
         // Verificar si el usuario existe
         // Consultar el registro del usuario por el email
         const [users] = await pool.query(
            'SELECT usuario_id,email nombre FROM usuarios WHERE email = ?',
            [email]
         );

         // Si no hay usuarios con ese email, se devuelve un mensaje de error
         if (users.length === 0) {
            return res.status(404).json({ msg: 'Usuario no encontrado' });
         }

         // Extraer el primer usuario del array, si existe un usuario con ese email, se guarda en la variable user
         const user = users[0];

         // Generar token de recuperación (expira en 1 hora)
         const resetToken = jwt.sign(
            { user: { id: user.usuario_id } },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
         );

         // Guardar el token en la base de datos
         // Se actualiza el registro del usuario con el token de recuperación y la fecha de expiración del token, la fecha de expiración se calcula sumando 1 hora a la fecha actual
         await pool.query(
            'UPDATE usuarios SET reset_token = ?, reset_token_expires = DATE_ADD(NOW(), INTERVAL 1 HOUR) WHERE usuario_id = ?',
            [resetToken, user.usuario_id]
         );

         // Se envía un email con el link de recuperación
         // Ejemplo: http://localhost:5174/reset-password?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjo0fSwiaWF0IjoxNzQ5NDQwNTU1LCJleHAiOjE3NDk0NDQxNTV9.WWYI5fasg3HZEWOBzgEhcbDdL-8v5RWTIbQJ1B5Gpjg
         const resetLink = `http://localhost:5174/reset-password?token=${resetToken}`;
         await sendMail({
            to: email,
            subject: 'Recuperación de contraseña',
            text: `Haz clic en el siguiente enlace para restablecer tu contraseña: ${resetLink}`,
            html: `<p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p><a href="${resetLink}">${resetLink}</a>`,
         });

         // Por ahora solo devolvemos el token
         res.json({
            msg: `Se ha enviado un enlace de recuperación al correo ${email}`,
            resetToken, // En producción, no enviar el token en la respuesta
         });
      } catch (err) {
         console.error(err.message);
         res.status(500).send('Error del servidor');
      }
   },

   // Restablecer contraseña
   // Esta función es invocada desde auth.js en la ruta (router.post::/reset-password) y se activa al darle click al link que llega el email de recuperación de contraseña
   resetPassword: async (req, res) => {
      const { token, newPassword } = req.body;

      try {
         // Verificar el token y obtener el usuario
         const [users] = await pool.query(
            'SELECT usuario_id FROM usuarios WHERE reset_token = ? AND reset_token_expires > NOW() AND estado = "ACTIVO"',
            [token]
         );

         if (users.length === 0) {
            return res.status(400).json({ msg: 'Token inválido o expirado' });
         }

         const user = users[0];

         // Hashear la nueva contraseña
         const salt = await bcrypt.genSalt(10);
         const hashedPassword = await bcrypt.hash(newPassword, salt);

         // Actualizar la contraseña y limpiar el token
         await pool.query(
            'UPDATE usuarios SET password_hash = ?, reset_token = NULL, reset_token_expires = NULL WHERE usuario_id = ?',
            [hashedPassword, user.usuario_id]
         );

         res.json({ msg: 'Contraseña actualizada correctamente' });
      } catch (err) {
         console.error(err.message);
         res.status(500).send('Error del servidor');
      }
   },
};

module.exports = authController;
