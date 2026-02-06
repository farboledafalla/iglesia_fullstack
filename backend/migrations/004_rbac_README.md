# Sistema RBAC (Control de Acceso Basado en Roles)

## Descripción General

Este sistema implementa un control de acceso robusto y flexible basado en roles (RBAC) que permite:

- **Roles múltiples por usuario**: Un usuario puede tener varios roles (ej: instructor + estudiante)
- **Permisos granulares**: Control fino sobre qué acciones puede realizar cada rol
- **Ownership (propiedad)**: Los usuarios pueden gestionar sus propios recursos
- **Auditoría**: Registro de quién crea y modifica cada recurso
- **Separación de responsabilidades**: Administradores vs Instructores vs Estudiantes

## Estructura de Tablas

### Tablas principales:

1. **`roles`**: Define los roles del sistema (administrador, instructor, estudiante)
2. **`permisos`**: Define los permisos disponibles (crear_curso, editar_curso, etc.)
3. **`roles_permisos`**: Relaciona roles con permisos (muchos-a-muchos)
4. **`usuarios_roles`**: Relaciona usuarios con roles (muchos-a-muchos)
5. **`cursos_instructores`**: Relaciona instructores con cursos específicos

### Roles predefinidos:

- **administrador**: Control total del sistema
- **instructor**: Puede crear y gestionar cursos propios
- **estudiante**: Puede ver cursos y participar en ellos

### Permisos predefinidos:

- `crear_curso`: Crear nuevos cursos
- `ver_curso`: Ver cursos propios
- `editar_curso`: Editar cursos propios
- `eliminar_curso`: Eliminar cursos propios
- `calificar_intento`: Calificar intentos de estudiantes
- `ver_alumnos`: Ver lista de alumnos inscritos
- `gestionar_usuarios`: Crear/editar/eliminar usuarios (admin)
- `gestionar_roles`: Asignar/remover roles (admin)
- `ver_reportes`: Ver reportes y estadísticas (admin)
- `editar_cualquier_curso`: Editar cualquier curso sin restricción (admin)

## Instalación y Configuración

### 1. Ejecutar la migración SQL

```bash
# Desde el directorio backend
mysql -u usuario -p iglesia < migrations/004_rbac_system.sql
```

O ejecutar el contenido del archivo `004_rbac_system.sql` en tu cliente MySQL favorito.

### 2. Verificar la instalación

```sql
-- Ver roles disponibles
SELECT * FROM roles;

-- Ver permisos disponibles
SELECT * FROM permisos;

-- Ver relación roles-permisos
SELECT r.nombre_rol, p.nombre, p.descripcion
FROM roles_permisos rp
JOIN roles r ON rp.rol_id = r.rol_id
JOIN permisos p ON rp.permiso_id = p.permiso_id
ORDER BY r.nombre_rol, p.nombre;

-- Ver usuarios y sus roles
SELECT u.nombre, u.email, r.nombre_rol
FROM usuarios_roles ur
JOIN usuarios u ON ur.usuario_id = u.usuario_id
JOIN roles r ON ur.rol_id = r.rol_id
ORDER BY u.nombre;
```

### 3. Montar las nuevas rutas en app.js

```javascript
// En backend/src/app.js, añadir:
const coursesRBACRoutes = require('./routes/coursesRBAC');

// Después de las otras rutas:
app.use('/api/courses-rbac', coursesRBACRoutes);
// O reemplazar la ruta existente de courses:
// app.use('/api/courses', coursesRBACRoutes);
```

## Uso del Middleware

### 1. Verificar permisos específicos

```javascript
const { checkPermission } = require('../middleware/rbac');

// Requiere un permiso específico
router.post('/courses', 
   auth,
   checkPermission('crear_curso'),
   courseController.createCourse
);

// Requiere AL MENOS UNO de varios permisos
router.get('/reports',
   auth,
   checkPermission(['ver_reportes', 'gestionar_usuarios'], { requireAll: false }),
   reportController.getReports
);

// Requiere TODOS los permisos listados
router.post('/special-action',
   auth,
   checkPermission(['crear_curso', 'editar_curso'], { requireAll: true }),
   controller.specialAction
);
```

### 2. Verificar roles específicos

```javascript
const { checkRole } = require('../middleware/rbac');

// Solo administradores
router.delete('/users/:id', 
   auth,
   checkRole('administrador'),
   userController.deleteUser
);

// Instructores o administradores
router.post('/courses/:id/instructors', 
   auth,
   checkRole(['instructor', 'administrador']),
   courseController.assignInstructor
);
```

