const { validationResult } = require('express-validator');
const pool = require('../config/database');

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
            [nombre, email, pais_id, req.params.usuario_id]
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
