// courseControllerRBAC.js: Controlador de cursos con sistema RBAC
// Ejemplo de implementación de control de acceso basado en roles y permisos

const pool = require('../config/database');
const { getConnection } = require('../config/database');

const courseControllerRBAC = {
   /**
    * Obtener todos los cursos
    * Acceso: cualquier usuario autenticado
    */
   getAllCourses: async (req, res) => {
      try {
         const [courses] = await pool.query(`
            SELECT 
               c.*,
               GROUP_CONCAT(DISTINCT u.nombre SEPARATOR ', ') as instructores
            FROM cursos c
            LEFT JOIN cursos_instructores ci ON c.curso_id = ci.curso_id
            LEFT JOIN usuarios u ON ci.usuario_id = u.usuario_id
            GROUP BY c.curso_id
            ORDER BY c.created_at DESC
         `);

         res.json(courses);
      } catch (error) {
         console.error('Error al obtener cursos:', error);
         res.status(500).json({ 
            msg: 'Error del servidor al obtener cursos',
            error: error.message 
         });
      }
   },

   /**
    * Obtener un curso por ID
    * Acceso: cualquier usuario autenticado
    */
   getCourseById: async (req, res) => {
      try {
         const { id } = req.params;

         const [courses] = await pool.query(`
            SELECT 
               c.*,
               u_created.nombre as creador,
               u_updated.nombre as ultimo_editor
            FROM cursos c
            LEFT JOIN usuarios u_created ON c.created_by = u_created.usuario_id
            LEFT JOIN usuarios u_updated ON c.updated_by = u_updated.usuario_id
            WHERE c.curso_id = ?
         `, [id]);

         if (courses.length === 0) {
            return res.status(404).json({ msg: 'Curso no encontrado' });
         }

         // Obtener instructores del curso
         const [instructores] = await pool.query(`
            SELECT 
               u.usuario_id,
               u.nombre,
               u.email,
               ci.rol_en_curso
            FROM cursos_instructores ci
            JOIN usuarios u ON ci.usuario_id = u.usuario_id
            WHERE ci.curso_id = ?
         `, [id]);

         const course = courses[0];
         course.instructores = instructores;

         res.json(course);
      } catch (error) {
         console.error('Error al obtener curso:', error);
         res.status(500).json({ 
            msg: 'Error del servidor',
            error: error.message 
         });
      }
   },

   /**
    * Crear un nuevo curso
    * Acceso: requiere permiso 'crear_curso' (instructores y administradores)
    * El usuario que crea se asigna automáticamente como instructor del curso
    */
   createCourse: async (req, res) => {
      const connection = await getConnection();
      
      try {
         const { titulo, descripcion, estado } = req.body;
         const userId = req.user.id;

         // Validación básica
         if (!titulo || !descripcion) {
            return res.status(400).json({ 
               msg: 'El título y descripción son requeridos' 
            });
         }

         await connection.beginTransaction();

         // Crear el curso con auditoría
         const [result] = await connection.query(
            `INSERT INTO cursos (titulo, descripcion, estado, created_by, updated_by)
             VALUES (?, ?, ?, ?, ?)`,
            [titulo, descripcion || 'ENPROGRESO', userId, userId]
         );

         const cursoId = result.insertId;

         // Asignar el creador como instructor principal del curso
         await connection.query(
            `INSERT INTO cursos_instructores (curso_id, usuario_id, rol_en_curso)
             VALUES (?, ?, 'instructor')`,
            [cursoId, userId]
         );

         await connection.commit();

         // Obtener el curso creado con toda la información
         const [courses] = await pool.query(`
            SELECT 
               c.*,
               u.nombre as creador
            FROM cursos c
            LEFT JOIN usuarios u ON c.created_by = u.usuario_id
            WHERE c.curso_id = ?
         `, [cursoId]);

         res.status(201).json({
            msg: 'Curso creado exitosamente',
            curso: courses[0]
         });

      } catch (error) {
         await connection.rollback();
         console.error('Error al crear curso:', error);
         res.status(500).json({ 
            msg: 'Error al crear el curso',
            error: error.message 
         });
      } finally {
         connection.release();
      }
   },

   /**
    * Actualizar un curso
    * Acceso: requiere permiso 'editar_curso' Y ser instructor del curso
    * O ser administrador (puede editar cualquier curso)
    */
   updateCourse: async (req, res) => {
      try {
         const { id } = req.params;
         const { titulo, descripcion, estado } = req.body;
         const userId = req.user.id;

         // Validación básica
         if (!titulo && !descripcion && !estado) {
            return res.status(400).json({ 
               msg: 'Debe proporcionar al menos un campo para actualizar' 
            });
         }

         // Construir query dinámicamente solo con campos proporcionados
         const updates = [];
         const values = [];

         if (titulo) {
            updates.push('titulo = ?');
            values.push(titulo);
         }
         if (descripcion) {
            updates.push('descripcion = ?');
            values.push(descripcion);
         }
         if (estado) {
            updates.push('estado = ?');
            values.push(estado);
         }

         // Siempre actualizar updated_by
         updates.push('updated_by = ?');
         values.push(userId);

         values.push(id);

         const [result] = await pool.query(
            `UPDATE cursos 
             SET ${updates.join(', ')}
             WHERE curso_id = ?`,
            values
         );

         if (result.affectedRows === 0) {
            return res.status(404).json({ msg: 'Curso no encontrado' });
         }

         // Obtener curso actualizado
         const [courses] = await pool.query(`
            SELECT c.*, u.nombre as ultimo_editor
            FROM cursos c
            LEFT JOIN usuarios u ON c.updated_by = u.usuario_id
            WHERE c.curso_id = ?
         `, [id]);

         res.json({
            msg: 'Curso actualizado exitosamente',
            curso: courses[0]
         });

      } catch (error) {
         console.error('Error al actualizar curso:', error);
         res.status(500).json({ 
            msg: 'Error al actualizar el curso',
            error: error.message 
         });
      }
   },

   /**
    * Eliminar un curso
    * Acceso: requiere permiso 'eliminar_curso' Y ser instructor del curso
    * O ser administrador
    */
   deleteCourse: async (req, res) => {
      try {
         const { id } = req.params;

         const [result] = await pool.query(
            'DELETE FROM cursos WHERE curso_id = ?',
            [id]
         );

         if (result.affectedRows === 0) {
            return res.status(404).json({ msg: 'Curso no encontrado' });
         }

         res.json({ msg: 'Curso eliminado exitosamente' });

      } catch (error) {
         console.error('Error al eliminar curso:', error);
         res.status(500).json({ 
            msg: 'Error al eliminar el curso',
            error: error.message 
         });
      }
   },

   /**
    * Obtener cursos del usuario actual (donde es instructor)
    * Acceso: cualquier usuario autenticado
    */
   getMyCourses: async (req, res) => {
      try {
         const userId = req.user.id;

         const [courses] = await pool.query(`
            SELECT 
               c.*,
               ci.rol_en_curso
            FROM cursos c
            JOIN cursos_instructores ci ON c.curso_id = ci.curso_id
            WHERE ci.usuario_id = ?
            ORDER BY c.created_at DESC
         `, [userId]);

         res.json(courses);

      } catch (error) {
         console.error('Error al obtener mis cursos:', error);
         res.status(500).json({ 
            msg: 'Error del servidor',
            error: error.message 
         });
      }
   },

   /**
    * Asignar un instructor adicional a un curso
    * Acceso: requiere ser instructor principal del curso o administrador
    */
   assignInstructor: async (req, res) => {
      try {
         const { id } = req.params; // curso_id
         const { usuario_id, rol_en_curso } = req.body;

         if (!usuario_id) {
            return res.status(400).json({ 
               msg: 'El usuario_id es requerido' 
            });
         }

         // Verificar que el usuario a asignar existe y tiene rol de instructor
         const [usuarios] = await pool.query(`
            SELECT u.usuario_id
            FROM usuarios u
            JOIN usuarios_roles ur ON u.usuario_id = ur.usuario_id
            JOIN roles r ON ur.rol_id = r.rol_id
            WHERE u.usuario_id = ? AND r.nombre_rol IN ('instructor', 'administrador')
         `, [usuario_id]);

         if (usuarios.length === 0) {
            return res.status(400).json({ 
               msg: 'El usuario no existe o no tiene rol de instructor' 
            });
         }

         // Asignar instructor al curso
         await pool.query(
            `INSERT INTO cursos_instructores (curso_id, usuario_id, rol_en_curso)
             VALUES (?, ?, ?)
             ON DUPLICATE KEY UPDATE rol_en_curso = VALUES(rol_en_curso)`,
            [id, usuario_id, rol_en_curso || 'instructor']
         );

         res.json({ msg: 'Instructor asignado exitosamente' });

      } catch (error) {
         console.error('Error al asignar instructor:', error);
         res.status(500).json({ 
            msg: 'Error al asignar instructor',
            error: error.message 
         });
      }
   },

   /**
    * Remover un instructor de un curso
    * Acceso: requiere ser instructor principal del curso o administrador
    */
   removeInstructor: async (req, res) => {
      try {
         const { id, instructorId } = req.params;

         const [result] = await pool.query(
            `DELETE FROM cursos_instructores 
             WHERE curso_id = ? AND usuario_id = ?`,
            [id, instructorId]
         );

         if (result.affectedRows === 0) {
            return res.status(404).json({ 
               msg: 'Asignación no encontrada' 
            });
         }

         res.json({ msg: 'Instructor removido exitosamente' });

      } catch (error) {
         console.error('Error al remover instructor:', error);
         res.status(500).json({ 
            msg: 'Error al remover instructor',
            error: error.message 
         });
      }
   }
};

/**
 * Función auxiliar para obtener el ID del propietario de un curso
 * (usado en middleware de ownership)
 */
async function getCourseOwnerId(req) {
   const { id } = req.params;
   const [courses] = await pool.query(
      'SELECT created_by FROM cursos WHERE curso_id = ?',
      [id]
   );
   return courses.length > 0 ? courses[0].created_by : null;
}

/**
 * Función auxiliar para verificar si un usuario es instructor de un curso
 */
async function isInstructorOfCourse(req) {
   const { id } = req.params;
   const userId = req.user.id;
   
   const [instructores] = await pool.query(
      `SELECT 1 FROM cursos_instructores 
       WHERE curso_id = ? AND usuario_id = ?`,
      [id, userId]
   );
   
   return instructores.length > 0;
}

module.exports = {
   courseControllerRBAC,
   getCourseOwnerId,
   isInstructorOfCourse
};
