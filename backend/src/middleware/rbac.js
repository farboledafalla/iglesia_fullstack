// rbac.js: Middleware de Control de Acceso Basado en Roles (RBAC)
// Verifica si el usuario tiene los permisos necesarios para realizar una acción

const pool = require('../config/database');

/**
 * Obtiene todos los permisos de un usuario basado en sus roles
 * @param {number} userId - ID del usuario
 * @returns {Promise<string[]>} - Array con nombres de permisos
 */
async function getUserPermissions(userId) {
   try {
      const [permissions] = await pool.query(
         `SELECT DISTINCT p.nombre
          FROM usuarios_roles ur
          JOIN roles_permisos rp ON ur.rol_id = rp.rol_id
          JOIN permisos p ON rp.permiso_id = p.permiso_id
          WHERE ur.usuario_id = ?`,
         [userId]
      );
      return permissions.map(p => p.nombre);
   } catch (error) {
      console.error('Error al obtener permisos del usuario:', error);
      return [];
   }
}

/**
 * Obtiene los roles de un usuario
 * @param {number} userId - ID del usuario
 * @returns {Promise<string[]>} - Array con nombres de roles
 */
async function getUserRoles(userId) {
   try {
      const [roles] = await pool.query(
         `SELECT r.nombre_rol
          FROM usuarios_roles ur
          JOIN roles r ON ur.rol_id = r.rol_id
          WHERE ur.usuario_id = ?`,
         [userId]
      );
      return roles.map(r => r.nombre_rol);
   } catch (error) {
      console.error('Error al obtener roles del usuario:', error);
      return [];
   }
}

/**
 * Middleware que verifica si el usuario tiene un permiso específico
 * @param {string|string[]} requiredPermissions - Permiso(s) requerido(s)
 * @param {object} options - Opciones adicionales
 * @param {boolean} options.requireAll - Si true, requiere TODOS los permisos. Si false, requiere AL MENOS UNO
 * @returns {Function} - Middleware de Express
 */
function checkPermission(requiredPermissions, options = {}) {
   const { requireAll = false } = options;
   const permissions = Array.isArray(requiredPermissions) 
      ? requiredPermissions 
      : [requiredPermissions];

   return async (req, res, next) => {
      try {
         // Verificar que el usuario esté autenticado
         if (!req.user || !req.user.id) {
            return res.status(401).json({ 
               msg: 'No autenticado. Por favor inicie sesión.' 
            });
         }

         // Obtener permisos del usuario
         const userPermissions = await getUserPermissions(req.user.id);

         // Adjuntar permisos al request para uso posterior
         req.userPermissions = userPermissions;

         // Verificar si el usuario tiene los permisos requeridos
         let hasPermission;
         if (requireAll) {
            // Requiere TODOS los permisos
            hasPermission = permissions.every(p => userPermissions.includes(p));
         } else {
            // Requiere AL MENOS UNO
            hasPermission = permissions.some(p => userPermissions.includes(p));
         }

         if (!hasPermission) {
            const permissionList = permissions.join(', ');
            return res.status(403).json({ 
               msg: `Acceso denegado. Requiere permiso(s): ${permissionList}`,
               required: permissions,
               hasPermissions: userPermissions
            });
         }

         // Usuario tiene permisos, continuar
         next();
      } catch (error) {
         console.error('Error en middleware de permisos:', error);
         res.status(500).json({ 
            msg: 'Error al verificar permisos',
            error: error.message 
         });
      }
   };
}

/**
 * Middleware que verifica si el usuario tiene un rol específico
 * @param {string|string[]} requiredRoles - Rol(es) requerido(s)
 * @param {object} options - Opciones adicionales
 * @param {boolean} options.requireAll - Si true, requiere TODOS los roles. Si false, requiere AL MENOS UNO
 * @returns {Function} - Middleware de Express
 */