### 3. Verificar propiedad de un recurso

```javascript
const { checkOwnership } = require('../middleware/rbac');

// Solo el propietario puede editar
router.put('/courses/:id', 
   auth,
   checkPermission('editar_curso'),
   checkOwnership(async (req) => {
      const [courses] = await pool.query(
         'SELECT created_by FROM cursos WHERE curso_id = ?',
         [req.params.id]
      );
      return courses[0]?.created_by;
   }),
   courseController.updateCourse
);
```

### 4. Verificar permiso O propiedad (más flexible)

```javascript
const { checkPermissionOrOwnership } = require('../middleware/rbac');

// Puede editar si tiene permiso Y es propietario, O si es administrador
router.put('/courses/:id', 
   auth,
   checkPermissionOrOwnership('editar_curso', getCourseOwnerId),
   courseController.updateCourse
);
```

### 5. Middleware personalizado (lógica compleja)

```javascript
router.put('/courses/:id', 
   auth,
   async (req, res, next) => {
      const { getUserRoles, getUserPermissions } = require('../middleware/rbac');
      const userId = req.user.id;
      const courseId = req.params.id;

      // Obtener roles y permisos
      const [userRoles, userPermissions] = await Promise.all([
         getUserRoles(userId),
         getUserPermissions(userId)
      ]);

      // Administrador puede todo
      if (userRoles.includes('administrador')) {
         return next();
      }

      // Verificar permiso + ownership
      if (!userPermissions.includes('editar_curso')) {
         return res.status(403).json({ 
            msg: 'Requiere permiso: editar_curso' 
         });
      }

      // Verificar que sea instructor del curso
      const [instructores] = await pool.query(
         'SELECT 1 FROM cursos_instructores WHERE curso_id = ? AND usuario_id = ?',
         [courseId, userId]
      );

      if (instructores.length === 0) {
         return res.status(403).json({ 
            msg: 'Solo instructores del curso pueden editarlo' 
         });
      }

      next();
   },
   courseController.updateCourse
);
```

## Gestión de Usuarios y Roles

### Asignar rol a un usuario

```sql
-- Obtener IDs
SELECT rol_id FROM roles WHERE nombre_rol = 'instructor'; -- Supongamos: 3
SELECT usuario_id FROM usuarios WHERE email = 'juan@example.com'; -- Supongamos: 42

-- Asignar rol
INSERT INTO usuarios_roles (usuario_id, rol_id, asignado_por)
VALUES (42, 3, 1); -- 1 es el usuario_id del admin que asigna
```

### Crear endpoint para gestión de roles (ejemplo)

```javascript
// En roleController.js
const assignRole = async (req, res) => {
   try {
      const { usuario_id, rol_id } = req.body;
      const adminId = req.user.id;

      await pool.query(
         'INSERT INTO usuarios_roles (usuario_id, rol_id, asignado_por) VALUES (?, ?, ?)',
         [usuario_id, rol_id, adminId]
      );

      res.json({ msg: 'Rol asignado exitosamente' });
   } catch (error) {
      res.status(500).json({ msg: 'Error al asignar rol', error: error.message });
   }
};

const removeRole = async (req, res) => {
   try {
      const { usuario_id, rol_id } = req.body;

      await pool.query(
         'DELETE FROM usuarios_roles WHERE usuario_id = ? AND rol_id = ?',
         [usuario_id, rol_id]
      );

      res.json({ msg: 'Rol removido exitosamente' });
   } catch (error) {
      res.status(500).json({ msg: 'Error al remover rol', error: error.message });
   }
};

// En routes
router.post('/users/:id/roles', 
   auth, 
   checkPermission('gestionar_roles'), 
   roleController.assignRole
);

router.delete('/users/:id/roles/:roleId', 
   auth, 
   checkPermission('gestionar_roles'), 
   roleController.removeRole
);
```

## Ejemplos de Uso Completos

### Ejemplo 1: Sistema de cursos

```javascript
// CREAR curso (requiere permiso)
POST /api/courses
Headers: { Authorization: 'Bearer TOKEN' }
Body: { titulo: 'Nuevo Curso', descripcion: 'Descripción...' }
// Usuario automáticamente asignado como instructor

// EDITAR curso (requiere permiso + ser instructor del curso)
PUT /api/courses/123
Headers: { Authorization: 'Bearer TOKEN' }
Body: { titulo: 'Curso Actualizado' }

// ELIMINAR curso (requiere permiso + ser instructor)
DELETE /api/courses/123
Headers: { Authorization: 'Bearer TOKEN' }

// VER mis cursos (donde soy instructor)
GET /api/courses/my/courses
Headers: { Authorization: 'Bearer TOKEN' }
```

