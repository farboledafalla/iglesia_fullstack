// roleManagementController.js: Controlador para gestionar roles y permisos de usuarios
// Solo accesible para administradores

const pool = require('../config/database');

const roleManagementController = {
   /**
    * Obtener todos los roles disponibles
    */
   getAllRoles: async (req, res) => {
      try {
         const [roles] = await pool.query(`
            SELECT 
               r.rol_id,
               r.nombre_rol,
               r.descripcion,
               COUNT(DISTINCT ur.usuario_id) as total_usuarios,
               COUNT(DISTINCT rp.permiso_id) as total_permisos
            FROM roles r
            LEFT JOIN usuarios_roles ur ON r.rol_id = ur.rol_id
            LEFT JOIN roles_permisos rp ON r.rol_id = rp.rol_id
            GROUP BY r.rol_id
            ORDER BY r.nombre_rol
         `);

         res.json(roles);
      } catch (error) {
         console.error('Error al obtener roles:', error);
         res.status(500).json({ 
            msg: 'Error al obtener roles',
            error: error.message 
         });
      }
   },

   /**
    * Obtener todos los permisos disponibles
    */
   getAllPermissions: async (req, res) => {
      try {
         const [permisos] = await pool.query(`
            SELECT 
               p.permiso_id,
               p.nombre,
               p.descripcion,
               COUNT(DISTINCT rp.rol_id) as asignado_a_roles
            FROM permisos p
            LEFT JOIN roles_permisos rp ON p.permiso_id = rp.permiso_id
            GROUP BY p.permiso_id
            ORDER BY p.nombre
         `);

         res.json(permisos);
      } catch (error) {
         console.error('Error al obtener permisos:', error);
         res.status(500).json({ 
            msg: 'Error al obtener permisos',
            error: error.message 
         });
      }
   },

   /**
    * Obtener permisos de un rol específico
    */
   getRolePermissions: async (req, res) => {
      try {
         const { roleId } = req.params;

         const [permisos] = await pool.query(`
            SELECT p.*
            FROM permisos p
            JOIN roles_permisos rp ON p.permiso_id = rp.permiso_id
            WHERE rp.rol_id = ?
            ORDER BY p.nombre
         `, [roleId]);

         res.json(permisos);
      } catch (error) {
         console.error('Error al obtener permisos del rol:', error);
         res.status(500).json({ 
            msg: 'Error al obtener permisos del rol',
            error: error.message 
         });
      }
   },

   /**
    * Obtener roles de un usuario específico
    */
   getUserRoles: async (req, res) => {
      try {
         const { userId } = req.params;

         const [roles] = await pool.query(`
            SELECT 
               r.rol_id,
               r.nombre_rol,
               r.descripcion,
               ur.asignado_at,
               u_asignador.nombre as asignado_por_nombre
            FROM usuarios_roles ur
            JOIN roles r ON ur.rol_id = r.rol_id
            LEFT JOIN usuarios u_asignador ON ur.asignado_por = u_asignador.usuario_id
            WHERE ur.usuario_id = ?
            ORDER BY ur.asignado_at DESC
         `, [userId]);

         res.json(roles);
      } catch (error) {
         console.error('Error al obtener roles del usuario:', error);
         res.status(500).json({ 
            msg: 'Error al obtener roles del usuario',
            error: error.message 
         });
      }
   },

   /**
    * Asignar un rol a un usuario
    */
   assignRoleToUser: async (req, res) => {
      try {
         const { userId } = req.params;
         const { rol_id } = req.body;
         const adminId = req.user.id;

         // Validar que el rol existe
         const [roles] = await pool.query(
            'SELECT * FROM roles WHERE rol_id = ?',
            [rol_id]
         );

         if (roles.length === 0) {
            return res.status(404).json({ msg: 'Rol no encontrado' });
         }

         // Validar que el usuario existe
         const [usuarios] = await pool.query(
            'SELECT * FROM usuarios WHERE usuario_id = ?',
            [userId]
         );

         if (usuarios.length === 0) {
            return res.status(404).json({ msg: 'Usuario no encontrado' });
         }

         // Asignar rol (INSERT IGNORE para evitar duplicados)
         await pool.query(
            `INSERT IGNORE INTO usuarios_roles (usuario_id, rol_id, asignado_por)
             VALUES (?, ?, ?)`,
            [userId, rol_id, adminId]
         );

         res.json({ 
            msg: 'Rol asignado exitosamente',
            usuario_id: userId,
            rol_id: rol_id
         });

      } catch (error) {
         console.error('Error al asignar rol:', error);
         res.status(500).json({ 
            msg: 'Error al asignar rol',
            error: error.message 
         });
      }
   },

   /**
    * Remover un rol de un usuario
    */
   removeRoleFromUser: async (req, res) => {
      try {
         const { userId, roleId } = req.params;

         // Verificar que el usuario tenga al menos un rol después de remover este
         const [rolesCount] = await pool.query(
            'SELECT COUNT(*) as total FROM usuarios_roles WHERE usuario_id = ?',
            [userId]
         );

         if (rolesCount[0].total <= 1) {
            return res.status(400).json({ 
               msg: 'No se puede remover el último rol del usuario. Asigne otro rol primero.' 
            });
         }

         const [result] = await pool.query(
            'DELETE FROM usuarios_roles WHERE usuario_id = ? AND rol_id = ?',
            [userId, roleId]
         );

         if (result.affectedRows === 0) {
            return res.status(404).json({ 
               msg: 'Asignación de rol no encontrada' 
            });
         }

         res.json({ msg: 'Rol removido exitosamente' });

      } catch (error) {
         console.error('Error al remover rol:', error);
         res.status(500).json({ 
            msg: 'Error al remover rol',
            error: error.message 
         });
      }
   },

   /**
    * Obtener todos los usuarios con sus roles y permisos
    */
   getUsersWithRoles: async (req, res) => {
      try {
         const [usuarios] = await pool.query(`
            SELECT 
               u.usuario_id,
               u.nombre,
               u.email,
               u.estado,
               GROUP_CONCAT(DISTINCT r.nombre_rol ORDER BY r.nombre_rol SEPARATOR ', ') as roles,
               COUNT(DISTINCT ur.rol_id) as total_roles
            FROM usuarios u
            LEFT JOIN usuarios_roles ur ON u.usuario_id = ur.usuario_id
            LEFT JOIN roles r ON ur.rol_id = r.rol_id
            GROUP BY u.usuario_id
            ORDER BY u.nombre
         `);

         res.json(usuarios);
      } catch (error) {
         console.error('Error al obtener usuarios con roles:', error);
         res.status(500).json({ 
            msg: 'Error al obtener usuarios',
            error: error.message 
         });
      }
   },

   /**
    * Obtener permisos efectivos de un usuario
    * (todos los permisos que tiene a través de sus roles)
    */
   getUserEffectivePermissions: async (req, res) => {
      try {
         const { userId } = req.params;

         const [permisos] = await pool.query(`
            SELECT DISTINCT 
               p.permiso_id,
               p.nombre,
               p.descripcion,
               r.nombre_rol as rol_origen
            FROM usuarios_roles ur
            JOIN roles_permisos rp ON ur.rol_id = rp.rol_id
            JOIN permisos p ON rp.permiso_id = p.permiso_id
            JOIN roles r ON ur.rol_id = r.rol_id
            WHERE ur.usuario_id = ?
            ORDER BY p.nombre
         `, [userId]);

         res.json(permisos);
      } catch (error) {
         console.error('Error al obtener permisos del usuario:', error);
         res.status(500).json({ 
            msg: 'Error al obtener permisos',
            error: error.message 
         });
      }
   },

   /**
    * Actualizar permisos de un rol
    * (reemplaza todos los permisos del rol con los nuevos)
    */
   updateRolePermissions: async (req, res) => {
      const connection = await require('../config/database').getConnection();
      
      try {
         const { roleId } = req.params;
         const { permiso_ids } = req.body; // Array de IDs de permisos

         if (!Array.isArray(permiso_ids)) {
            return res.status(400).json({ 
               msg: 'permiso_ids debe ser un array' 
            });
         }

         await connection.beginTransaction();

         // Eliminar permisos actuales del rol
         await connection.query(
            'DELETE FROM roles_permisos WHERE rol_id = ?',
            [roleId]
         );

         // Insertar nuevos permisos
         if (permiso_ids.length > 0) {
            const values = permiso_ids.map(pid => [roleId, pid]);
            await connection.query(
               'INSERT INTO roles_permisos (rol_id, permiso_id) VALUES ?',
               [values]
            );
         }

         await connection.commit();

         res.json({ 
            msg: 'Permisos del rol actualizados exitosamente',
            total_permisos: permiso_ids.length
         });

      } catch (error) {
         await connection.rollback();
         console.error('Error al actualizar permisos del rol:', error);
         res.status(500).json({ 
            msg: 'Error al actualizar permisos',
            error: error.message 
         });
      } finally {
         connection.release();
      }
   }
};

module.exports = roleManagementController;