function checkRole(requiredRoles, options = {}) {
   const { requireAll = false } = options;
   const roles = Array.isArray(requiredRoles) 
      ? requiredRoles 
      : [requiredRoles];

   return async (req, res, next) => {
      try {
         // Verificar que el usuario esté autenticado
         if (!req.user || !req.user.id) {
            return res.status(401).json({ 
               msg: 'No autenticado. Por favor inicie sesión.' 
            });
         }

         // Obtener roles del usuario
         const userRoles = await getUserRoles(req.user.id);

         // Adjuntar roles al request para uso posterior
         req.userRoles = userRoles;

         // Verificar si el usuario tiene los roles requeridos
         let hasRole;
         if (requireAll) {
            // Requiere TODOS los roles
            hasRole = roles.every(r => userRoles.includes(r));
         } else {
            // Requiere AL MENOS UNO
            hasRole = roles.some(r => userRoles.includes(r));
         }

         if (!hasRole) {
            const roleList = roles.join(', ');
            return res.status(403).json({ 
               msg: `Acceso denegado. Requiere rol(es): ${roleList}`,
               required: roles,
               hasRoles: userRoles
            });
         }

         // Usuario tiene el rol, continuar
         next();
      } catch (error) {
         console.error('Error en middleware de roles:', error);
         res.status(500).json({ 
            msg: 'Error al verificar roles',
            error: error.message 
         });
      }
   };
}

/**
 * Verifica si el usuario es propietario de un recurso
 * @param {Function} getResourceOwnerId - Función async que obtiene el owner_id del recurso
 * @returns {Function} - Middleware de Express
 */
function checkOwnership(getResourceOwnerId) {
   return async (req, res, next) => {
      try {
         if (!req.user || !req.user.id) {
            return res.status(401).json({ 
               msg: 'No autenticado' 
            });
         }

         // Obtener el ID del propietario del recurso
         const ownerId = await getResourceOwnerId(req);

         if (!ownerId) {
            return res.status(404).json({ 
               msg: 'Recurso no encontrado' 
            });
         }

         // Verificar si el usuario es el propietario
         if (ownerId !== req.user.id) {
            // Verificar si el usuario es administrador (puede acceder a todo)
            const userRoles = await getUserRoles(req.user.id);
            if (!userRoles.includes('administrador')) {
               return res.status(403).json({ 
                  msg: 'No tiene permiso para acceder a este recurso' 
               });
            }
         }

         // Usuario es propietario o administrador
         next();
      } catch (error) {
         console.error('Error verificando propiedad:', error);
         res.status(500).json({ 
            msg: 'Error al verificar propiedad del recurso',
            error: error.message 
         });
      }
   };
}

/**
 * Middleware combinado: verifica permiso O propiedad
 * Útil para acciones como "editar_curso" donde el usuario puede editar
 * si tiene el permiso Y es propietario, O si es administrador
 */
function checkPermissionOrOwnership(permission, getResourceOwnerId) {
   return async (req, res, next) => {
      try {
         if (!req.user || !req.user.id) {
            return res.status(401).json({ msg: 'No autenticado' });
         }

         const userId = req.user.id;

         // Obtener roles y permisos del usuario
         const [userRoles, userPermissions] = await Promise.all([
            getUserRoles(userId),
            getUserPermissions(userId)
         ]);

         req.userRoles = userRoles;
         req.userPermissions = userPermissions;

         // Si es administrador, permitir acceso
         if (userRoles.includes('administrador')) {
            return next();
         }

         // Si tiene el permiso específico, verificar propiedad
         if (userPermissions.includes(permission)) {
            const ownerId = await getResourceOwnerId(req);
            
            if (!ownerId) {
               return res.status(404).json({ msg: 'Recurso no encontrado' });
            }

            if (ownerId === userId) {
               return next();
            }

            return res.status(403).json({ 
               msg: 'No tiene permiso para modificar este recurso' 
            });
         }

         // No tiene ni el permiso ni es propietario
         return res.status(403).json({ 
            msg: `Acceso denegado. Requiere permiso: ${permission}` 
         });

      } catch (error) {
         console.error('Error en checkPermissionOrOwnership:', error);
         res.status(500).json({ 
            msg: 'Error al verificar permisos',
            error: error.message 
         });
      }
   };
}

module.exports = {
   checkPermission,
   checkRole,
   checkOwnership,
   checkPermissionOrOwnership,
   getUserPermissions,
   getUserRoles
};