### Ejemplo 2: Asignar co-instructor

```javascript
// Asignar instructor adicional a un curso
POST /api/courses/123/instructors
Headers: { Authorization: 'Bearer TOKEN' }
Body: { usuario_id: 42, rol_en_curso: 'asistente' }

// Remover instructor de un curso
DELETE /api/courses/123/instructors/42
Headers: { Authorization: 'Bearer TOKEN' }
```

## Testing del Sistema

### 1. Crear usuarios de prueba con diferentes roles

```sql
-- Crear admin
INSERT INTO usuarios (nombre, email, password_hash, pais_id, rol_id, estado)
VALUES ('Admin Test', 'admin@test.com', '$2a$10$...', 1, 1, 'ACTIVO');
SET @admin_id = LAST_INSERT_ID();
INSERT INTO usuarios_roles (usuario_id, rol_id) VALUES (@admin_id, 1);

-- Crear instructor
INSERT INTO usuarios (nombre, email, password_hash, pais_id, rol_id, estado)
VALUES ('Instructor Test', 'instructor@test.com', '$2a$10$...', 1, 3, 'ACTIVO');
SET @instructor_id = LAST_INSERT_ID();
INSERT INTO usuarios_roles (usuario_id, rol_id) VALUES (@instructor_id, 3);

-- Crear estudiante
INSERT INTO usuarios (nombre, email, password_hash, pais_id, rol_id, estado)
VALUES ('Estudiante Test', 'estudiante@test.com', '$2a$10$...', 1, 2, 'ACTIVO');
SET @estudiante_id = LAST_INSERT_ID();
INSERT INTO usuarios_roles (usuario_id, rol_id) VALUES (@estudiante_id, 2);
```

### 2. Probar accesos

```bash
# Login como instructor
POST /api/auth/login
Body: { email: 'instructor@test.com', password: '...' }
# Guardar token

# Intentar crear curso (debería funcionar)
POST /api/courses
Headers: { Authorization: 'Bearer TOKEN_INSTRUCTOR' }
Body: { titulo: 'Mi Curso', descripcion: '...' }

# Login como estudiante
POST /api/auth/login
Body: { email: 'estudiante@test.com', password: '...' }

# Intentar crear curso (debería fallar con 403)
POST /api/courses
Headers: { Authorization: 'Bearer TOKEN_ESTUDIANTE' }
Body: { titulo: 'Curso', descripcion: '...' }
# Respuesta esperada: { msg: 'Acceso denegado. Requiere permiso: crear_curso' }
```

## Troubleshooting

### Problema: "Acceso denegado" pero el usuario debería tener permiso

1. Verificar roles del usuario:
```sql
SELECT r.nombre_rol 
FROM usuarios_roles ur 
JOIN roles r ON ur.rol_id = r.rol_id 
WHERE ur.usuario_id = ?;
```

2. Verificar permisos del rol:
```sql
SELECT p.nombre 
FROM roles_permisos rp 
JOIN permisos p ON rp.permiso_id = p.permiso_id 
WHERE rp.rol_id = ?;
```

3. Verificar que la migración se ejecutó correctamente:
```sql
SHOW TABLES LIKE '%roles%';
SHOW TABLES LIKE '%permisos%';
```

### Problema: Usuario no puede editar su propio curso

- Verificar que el usuario esté en `cursos_instructores`:
```sql
SELECT * FROM cursos_instructores WHERE curso_id = ? AND usuario_id = ?;
```

- Verificar que el curso tenga `created_by` correcto:
```sql
SELECT created_by FROM cursos WHERE curso_id = ?;
```

## Mejoras Futuras

- [ ] Cache de permisos en Redis para mejor performance
- [ ] Permisos dinámicos basados en contexto (ej: solo en cursos activos)
- [ ] Roles temporales con fecha de expiración
- [ ] Historial completo de cambios de roles
- [ ] UI de administración de roles y permisos
- [ ] Exportar/importar configuración de permisos

## Recursos Adicionales

- [Express.js Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [OWASP Access Control Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Access_Control_Cheat_Sheet.html)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
