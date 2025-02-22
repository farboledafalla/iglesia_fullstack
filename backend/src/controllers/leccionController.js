const db = require('../database');

const leccionController = {
   // Obtener todas las lecciones
   getLecciones: async (req, res) => {
      try {
         const query = `
            SELECT 
               l.leccion_id,
               l.titulo_leccion,
               l.contenido,
               m.modulo_id,
               m.nombre as nombre_modulo,
               u.nombre as nombre_instructor,
               l.estado
            FROM lecciones l
            INNER JOIN modulos m ON l.modulo_id = m.modulo_id
            INNER JOIN instructores i ON m.instructor_id = i.instructor_id
            INNER JOIN usuarios u ON i.usuario_id = u.usuario_id
            ORDER BY m.nombre
         `;

         const lecciones = await db.query(query);
         res.json(lecciones);
      } catch (error) {
         console.error(error);
         res.status(500).json({ msg: 'Error al obtener lecciones' });
      }
   },

   // Obtener una lección específica
   getLeccion: async (req, res) => {
      try {
         const { id } = req.params;

         const query = `
            SELECT 
               l.leccion_id,
               l.titulo_leccion,
               l.contenido,
               m.modulo_id,
               m.nombre as nombre_modulo,
               u.nombre as nombre_instructor,
               l.estado
            FROM lecciones l
            INNER JOIN modulos m ON l.modulo_id = m.modulo_id
            INNER JOIN instructores i ON m.instructor_id = i.instructor_id
            INNER JOIN usuarios u ON i.usuario_id = u.usuario_id
            WHERE l.leccion_id = ?
         `;

         const [leccion] = await db.query(query, [id]);

         if (!leccion) {
            return res.status(404).json({ msg: 'Lección no encontrada' });
         }

         res.json(leccion);
      } catch (error) {
         console.error(error);
         res.status(500).json({ msg: 'Error al obtener lección' });
      }
   },

   // Crear una nueva lección
   createLeccion: async (req, res) => {
      try {
         const { titulo_leccion, contenido, modulo_id } = req.body;

         // Verificar que el módulo existe
         const checkModulo = `
            SELECT modulo_id FROM modulos WHERE modulo_id = ?
         `;
         const [modulo] = await db.query(checkModulo, [modulo_id]);

         if (!modulo) {
            return res.status(404).json({ msg: 'Módulo no encontrado' });
         }

         const query = `
            INSERT INTO lecciones (
               titulo_leccion,
               contenido,
               modulo_id
            ) VALUES (?, ?, ?)
         `;

         const result = await db.query(query, [
            titulo_leccion,
            contenido,
            modulo_id,
         ]);

         res.json({
            msg: 'Lección creada exitosamente',
            leccion_id: result.insertId,
         });
      } catch (error) {
         console.error(error);
         res.status(500).json({ msg: 'Error al crear lección' });
      }
   },

   // Actualizar una lección
   updateLeccion: async (req, res) => {
      try {
         const { id } = req.params;
         const { titulo_leccion, contenido, modulo_id } = req.body;

         const query = `
            UPDATE lecciones
            SET 
               titulo_leccion = ?,
               contenido = ?,
               modulo_id = ?
            WHERE leccion_id = ?
         `;

         await db.query(query, [titulo_leccion, contenido, modulo_id, id]);

         res.json({ msg: 'Lección actualizada exitosamente' });
      } catch (error) {
         console.error(error);
         res.status(500).json({ msg: 'Error al actualizar lección' });
      }
   },

   // Cambiar estado de la lección
   toggleEstado: async (req, res) => {
      try {
         const { id } = req.params;

         const query = `
            UPDATE lecciones
            SET estado = IF(estado = 'ACTIVO', 'INACTIVO', 'ACTIVO')
            WHERE leccion_id = ?
         `;

         await db.query(query, [id]);

         res.json({ msg: 'Estado de la lección actualizado exitosamente' });
      } catch (error) {
         console.error(error);
         res.status(500).json({
            msg: 'Error al actualizar estado de la lección',
         });
      }
   },

   // Eliminar una lección
   deleteLeccion: async (req, res) => {
      try {
         const { id } = req.params;

         const query = `
            DELETE FROM lecciones 
            WHERE leccion_id = ?
         `;

         await db.query(query, [id]);

         res.json({ msg: 'Lección eliminada exitosamente' });
      } catch (error) {
         console.error(error);
         res.status(500).json({ msg: 'Error al eliminar la lección' });
      }
   },
};

module.exports = leccionController;
