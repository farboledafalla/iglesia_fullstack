const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const pool = require('../config/database');

const authController = {
   // Login de usuario
   login: async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
         return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;

      try {
         // Verificar si el usuario existe
         const [users] = await pool.query(
            'SELECT u.*, r.nombre_rol FROM usuarios u JOIN roles r ON u.rol_id = r.rol_id WHERE u.email = ?',
            [email]
         );

         if (users.length === 0) {
            return res.status(400).json({ msg: 'Credenciales inválidas' });
         }

         const user = users[0];

         // Verificar la contraseña
         const isMatch = await bcrypt.compare(password, user.password_hash);
         if (!isMatch) {
            return res.status(400).json({ msg: 'Credenciales inválidas' });
         }

         // Crear payload para el JWT
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
               // Enviar tanto el token como la información del usuario
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

   // Registro de usuario
   register: async (req, res) => {
      try {
         const { nombre, email, password, telefono, pais_id } = req.body;

         // Iniciar transacción
         await pool.query('START TRANSACTION');

         try {
            // 1. Crear el usuario
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // Obtener el rol_id para 'estudiante'
            const [roles] = await pool.query(
               'SELECT rol_id FROM roles WHERE nombre_rol = ?',
               ['estudiante']
            );
            const rol_id = roles[0].rol_id;

            // Insertar el usuario
            const [result] = await pool.query(
               'INSERT INTO usuarios (nombre, email, password_hash, pais_id, rol_id) VALUES (?, ?, ?, ?, ?)',
               [nombre, email, hashedPassword, pais_id, rol_id]
            );

            const usuario_id = result.insertId;

            // 2. Crear el registro de alumno automáticamente
            await pool.query(
               'INSERT INTO alumnos (usuario_id, nombre, email, telefono, pais_id) VALUES (?, ?, ?, ?, ?)',
               [usuario_id, nombre, email, telefono, pais_id]
            );

            // Confirmar la transacción
            await pool.query('COMMIT');

            // Generar token JWT
            const payload = {
               user: {
                  id: usuario_id,
                  nombre,
                  email,
                  rol: 'estudiante',
               },
            };

            jwt.sign(
               payload,
               process.env.JWT_SECRET,
               { expiresIn: '24h' },
               (err, token) => {
                  if (err) throw err;
                  res.json({ token });
               }
            );
         } catch (error) {
            // Si hay error, hacer rollback
            await pool.query('ROLLBACK');
            throw error;
         }
      } catch (error) {
         console.error(error);
         res.status(500).json({
            msg: 'Error en el registro',
            error: error.message,
         });
      }
   },

   // Solicitar recuperación de contraseña
   forgotPassword: async (req, res) => {
      const { email } = req.body;

      try {
         // Verificar si el usuario existe
         const [users] = await pool.query(
            'SELECT usuario_id, nombre FROM usuarios WHERE email = ?',
            [email]
         );

         if (users.length === 0) {
            return res.status(404).json({ msg: 'Usuario no encontrado' });
         }

         const user = users[0];

         // Generar token de recuperación (expira en 1 hora)
         const resetToken = jwt.sign(
            { user: { id: user.usuario_id } },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
         );

         // Guardar el token en la base de datos
         await pool.query(
            'UPDATE usuarios SET reset_token = ?, reset_token_expires = DATE_ADD(NOW(), INTERVAL 1 HOUR) WHERE usuario_id = ?',
            [resetToken, user.usuario_id]
         );

         // Aquí normalmente enviarías un email con el link de recuperación
         // Por ahora solo devolvemos el token
         res.json({
            msg: 'Se ha enviado un enlace de recuperación a tu correo',
            resetToken, // En producción, no enviar el token en la respuesta
         });
      } catch (err) {
         console.error(err.message);
         res.status(500).send('Error del servidor');
      }
   },

   // Restablecer contraseña
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
