const { validationResult } = require('express-validator');
const pool = require('../config/database');
const bcrypt = require('bcryptjs');
//Importar función obtenerFechaHoraActual
const { obtenerFechaHoraActual } = require('../utils/funciones');

const userController = {
   // Obtener todos los usuarios
   getUsers: async (req, res) => {
      try {
         const [users] = await pool.query(
            'SELECT u.usuario_id, u.nombre, u.email, u.estado, u.rol_id, u.pais_id, r.nombre_rol, p.nombre_pais ' +
               'FROM usuarios u ' +
               'JOIN roles r ON u.rol_id = r.rol_id ' +
               'JOIN paises p ON u.pais_id = p.pais_id'
         );

         // Logs para depuración
         console.log('\n\n------------------------------------------------');
         console.log(obtenerFechaHoraActual());
         console.log('/controllers/userController.js');
         console.log(
            'Consulta usuarios:',
            '\nSELECT u.usuario_id, u.nombre, u.email, u.estado, u.rol_id, u.pais_id, r.nombre_rol, p.nombre_pais ' +
               '\nFROM usuarios u ' +
               '\nJOIN roles r ON u.rol_id = r.rol_id ' +
               '\nJOIN paises p ON u.pais_id = p.pais_id'
         );

         res.json(users);
      } catch (err) {
         console.error(err.message);
         res.status(500).send('Error del servidor');
      }
   },

   // Obtener los datos de las tarjetas de la parte superior (Total Usuarios, Usuarios Activos, Usuarios Inactivos y Total Paises)
   getTotalUsuarios: async (req, res) => {
      try {
         // Obtener total de usuarios (activos/inactivos), esto se almacena en un array
         const [result] = await pool.query(`
            SELECT 
               COUNT(*) as total,
               SUM(CASE WHEN estado = 'ACTIVO' THEN 1 ELSE 0 END) as activos,
               SUM(CASE WHEN estado = 'INACTIVO' THEN 1 ELSE 0 END) as inactivos
            FROM usuarios
         `);

         console.log('\n\n------------------------------------------------');
         console.log(obtenerFechaHoraActual());
         console.log('/controllers/alumnoController.js');
         console.log(
            "Consulta total de usuarios: \nSELECT COUNT(*) as total,\n SUM(CASE WHEN estado = 'ACTIVO' THEN 1 ELSE 0 END) as activos,\n SUM(CASE WHEN estado = 'INACTIVO' THEN 1 ELSE 0 END) as inactivos\n FROM usuarios",
            result
         );

         // Obtener total de países con usuarios desde donde estudian los usuarios
         const [paises] = await pool.query(`
            SELECT COUNT(DISTINCT pais_id) as total_paises
            FROM usuarios
            WHERE pais_id IS NOT NULL
         `);

         //Logs para depuración
         console.log('\n\n------------------------------------------------');
         console.log(obtenerFechaHoraActual());
         console.log('/controllers/userController.js');
         console.log(
            'Consulta total de países con usuarios: \nSELECT COUNT(DISTINCT pais_id) as total_paises\n FROM usuarios \n WHERE pais_id IS NOT NULL',
            paises
         );

         // Enviar un objeto en la respuesta con la información obtenida
         res.json({
            total: result[0].total || 0,
            activos: result[0].activos || 0,
            inactivos: result[0].inactivos || 0,
            total_paises: paises[0].total_paises || 0,
         });
      } catch (error) {
         console.error('Error al obtener total de usuarios:', error);
         res.status(500).json({
            msg: 'Error al obtener total de usuarios y países',
            error: error.message,
         });
      }
   },

   // Obtener distribución de usuarios por país, esta ruta es para pintar el grafico de barras de usuarios por país
   getUsuariosPorPais: async (req, res) => {
      try {
         const [result] = await pool.query(`
            SELECT 
               p.nombre_pais as pais,
               COUNT(u.usuario_id) as cantidad
            FROM usuarios u
            INNER JOIN paises p ON u.pais_id = p.pais_id
            GROUP BY p.pais_id, p.nombre_pais
            ORDER BY cantidad DESC
         `);

         // Asegurarnos de que la respuesta sea un array, si no es un array, lo convertimos a un array vacío porque si no es un array, el front no lo puede leer
         if (!Array.isArray(result)) {
            console.log('Resultado no es un array:', result);
            res.json([]);
            return;
         }

         // Enviar la respuesta
         res.json(result);
      } catch (error) {
         console.error('Error al obtener distribución por país:', error);
         res.status(500).json({
            msg: 'Error al obtener distribución por país',
            error: error.message,
         });
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
      const { nombre, email, rol_id, pais_id } = req.body;

      try {
         const [result] = await pool.query(
            'UPDATE usuarios SET nombre = ?, email = ?, rol_id = ?, pais_id = ? WHERE usuario_id = ?',
            [nombre, email, rol_id, pais_id, req.params.id]
         );

         // Logs para depuración
         console.log('\n\n------------------------------------------------');
         console.log(obtenerFechaHoraActual());
         console.log('/controllers/userController.js');
         console.log(
            'Actualizar usuario:',
            '\nUPDATE usuarios SET nombre = ?, email = ?, rol_id = ?, pais_id = ? WHERE usuario_id = ?\n',
            nombre,
            email,
            rol_id,
            pais_id,
            req.params.id
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
      // Logs para depuración
      console.log('\n\n------------------------------------------------');
      console.log(obtenerFechaHoraActual());
      console.log('/controllers/userController.js');
      console.log('Ingresando a createUser con datos:', req.body);

      const { nombre, email, password, pais_id, rol_id } = req.body;

      try {
         // Validar email único
         const [existing] = await pool.query(
            'SELECT usuario_id FROM usuarios WHERE email = ?',
            [email]
         );

         // Logs para depuración
         console.log('\n\n------------------------------------------------');
         console.log(obtenerFechaHoraActual());
         console.log('/controllers/userController.js');
         console.log(
            'Consulta si existe ese email:',
            'SELECT usuario_id FROM usuarios WHERE email =',
            email
         );

         if (existing.length > 0) {
            // Logs para depuración
            console.log('\n\n------------------------------------------------');
            console.log(obtenerFechaHoraActual());
            console.log('/controllers/userController.js');
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
         console.log(obtenerFechaHoraActual());
         console.log('/controllers/userController.js');
         console.log('INSERT a la tabla usuarios...');
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
         console.log(obtenerFechaHoraActual());
         console.log('/controllers/userController.js');
         console.log(
            'SELECT para enviar al FrontEnd y refrescar listado de usuarios...'
         );
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

         // Logs para depuración
         console.log('\n\n------------------------------------------------');
         console.log(obtenerFechaHoraActual());
         console.log('/controllers/userController.js');
         console.log(
            'Consulta si existe ese usuario:',
            'SELECT usuario_id, estado FROM usuarios WHERE usuario_id =',
            id
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

         // Logs para depuración
         console.log('\n\n------------------------------------------------');
         console.log(obtenerFechaHoraActual());
         console.log('/controllers/userController.js');
         console.log(
            'Cambio de estado del usuario:',
            `\nUPDATE usuarios
               SET estado = CASE 
               WHEN estado = 'ACTIVO' THEN 'INACTIVO'
               ELSE 'ACTIVO'
               END
               WHERE usuario_id = ${id}`
         );

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
