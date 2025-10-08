const { validationResult } = require('express-validator');
const pool = require('../config/database');
const bcrypt = require('bcryptjs');

const userController = {
   // Obtener todos los usuarios
   getUsers: async (req, res) => {
      try {
         const [users] = await pool.query(
            'SELECT u.usuario_id, u.nombre, u.email, u.estado, r.nombre_rol, p.nombre_pais ' +
               'FROM usuarios u ' +
               'JOIN roles r ON u.rol_id = r.rol_id ' +
               'JOIN paises p ON u.pais_id = p.pais_id'
         );
         res.json(users);
      } catch (err) {
         console.error(err.message);
         res.status(500).send('Error del servidor');
      }
   },

   // Obtener usuario por ID
   getUserById: async (req, res) => {
      try {
         const [users] = await pool.query(
            'SELECT u.usuario_id, u.nombre, u.email, u.estado, r.nombre_rol, p.nombre_pais ' +
               'FROM usuarios u ' +
               'JOIN roles r ON u.rol_id = r.rol_id ' +
               'JOIN paises p ON u.pais_id = p.pais_id ' +
               'WHERE u.usuario_id = ?',
            [req.params.id]
         );

         if (users.length === 0) {
            return res.status(404).json({ msg: 'Usuario no encontrado' });
         }

         res.json(users[0]);
      } catch (err) {
         console.error(err.message);
         res.status(500).send('Error del servidor');
      }
   },

   // Actualizar usuario
   updateUser: async (req, res) => {
      const { nombre, email, pais_id } = req.body;

      try {
         const [result] = await pool.query(
            'UPDATE usuarios SET nombre = ?, email = ?, pais_id = ? WHERE usuario_id = ?',
            [nombre, email, pais_id, req.params.id]
         );

         if (result.affectedRows === 0) {
            return res.status(404).json({ msg: 'Usuario no encontrado' });
         }

         res.json({ msg: 'Usuario actualizado correctamente' });
      } catch (err) {
         console.error(err.message);
         res.status(500).send('Error del servidor');
      }
   },

   // Crear usuario
   createUser: async (req, res) => {
      const { nombre, email, password, pais_id, rol_id } = req.body;

      try {
         // Validar email único
         const [existing] = await pool.query(
            'SELECT usuario_id FROM usuarios WHERE email = ?',
            [email]
         );

         // Logs para depuración
         console.log('\n\n------------------------------------------------');
         console.log(
            'Consulta si existe ese email:',
            'SELECT usuario_id FROM usuarios WHERE email =',
            email
         );

         if (existing.length > 0) {
            // Logs para depuración
            console.log('\n\n------------------------------------------------');
            console.log('El email ya está registrado:');
            return res.status(400).json({ msg: 'El email ya está registrado' });
         }

         // Hashear la contraseña
         const salt = await bcrypt.genSalt(10);
         const password_hash = await bcrypt.hash(password || '123456', salt);

         // Insertar usuario
         const [result] = await pool.query(
            'INSERT INTO usuarios (nombre, email, password_hash, pais_id, rol_id) VALUES (?, ?, ?, ?, ?)',
            [nombre, email, password_hash, pais_id, rol_id]
         );

         // Logs para depuración
         console.log('\n\n------------------------------------------------');
         console.log(
            'INSERT INTO usuarios (nombre, email, password_hash, pais_id, rol_id) VALUES (?, ?, ?, ?, ?)',
            nombre,
            email,
            password_hash,
            pais_id,
            rol_id
         );

         // Obtener el usuario creado con el nombre del rol y país para que el frontend
         // pueda renderizar inmediatamente los campos usados en la lista
         const [rows] = await pool.query(
            'SELECT u.usuario_id, u.nombre, u.email, u.pais_id, u.rol_id, u.estado, r.nombre_rol, p.nombre_pais, u.fecha_registro ' +
               'FROM usuarios u ' +
               'JOIN roles r ON u.rol_id = r.rol_id ' +
               'JOIN paises p ON u.pais_id = p.pais_id ' +
               'WHERE u.usuario_id = ?',
            [result.insertId]
         );

         // Logs para depuración
         console.log('\n\n------------------------------------------------');
         console.log(
            'SELECT u.usuario_id, u.nombre, u.email, u.pais_id, u.rol_id, u.estado, r.nombre_rol, p.nombre_pais, u.fecha_registro ' +
               'FROM usuarios u ' +
               'JOIN roles r ON u.rol_id = r.rol_id ' +
               'JOIN paises p ON u.pais_id = p.pais_id ' +
               'WHERE u.usuario_id =',
            result.insertId
         );

         res.status(201).json({ msg: 'Usuario creado', user: rows[0] });
      } catch (err) {
         console.error('Error createUser:', err.message);
         res.status(500).send('Error del servidor');
      }
   },

   // Eliminar usuario
   deleteUser: async (req, res) => {
      try {
         const [result] = await pool.query(
            'UPDATE usuarios SET estado = "INACTIVO" WHERE usuario_id = ?',
            [req.params.id]
         );

         if (result.affectedRows === 0) {
            return res.status(404).json({ msg: 'Usuario no encontrado' });
         }

         res.json({ msg: 'Usuario desactivado correctamente' });
      } catch (err) {
         console.error(err.message);
         res.status(500).send('Error del servidor');
      }
   },

   // Cambiar estado del usuario (activar/desactivar)
   toggleEstado: async (req, res) => {
      try {
         const { id } = req.params;

         // Primero verificamos si el usuario existe
         const [user] = await pool.query(
            'SELECT usuario_id, estado FROM usuarios WHERE usuario_id = ?',
            [id]
         );

         if (user.length === 0) {
            return res.status(404).json({
               msg: 'Usuario no encontrado',
               success: false,
            });
         }

         // Actualizamos el estado del usuario
         const query = `
            UPDATE usuarios
            SET estado = CASE 
               WHEN estado = 'ACTIVO' THEN 'INACTIVO'
               ELSE 'ACTIVO'
            END
            WHERE usuario_id = ?
         `;

         await pool.query(query, [id]);

         // También actualizamos el estado en la tabla alumnos si es un alumno
         const alumnoQuery = `
            UPDATE alumnos
            SET estado = (
               SELECT estado 
               FROM usuarios 
               WHERE usuario_id = ?
            )
            WHERE usuario_id = ?
         `;

         await pool.query(alumnoQuery, [id, id]);

         res.json({
            msg: 'Estado del usuario actualizado exitosamente',
            success: true,
         });
      } catch (error) {
         console.error('Error al cambiar estado del usuario:', error);
         res.status(500).json({
            msg: 'Error al actualizar estado del usuario',
            error: error.message,
            success: false,
         });
      }
   },
};

module.exports = userController;
