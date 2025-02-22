const db = require('../database');

const progresoAlumnosController = {
   // Obtener progreso de todos los alumnos
   getProgresoAlumnos: async (req, res) => {
      try {
         const query = `
            SELECT 
               pa.progreso_leccion_id,
               a.alumno_id,
               a.nombre as nombre_alumno,
               m.modulo_id,
               m.nombre as nombre_modulo,
               l.leccion_id,
               l.titulo_leccion,
               pa.total_preguntas_respondidas,
               pa.total_preguntas,
               pa.estado,
               pa.fecha_inicio,
               pa.fecha_completado
            FROM progreso_lecciones pa
            INNER JOIN alumnos a ON pa.alumno_id = a.alumno_id
            INNER JOIN lecciones l ON pa.leccion_id = l.leccion_id
            INNER JOIN modulos m ON l.modulo_id = m.modulo_id
            ORDER BY a.nombre, m.nombre, l.orden
         `;

         const progreso = await db.query(query);
         res.json(progreso);
      } catch (error) {
         console.error(error);
         res.status(500).json({ msg: 'Error al obtener progreso de alumnos' });
      }
   },

   // Obtener progreso de un alumno específico
   getProgresoAlumno: async (req, res) => {
      try {
         const { alumno_id } = req.params;

         const query = `
            SELECT 
               pa.progreso_leccion_id,
               m.modulo_id,
               m.nombre as nombre_modulo,
               l.leccion_id,
               l.titulo_leccion,
               pa.total_preguntas_respondidas,
               pa.total_preguntas,
               pa.estado,
               pa.fecha_inicio,
               pa.fecha_completado,
               pm.lecciones_completadas as lecciones_completadas_modulo,
               pm.total_lecciones as total_lecciones_modulo,
               pm.estado as estado_modulo
            FROM progreso_lecciones pa
            INNER JOIN lecciones l ON pa.leccion_id = l.leccion_id
            INNER JOIN modulos m ON l.modulo_id = m.modulo_id
            LEFT JOIN progreso_modulos pm ON (pm.alumno_id = pa.alumno_id AND pm.modulo_id = m.modulo_id)
            WHERE pa.alumno_id = ?
            ORDER BY m.nombre, l.orden
         `;

         const progreso = await db.query(query, [alumno_id]);
         res.json(progreso);
      } catch (error) {
         console.error(error);
         res.status(500).json({ msg: 'Error al obtener progreso del alumno' });
      }
   },

   // Crear registro de progreso
   createProgresoAlumno: async (req, res) => {
      try {
         const { alumno_id, leccion_id, total_preguntas } = req.body;

         // Primero verificar si ya existe un registro
         const checkQuery = `
            SELECT progreso_leccion_id 
            FROM progreso_lecciones 
            WHERE alumno_id = ? AND leccion_id = ?
         `;

         const existingProgress = await db.query(checkQuery, [
            alumno_id,
            leccion_id,
         ]);

         if (existingProgress.length > 0) {
            return res.status(400).json({
               msg: 'Ya existe un registro de progreso para esta lección',
            });
         }

         const query = `
            INSERT INTO progreso_lecciones (
               alumno_id,
               leccion_id,
               total_preguntas
            ) VALUES (?, ?, ?)
         `;

         const result = await db.query(query, [
            alumno_id,
            leccion_id,
            total_preguntas,
         ]);

         res.json({
            msg: 'Progreso registrado exitosamente',
            progreso_id: result.insertId,
         });
      } catch (error) {
         console.error(error);
         res.status(500).json({ msg: 'Error al crear registro de progreso' });
      }
   },

   // Actualizar progreso
   updateProgresoAlumno: async (req, res) => {
      try {
         const { id } = req.params;
         const {
            total_preguntas_respondidas,
            ultima_pregunta_respondida,
            estado,
         } = req.body;

         let query = `
            UPDATE progreso_lecciones
            SET 
               total_preguntas_respondidas = ?,
               ultima_pregunta_respondida = ?,
               estado = ?,
               fecha_completado = ?
            WHERE progreso_leccion_id = ?
         `;

         const fecha_completado = estado === 'COMPLETADA' ? new Date() : null;

         await db.query(query, [
            total_preguntas_respondidas,
            ultima_pregunta_respondida,
            estado,
            fecha_completado,
            id,
         ]);

         // Si la lección se completó, actualizar el progreso del módulo
         if (estado === 'COMPLETADA') {
            const updateModuloQuery = `
               UPDATE progreso_modulos pm
               INNER JOIN lecciones l ON l.modulo_id = pm.modulo_id
               INNER JOIN progreso_lecciones pl ON pl.leccion_id = l.leccion_id
               SET 
                  pm.lecciones_completadas = (
                     SELECT COUNT(*)
                     FROM progreso_lecciones pl2
                     INNER JOIN lecciones l2 ON pl2.leccion_id = l2.leccion_id
                     WHERE l2.modulo_id = l.modulo_id
                     AND pl2.alumno_id = pl.alumno_id
                     AND pl2.estado = 'COMPLETADA'
                  ),
                  pm.estado = CASE
                     WHEN pm.lecciones_completadas = pm.total_lecciones THEN 'COMPLETADO'
                     ELSE 'EN_PROGRESO'
                  END,
                  pm.fecha_completado = CASE
                     WHEN pm.lecciones_completadas = pm.total_lecciones THEN CURRENT_TIMESTAMP
                     ELSE NULL
                  END
               WHERE pl.progreso_leccion_id = ?
            `;

            await db.query(updateModuloQuery, [id]);
         }

         res.json({ msg: 'Progreso actualizado exitosamente' });
      } catch (error) {
         console.error(error);
         res.status(500).json({ msg: 'Error al actualizar progreso' });
      }
   },
};

module.exports = progresoAlumnosController;
