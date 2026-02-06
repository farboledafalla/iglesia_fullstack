// roleManagement.js: Rutas para gestionar roles y permisos
// Solo accesible para administradores

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { checkPermission } = require('../middleware/rbac');
const roleManagementController = require('../controllers/roleManagementController');

// =================================================================
// CONSULTA DE ROLES Y PERMISOS
// =================================================================

/**
 * @route   GET /api/role-management/roles
 * @desc    Obtener todos los roles
 * @access  Admin (requiere permiso 'gestionar_roles')
 */
router.get('/roles',
   auth,
   checkPermission('gestionar_roles'),
   roleManagementController.getAllRoles
);

/**
 * @route   GET /api/role-management/permissions
 * @desc    Obtener todos los permisos
 * @access  Admin
 */
router.get('/permissions',
   auth,
   checkPermission('gestionar_roles'),
   roleManagementController.getAllPermissions
);

/**
 * @route   GET /api/role-management/roles/:roleId/permissions
 * @desc    Obtener permisos de un rol específico
 * @access  Admin
 */
router.get('/roles/:roleId/permissions',
   auth,
   checkPermission('gestionar_roles'),
   roleManagementController.getRolePermissions
);

/**
 * @route   GET /api/role-management/users/:userId/roles
 * @desc    Obtener roles de un usuario específico
 * @access  Admin
 */
router.get('/users/:userId/roles',
   auth,
   checkPermission('gestionar_roles'),
   roleManagementController.getUserRoles
);

/**
 * @route   GET /api/role-management/users/:userId/permissions
 * @desc    Obtener permisos efectivos de un usuario
 * @access  Admin
 */
router.get('/users/:userId/permissions',
   auth,
   checkPermission('gestionar_roles'),
   roleManagementController.getUserEffectivePermissions
);

/**
 * @route   GET /api/role-management/users
 * @desc    Obtener todos los usuarios con sus roles
 * @access  Admin
 */
router.get('/users',
   auth,
   checkPermission('gestionar_roles'),
   roleManagementController.getUsersWithRoles
);

// =================================================================
// ASIGNACIÓN Y REMOCIÓN DE ROLES
// =================================================================

/**
 * @route   POST /api/role-management/users/:userId/roles
 * @desc    Asignar un rol a un usuario
 * @access  Admin
 * @body    { rol_id: number }
 */
router.post('/users/:userId/roles',
   auth,
   checkPermission('gestionar_roles'),
   roleManagementController.assignRoleToUser
);

/**
 * @route   DELETE /api/role-management/users/:userId/roles/:roleId
 * @desc    Remover un rol de un usuario
 * @access  Admin
 */
router.delete('/users/:userId/roles/:roleId',
   auth,
   checkPermission('gestionar_roles'),
   roleManagementController.removeRoleFromUser
);

/**
 * @route   PUT /api/role-management/roles/:roleId/permissions
 * @desc    Actualizar permisos de un rol
 * @access  Admin
 * @body    { permiso_ids: number[] }
 */
router.put('/roles/:roleId/permissions',
   auth,
   checkPermission('gestionar_roles'),
   roleManagementController.updateRolePermissions
);

module.exports = router;
