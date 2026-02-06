// coursesRBAC.js: Rutas de cursos con control de acceso RBAC
// Ejemplo de implementación de rutas protegidas por permisos

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { 
   checkPermission, 
   checkRole,
   checkPermissionOrOwnership 
} = require('../middleware/rbac');
const { 
   courseControllerRBAC,
   getCourseOwnerId,
   isInstructorOfCourse 
} = require('../controllers/courseControllerRBAC');

// =================================================================
// RUTAS PÚBLICAS (requieren solo autenticación)
// =================================================================

/**
 * @route   GET /api/courses
 * @desc    Obtener todos los cursos
 * @access  Autenticado
 */
router.get('/', 
   auth, 
   courseControllerRBAC.getAllCourses
);

/**
 * @route   GET /api/courses/:id
 * @desc    Obtener un curso por ID
 * @access  Autenticado
 */
router.get('/:id', 
   auth, 
   courseControllerRBAC.getCourseById
);

/**
 * @route   GET /api/courses/my/courses
 * @desc    Obtener cursos donde el usuario es instructor
 * @access  Autenticado
 */
router.get('/my/courses', 
   auth, 
   courseControllerRBAC.getMyCourses
);

// =================================================================
// RUTAS PROTEGIDAS POR PERMISOS
// =================================================================

/**
 * @route   POST /api/courses
 * @desc    Crear un nuevo curso
 * @access  Requiere permiso 'crear_curso'
 * @roles   instructor, administrador
 */
router.post('/', 
   auth,
   checkPermission('crear_curso'),
   courseControllerRBAC.createCourse
);

/**
 * @route   PUT /api/courses/:id
 * @desc    Actualizar un curso
 * @access  Requiere permiso 'editar_curso' Y ser instructor del curso
 *          O tener rol 'administrador' (puede editar cualquier curso)
 * 
 * Nota: Este es un ejemplo de middleware personalizado que combina
 * verificación de permiso + ownership
 */
router.put('/:id', 
   auth,
   async (req, res, next) => {
      try {
         const userId = req.user.id;
         const courseId = req.params.id;

         // Verificar si el usuario es administrador
         const { getUserRoles, getUserPermissions } = require('../middleware/rbac');
         const [userRoles, userPermissions] = await Promise.all([
            getUserRoles(userId),
            getUserPermissions(userId)
         ]);

         req.userRoles = userRoles;
         req.userPermissions = userPermissions;

         // Si es administrador, permitir editar cualquier curso
         if (userRoles.includes('administrador')) {
            return next();
         }

         // Si no es admin, verificar que tenga permiso 'editar_curso'
         if (!userPermissions.includes('editar_curso')) {
            return res.status(403).json({ 
               msg: 'Acceso denegado. Requiere permiso: editar_curso' 
            });
         }

         // Verificar que sea instructor del curso
         const [instructores] = await require('../config/database').query(
            `SELECT 1 FROM cursos_instructores 
             WHERE curso_id = ? AND usuario_id = ?`,
            [courseId, userId]
         );

         if (instructores.length === 0) {
            return res.status(403).json({ 
               msg: 'Solo los instructores del curso pueden editarlo' 
            });
         }

         next();
      } catch (error) {
         console.error('Error en verificación de permisos:', error);
         res.status(500).json({ 
            msg: 'Error al verificar permisos',
            error: error.message 
         });
      }
   },
   courseControllerRBAC.updateCourse
);

/**
 * @route   DELETE /api/courses/:id
 * @desc    Eliminar un curso
 * @access  Requiere permiso 'eliminar_curso' Y ser instructor del curso
 *          O ser administrador
 */
router.delete('/:id', 
   auth,
   checkPermission('eliminar_curso'),
   async (req, res, next) => {
      try {
         const userId = req.user.id;
         const courseId = req.params.id;

         // Si es administrador, permitir eliminar cualquier curso
         if (req.userRoles && req.userRoles.includes('administrador')) {
            return next();
         }

         // Verificar que sea instructor del curso
         const [instructores] = await require('../config/database').query(
            `SELECT 1 FROM cursos_instructores 
             WHERE curso_id = ? AND usuario_id = ?`,
            [courseId, userId]
         );

         if (instructores.length === 0) {
            return res.status(403).json({ 
               msg: 'Solo los instructores del curso pueden eliminarlo' 
            });
         }

         next();
      } catch (error) {
         console.error('Error en verificación de permisos:', error);
         res.status(500).json({ 
            msg: 'Error al verificar permisos',
            error: error.message 
         });
      }
   },
   courseControllerRBAC.deleteCourse
);

// =================================================================
// GESTIÓN DE INSTRUCTORES
// =================================================================

/**
 * @route   POST /api/courses/:id/instructors
 * @desc    Asignar un instructor adicional a un curso
 * @access  Requiere ser instructor del curso o administrador
 */
router.post('/:id/instructors', 
   auth,
   checkRole(['instructor', 'administrador']),
   courseControllerRBAC.assignInstructor
);

/**
 * @route   DELETE /api/courses/:id/instructors/:instructorId
 * @desc    Remover un instructor de un curso
 * @access  Requiere ser instructor del curso o administrador
 */
router.delete('/:id/instructors/:instructorId', 
   auth,
   checkRole(['instructor', 'administrador']),
   courseControllerRBAC.removeInstructor
);

// =================================================================
// EJEMPLOS ADICIONALES DE USO DE MIDDLEWARE
// =================================================================

/**
 * Ejemplo 1: Requiere MÚLTIPLES permisos (todos)
 * El usuario debe tener TODOS los permisos listados
 */
/*
router.post('/special-action',
   auth,
   checkPermission(['crear_curso', 'editar_curso'], { requireAll: true }),
   (req, res) => {
      res.json({ msg: 'Acción especial ejecutada' });
   }
);
*/

/**
 * Ejemplo 2: Requiere AL MENOS UNO de varios permisos
 * El usuario debe tener al menos uno de los permisos listados
 */
/*
router.get('/reports',
   auth,
   checkPermission(['ver_reportes', 'gestionar_usuarios'], { requireAll: false }),
   (req, res) => {
      res.json({ msg: 'Acceso a reportes' });
   }
);
*/

/**
 * Ejemplo 3: Solo administradores
 */
/*
router.get('/admin-only',
   auth,
   checkRole('administrador'),
   (req, res) => {
      res.json({ msg: 'Solo administradores pueden ver esto' });
   }
);
*/

module.exports = router;
