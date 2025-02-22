const db = require('../database');

const instructorController = {
   // Obtener todos los instructores con sus datos de usuario
   getInstructores: async (req, res) => {
      try {
         const query = `
            SELECT 
               i.instructor_id,
               i.biografia,
               u.usuario_id,
               u.nombre,
               u.email,
               u.estado
            FROM instructores i
            INNER JOIN usuarios u ON i.usuario_id = u.usuario_id
            WHERE u.estado = 'ACTIVO'
            ORDER BY u.nombre
         `;

         const instructores = await db.query(query);
         res.json(instructores);
      } catch (error) {
         console.error(error);
         res.status(500).json({ msg: 'Error al obtener instructores' });
      }
   },

   // Obtener un instructor específico
   getInstructor: async (req, res) => {
      try {
         const { id } = req.params;

         const query = `
            SELECT 
               i.instructor_id,
               i.biografia,
               u.usuario_id,
               u.nombre,
               u.email,
               u.estado
            FROM instructores i
            INNER JOIN usuarios u ON i.usuario_id = u.usuario_id
            WHERE i.instructor_id = ?
         `;

         const [instructor] = await db.query(query, [id]);

         if (!instructor) {
            return res.status(404).json({ msg: 'Instructor no encontrado' });
         }

         res.json(instructor);
      } catch (error) {
         console.error(error);
         res.status(500).json({ msg: 'Error al obtener instructor' });
      }
   },

   // Crear un nuevo instructor
   createInstructor: async (req, res) => {
      try {
         const { usuario_id, biografia } = req.body;

         // Verificar que el usuario existe y no es ya un instructor
         const checkQuery = `
            SELECT rol_id FROM usuarios WHERE usuario_id = ?
         `;
         const [usuario] = await db.query(checkQuery, [usuario_id]);

         if (!usuario) {
            return res.status(404).json({ msg: 'Usuario no encontrado' });
         }

         const insertQuery = `
            INSERT INTO instructores (usuario_id, biografia)
            VALUES (?, ?)
         `;

         const result = await db.query(insertQuery, [usuario_id, biografia]);

         // Actualizar el rol del usuario a instructor
         const updateRolQuery = `
            UPDATE usuarios 
            SET rol_id = (SELECT rol_id FROM roles WHERE nombre_rol = 'instructor')
            WHERE usuario_id = ?
         `;

         await db.query(updateRolQuery, [usuario_id]);

         res.json({
            msg: 'Instructor creado exitosamente',
            instructor_id: result.insertId,
         });
      } catch (error) {
         console.error(error);
         res.status(500).json({ msg: 'Error al crear instructor' });
      }
   },

   // Actualizar un instructor
   updateInstructor: async (req, res) => {
      try {
         const { id } = req.params;
         const { biografia } = req.body;

         const query = `
            UPDATE instructores
            SET biografia = ?
            WHERE instructor_id = ?
         `;

         await db.query(query, [biografia, id]);

         res.json({ msg: 'Instructor actualizado exitosamente' });
      } catch (error) {
         console.error(error);
         res.status(500).json({ msg: 'Error al actualizar instructor' });
      }
   },
};

module.exports = instructorController;
