const db = require('../database');

const moduloController = {
   // Obtener todos los módulos
   getModulos: async (req, res) => {
      try {
         const query = `
            SELECT 
               modulo_id,
               nombre,
               descripcion,
               duracion,
               fecha_inicio,
               fecha_fin,
               estado
            FROM modulos
            ORDER BY fecha_inicio DESC
         `;

         const modulos = await db.query(query);
         res.json(modulos);
      } catch (error) {
         console.error(error);
         res.status(500).json({ msg: 'Error al obtener módulos' });
      }
   },

   // Crear un nuevo módulo
   createModulo: async (req, res) => {
      try {
         const {
            nombre,
            descripcion,
            instructor_id,
            duracion,
            fecha_inicio,
            fecha_fin,
         } = req.body;

         const query = `
            INSERT INTO modulos (
               nombre, 
               descripcion, 
               instructor_id,
               duracion, 
               fecha_inicio, 
               fecha_fin
            ) VALUES (?, ?, ?, ?, ?, ?)
         `;

         const result = await db.query(query, [
            nombre,
            descripcion,
            instructor_id,
            duracion,
            fecha_inicio,
            fecha_fin,
         ]);

         res.json({
            msg: 'Módulo creado exitosamente',
            modulo_id: result.insertId,
         });
      } catch (error) {
         console.error(error);
         res.status(500).json({ msg: 'Error al crear módulo' });
      }
   },

   // Actualizar un módulo
   updateModulo: async (req, res) => {
      try {
         const { id } = req.params;
         const { nombre, descripcion, duracion, fecha_inicio, fecha_fin } =
            req.body;

         const query = `
            UPDATE modulos
            SET 
               nombre = ?,
               descripcion = ?,
               duracion = ?,
               fecha_inicio = ?,
               fecha_fin = ?
            WHERE modulo_id = ?
         `;

         await db.query(query, [
            nombre,
            descripcion,
            duracion,
            fecha_inicio,
            fecha_fin,
            id,
         ]);

         res.json({ msg: 'Módulo actualizado exitosamente' });
      } catch (error) {
         console.error(error);
         res.status(500).json({ msg: 'Error al actualizar módulo' });
      }
   },

   // Cambiar estado del módulo
   toggleEstado: async (req, res) => {
      try {
         const { id } = req.params;

         const query = `
            UPDATE modulos
            SET estado = IF(estado = 'ACTIVO', 'INACTIVO', 'ACTIVO')
            WHERE modulo_id = ?
         `;

         await db.query(query, [id]);

         res.json({ msg: 'Estado del módulo actualizado exitosamente' });
      } catch (error) {
         console.error(error);
         res.status(500).json({ msg: 'Error al actualizar estado del módulo' });
      }
   },

   // Agregar este nuevo método
   deleteModulo: async (req, res) => {
      try {
         const { id } = req.params;

         // Primero verificar si hay lecciones asociadas
         const checkLecciones = `
            SELECT COUNT(*) as count 
            FROM lecciones 
            WHERE modulo_id = ?
         `;

         const [result] = await db.query(checkLecciones, [id]);

         if (result.count > 0) {
            return res.status(400).json({
               msg: 'No se puede eliminar el módulo porque tiene lecciones asociadas',
            });
         }

         const query = `
            DELETE FROM modulos 
            WHERE modulo_id = ?
         `;

         await db.query(query, [id]);

         res.json({ msg: 'Módulo eliminado exitosamente' });
      } catch (error) {
         console.error(error);
         res.status(500).json({ msg: 'Error al eliminar el módulo' });
      }
   },
};

module.exports = moduloController;
