// alumnoController.js: es un script que contiene los métodos para manejar las peticiones HTTP relacionadas con los alumnos.

const pool = require('../config/database');
// Importar la función obtenerFechaHoraActual
const { obtenerFechaHoraActual } = require('../utils/funciones');

const alumnoController = {
   // Obtener todos los alumnos
   getAlumnos: async (req, res) => {
      try {
         const query = `
            SELECT 
               a.alumno_id,
               a.identificacion,
               a.nombre,
               a.email,
               a.telefono,
               a.pais_id,
               p.nombre_pais,
               a.fecha_registro,
               a.estado,
               a.usuario_id
            FROM alumnos a
            LEFT JOIN paises p ON a.pais_id = p.pais_id
            ORDER BY a.nombre
         `;

         console.log('\n\n------------------------------------------------');
         console.log(obtenerFechaHoraActual());
         console.log('/controllers/alumnoController.js');
         // Mostrar en consola la consulta que se va a ejecutar
         console.log('Consulta alumnos:', query);

         const alumnos = await pool.query(query);
         res.json(alumnos);
      } catch (error) {
         console.error(error);
         res.status(500).json({ msg: 'Error al obtener alumnos' });
      }
   },

   // Crear un nuevo alumno
   createAlumno: async (req, res) => {
      //Logs para depuración
      console.log('\n\n------------------------------------------------');
      console.log(obtenerFechaHoraActual());
      console.log('/controllers/alumnoController.js');
      console.log('Datos recibidos para crear alumno:', req.body);

      try {
         const { nombre, email, telefono, pais_id, usuario_id, identificacion } = req.body;

         //Validar la existencia del usuario_id en la tabla usuarios
         const [usuarios] = await pool.query(
            'SELECT usuario_id FROM usuarios WHERE usuario_id = ?',
            [usuario_id]
         );

         // Verificar si ese usuario ya tiene un alumno asociado
         const [existingAlumno] = await pool.query('SELECT alumno_id FROM alumnos WHERE usuario_id = ?', [usuario_id]);
         if (existingAlumno.length > 0) {
            return res.status(400).json({ msg: 'El usuario ya tiene un alumno asociado' });
         }

         //Logs para depuración
         console.log('\n\n------------------------------------------------');
         console.log(obtenerFechaHoraActual());
         console.log('/controllers/alumnoController.js');
         console.log(
            'Verificación de usuario_id:',
            'SELECT usuario_id FROM usuarios WHERE usuario_id = ?',
            [usuario_id]
         );
         console.log('Resultado de la verificación:', usuarios);

         const query = `
            INSERT INTO alumnos (identificacion, nombre, email, telefono, pais_id, usuario_id)
            VALUES (?, ?, ?, ?, ?, ?)
         `;

         // Si no se envía identificacion, usar cadena vacía para evitar error de campo sin default
         const ident = identificacion ?? '';

         const result = await pool.query(query, [
            ident,
            nombre,
            email,
            telefono,
            pais_id,
            usuario_id,
         ]);

         //Logs para depuración
         console.log('\n\n------------------------------------------------');
         console.log(obtenerFechaHoraActual());
         console.log('/controllers/alumnoController.js');
         console.log('Consulta para crear alumno:', query, [
            nombre,
            email,
            telefono,
            pais_id,
            usuario_id,
         ]);
         console.log('Alumno creado con ID:', result.insertId);

         res.json({
            msg: 'Alumno creado exitosamente',
            alumno_id: result.insertId,
         });
      } catch (error) {
         console.error(error);
         res.status(500).json({ msg: 'Error al crear alumno' });
      }
   },

   // Actualizar un alumno
   updateAlumno: async (req, res) => {
      try {
         const { id } = req.params;
         const { nombre, email, telefono, pais_id } = req.body;

         // Primero verificamos si el alumno existe
         const [alumno] = await pool.query(
            'SELECT alumno_id FROM alumnos WHERE alumno_id = ?',
            [id]
         );

         //Logs para depuración
         console.log('\n\n------------------------------------------------');
         console.log(obtenerFechaHoraActual());
         console.log('/controllers/alumnoController.js');
         console.log(
            'Verificar existencia del alumno:',
            'SELECT alumno_id FROM alumnos WHERE alumno_id = ?',
            [id]
         );

         if (alumno.length === 0) {
            return res.status(404).json({
               msg: 'Alumno no encontrado',
               success: false,
            });
         }

         const query = `
            UPDATE alumnos
            SET nombre = ?, 
                email = ?, 
                telefono = ?, 
                pais_id = ?
            WHERE alumno_id = ?
         `;

         await pool.query(query, [nombre, email, telefono, pais_id, id]);

         //Logs para depuración
         console.log('\n\n------------------------------------------------');
         console.log(obtenerFechaHoraActual());
         console.log('/controllers/alumnoController.js');
         console.log('Consulta para actualizar alumno:', query);
         console.log('Valores: ', [nombre, email, telefono, pais_id, id]);

         // También actualizamos la tabla usuarios si existe el registro
         const userQuery = `
            UPDATE usuarios
            SET nombre = ?,
                email = ?,
                pais_id = ?
            WHERE usuario_id = (
               SELECT usuario_id 
               FROM alumnos 
               WHERE alumno_id = ?
            )
         `;

         await pool.query(userQuery, [nombre, email, pais_id, id]);

         //Logs para depuración
         console.log('\n\n------------------------------------------------');
         console.log(obtenerFechaHoraActual());
         console.log('/controllers/alumnoController.js');
         console.log('Consulta para actualizar usuario:', userQuery);
         console.log('Valores: ', [nombre, email, pais_id, id]);

         res.json({
            msg: 'Alumno actualizado exitosamente',
            success: true,
         });
      } catch (error) {
         console.error('Error al actualizar alumno:', error);
         res.status(500).json({
            msg: 'Error al actualizar alumno',
            error: error.message,
            success: false,
         });
      }
   },

   // Cambiar estado del alumno (activar/desactivar)
   toggleEstado: async (req, res) => {
      try {
         const { id } = req.params;

         const query = `
            UPDATE alumnos
            SET estado = IF(estado = 'ACTIVO', 'INACTIVO', 'ACTIVO')
            WHERE alumno_id = ?
         `;

         // Mostrar en consola la consulta y los valores
         console.log('\n\n------------------------------------------------');
         console.log(obtenerFechaHoraActual());
         console.log('/controllers/alumnoController.js');
         console.log('Cambiar estado:\n', query);
         console.log('Valores: ', [id]);

         await pool.query(query, [id]);

         res.json({ msg: 'Estado del alumno actualizado exitosamente' });
      } catch (error) {
         console.error(error);
         res.status(500).json({ msg: 'Error al actualizar estado del alumno' });
      }
   },

   // Obtener los datos de las tarjetas de la parte superior (Total Alumnos, Alumnos Activos, Alumnos Inactivos y Total Paises)
   getTotalAlumnos: async (req, res) => {
      try {
         // Obtener total de alumnos (activos/inactivos), esto se almacena en un array
         const [result] = await pool.query(`
            SELECT 
               COUNT(*) as total,
               SUM(CASE WHEN estado = 'ACTIVO' THEN 1 ELSE 0 END) as activos,
               SUM(CASE WHEN estado = 'INACTIVO' THEN 1 ELSE 0 END) as inactivos
            FROM alumnos
         `);

         console.log('\n\n------------------------------------------------');
         console.log(obtenerFechaHoraActual());
         console.log('/controllers/alumnoController.js');
         console.log(
            "Consulta total de alumnos: \nSELECT COUNT(*) as total,\n SUM(CASE WHEN estado = 'ACTIVO' THEN 1 ELSE 0 END) as activos,\n SUM(CASE WHEN estado = 'INACTIVO' THEN 1 ELSE 0 END) as inactivos\n FROM alumnos"
         );

         // Obtener total de países con alumnos desde donde estudian los alumnos
         const [paises] = await pool.query(`
            SELECT COUNT(DISTINCT pais_id) as total_paises
            FROM alumnos
            WHERE pais_id IS NOT NULL
         `);

         // Enviar un objeto en la respuesta con la información obtenida
         res.json({
            total: result[0].total || 0,
            activos: result[0].activos || 0,
            inactivos: result[0].inactivos || 0,
            total_paises: paises[0].total_paises || 0,
         });
      } catch (error) {
         console.error('Error al obtener total de alumnos:', error);
         res.status(500).json({
            msg: 'Error al obtener total de alumnos y países',
            error: error.message,
         });
      }
   },

   // Agregar este nuevo método
   deleteAlumno: async (req, res) => {
      try {
         const { id } = req.params;

         // Primero verificar si el alumno tiene registros relacionados
         const checkRegistros = `
            SELECT COUNT(*) as count 
            FROM progreso_alumnos 
            WHERE alumno_id = ?
         `;

         const [result] = await pool.query(checkRegistros, [id]);

         if (result.count > 0) {
            return res.status(400).json({
               msg: 'No se puede eliminar el alumno porque tiene registros de progreso asociados',
            });
         }

         const query = `
            DELETE FROM alumnos 
            WHERE alumno_id = ?
         `;

         await pool.query(query, [id]);

         res.json({ msg: 'Alumno eliminado exitosamente' });
      } catch (error) {
         console.error(error);
         res.status(500).json({ msg: 'Error al eliminar el alumno' });
      }
   },

   // Obtener distribución de alumnos por país, esta ruta es para pintar el grafico de barras de Alumnos por país
   getAlumnosPorPais: async (req, res) => {
      try {
         const [result] = await pool.query(`
            SELECT 
               p.nombre_pais as pais,
               COUNT(a.alumno_id) as cantidad
            FROM alumnos a
            INNER JOIN paises p ON a.pais_id = p.pais_id
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

   // Obtener perfil del alumno
   getPerfil: async (req, res) => {
      try {
         const usuarioId = req.params.id;

         // Primero verificamos si el usuario existe
         const [usuarios] = await pool.query(
            'SELECT usuario_id FROM usuarios WHERE usuario_id = ?',
            [usuarioId]
         );

         if (usuarios.length === 0) {
            return res.status(404).json({
               msg: 'Usuario no encontrado',
               success: false,
            });
         }

         // Luego obtenemos los datos del alumno
         const [alumnos] = await pool.query(
            `SELECT 
               a.alumno_id,
               a.nombre,
               a.telefono,
               a.estado,
               a.fecha_registro,
               u.email,
               p.pais_id,
               p.nombre_pais
            FROM alumnos a
            INNER JOIN usuarios u ON a.usuario_id = u.usuario_id
            LEFT JOIN paises p ON a.pais_id = p.pais_id
            WHERE a.usuario_id = ?`,
            [usuarioId]
         );

         if (alumnos.length === 0) {
            return res.status(404).json({
               msg: 'Perfil de alumno no encontrado',
               success: false,
            });
         }

         // Construimos el objeto de respuesta
         const perfilData = {
            alumno_id: alumnos[0].alumno_id,
            nombre: alumnos[0].nombre,
            email: alumnos[0].email,
            telefono: alumnos[0].telefono || '',
            pais_id: alumnos[0].pais_id,
            nombre_pais: alumnos[0].nombre_pais || 'No especificado',
            fecha_registro: alumnos[0].fecha_registro,
            estado: alumnos[0].estado,
         };

         res.json(perfilData);
      } catch (error) {
         console.error('Error al obtener perfil del alumno:', error);
         res.status(500).json({
            msg: 'Error del servidor',
            error: error.message,
            success: false,
         });
      }
   },

      // Obtener alumno por usuario_id (para verificar si un usuario ya tiene alumno)
      getByUsuarioId: async (req, res) => {
         try {
            const { usuario_id } = req.params;
            const [rows] = await pool.query('SELECT * FROM alumnos WHERE usuario_id = ?', [usuario_id]);
            if (rows.length === 0) {
               return res.json({ exists: false });
            }
            res.json({ exists: true, alumno: rows[0] });
         } catch (error) {
            console.error('Error getByUsuarioId:', error);
            res.status(500).json({ msg: 'Error del servidor' });
         }
      },

   // Comentar o eliminar este método si no se usará por ahora
   /*
   actualizarFoto: async (req, res) => {
      try {
         // Aquí iría la lógica para subir la foto a un servicio como Cloudinary
         // y guardar la URL en la base de datos

         res.json({ msg: 'Foto actualizada exitosamente' });
      } catch (error) {
         console.error(error);
         res.status(500).json({ msg: 'Error al actualizar foto' });
      }
   },
   */
};

module.exports = alumnoController;
