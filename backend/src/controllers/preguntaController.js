const db = require('../database');

const preguntaController = {
   // Obtener preguntas agrupadas por lección
   getPreguntasPorLeccion: async (req, res) => {
      try {
         const query = `
            SELECT 
               p.pregunta_id,
               p.contenido_previo,
               p.pregunta,
               p.orden,
               p.estado,
               l.leccion_id,
               l.titulo_leccion,
               m.modulo_id,
               m.nombre as nombre_modulo
            FROM preguntas p
            INNER JOIN lecciones l ON p.leccion_id = l.leccion_id
            INNER JOIN modulos m ON l.modulo_id = m.modulo_id
            ORDER BY m.nombre, l.orden, p.orden
         `;

         const preguntas = await db.query(query);
         res.json(preguntas);
      } catch (error) {
         console.error(error);
         res.status(500).json({ msg: 'Error al obtener preguntas' });
      }
   },

   // Crear nueva pregunta
   createPregunta: async (req, res) => {
      try {
         const { leccion_id, contenido_previo, pregunta, orden } = req.body;

         const query = `
            INSERT INTO preguntas (
               leccion_id,
               contenido_previo,
               pregunta,
               orden
            ) VALUES (?, ?, ?, ?)
         `;

         const result = await db.query(query, [
            leccion_id,
            contenido_previo,
            pregunta,
            orden,
         ]);

         res.json({
            msg: 'Pregunta creada exitosamente',
            pregunta_id: result.insertId,
         });
      } catch (error) {
         console.error(error);
         res.status(500).json({ msg: 'Error al crear pregunta' });
      }
   },

   // Actualizar pregunta
   updatePregunta: async (req, res) => {
      try {
         const { id } = req.params;
         const { contenido_previo, pregunta, orden } = req.body;

         const query = `
            UPDATE preguntas
            SET 
               contenido_previo = ?,
               pregunta = ?,
               orden = ?
            WHERE pregunta_id = ?
         `;

         await db.query(query, [contenido_previo, pregunta, orden, id]);

         res.json({ msg: 'Pregunta actualizada exitosamente' });
      } catch (error) {
         console.error(error);
         res.status(500).json({ msg: 'Error al actualizar pregunta' });
      }
   },

   // Cambiar estado de la pregunta
   toggleEstado: async (req, res) => {
      try {
         const { id } = req.params;

         const query = `
            UPDATE preguntas
            SET estado = IF(estado = 'ACTIVO', 'INACTIVO', 'ACTIVO')
            WHERE pregunta_id = ?
         `;

         await db.query(query, [id]);

         res.json({ msg: 'Estado de la pregunta actualizado exitosamente' });
      } catch (error) {
         console.error(error);
         res.status(500).json({ msg: 'Error al actualizar estado' });
      }
   },
};

module.exports = preguntaController;
