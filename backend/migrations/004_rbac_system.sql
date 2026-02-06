-- ============================================================
-- Migración 004: Sistema RBAC completo
-- ============================================================
-- Implementa sistema de roles y permisos con soporte para:
-- - Roles múltiples por usuario
-- - Permisos granulares
-- - Auditoría (created_by, updated_by)
-- - Rol INSTRUCTOR para gestión de cursos
-- ============================================================

USE iglesia;

-- 1. Añadir rol INSTRUCTOR si no existe
INSERT INTO roles (nombre_rol, descripcion) 
SELECT 'instructor', 'Instructor que crea y gestiona cursos'
WHERE NOT EXISTS (
    SELECT 1 FROM roles WHERE nombre_rol = 'instructor'
);

-- 2. Crear tabla usuarios_roles (muchos-a-muchos)
-- Permite que un usuario tenga múltiples roles
CREATE TABLE IF NOT EXISTS usuarios_roles (
  usuario_id INT(11) NOT NULL,
  rol_id INT(11) NOT NULL,
  asignado_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  asignado_por INT(11) NULL,
  PRIMARY KEY (usuario_id, rol_id),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(usuario_id) ON DELETE CASCADE,
  FOREIGN KEY (rol_id) REFERENCES roles(rol_id) ON DELETE CASCADE,
  FOREIGN KEY (asignado_por) REFERENCES usuarios(usuario_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Migrar datos existentes de usuarios.rol_id a usuarios_roles
-- Solo si no se ha hecho antes
INSERT IGNORE INTO usuarios_roles (usuario_id, rol_id, asignado_at)
SELECT usuario_id, rol_id, fecha_registro
FROM usuarios
WHERE rol_id IS NOT NULL;

-- 4. Añadir columna created_by en tabla cursos para auditoría
ALTER TABLE cursos 
ADD COLUMN IF NOT EXISTS created_by INT(11) NULL AFTER estado,
ADD COLUMN IF NOT EXISTS updated_by INT(11) NULL AFTER created_by;

-- Añadir FK después (evitar error si tabla está vacía)
-- Ejecutar manualmente si es necesario:
-- ALTER TABLE cursos ADD FOREIGN KEY (created_by) REFERENCES usuarios(usuario_id) ON DELETE SET NULL;
-- ALTER TABLE cursos ADD FOREIGN KEY (updated_by) REFERENCES usuarios(usuario_id) ON DELETE SET NULL;

-- 5. Insertar permisos adicionales si no existen
INSERT IGNORE INTO permisos (nombre, descripcion) VALUES
  ('crear_curso', 'Crear cursos'),
  ('ver_curso', 'Ver cursos propios'),
  ('editar_curso', 'Editar cursos propios'),
  ('eliminar_curso', 'Eliminar cursos propios'),
  ('calificar_intento', 'Calificar intentos'),
  ('ver_alumnos', 'Ver lista de alumnos inscritos'),
  ('gestionar_usuarios', 'Crear, editar y eliminar usuarios'),
  ('gestionar_roles', 'Asignar y remover roles'),
  ('ver_reportes', 'Ver reportes y estadísticas'),
  ('editar_cualquier_curso', 'Editar cualquier curso (admin)');

-- 6. Asignar permisos al rol INSTRUCTOR
-- Obtener rol_id de instructor y asignar permisos
INSERT IGNORE INTO roles_permisos (rol_id, permiso_id)
SELECT r.rol_id, p.permiso_id
FROM roles r
CROSS JOIN permisos p
WHERE r.nombre_rol = 'instructor'
  AND p.nombre IN (
    'crear_curso',
    'ver_curso',
    'editar_curso',
    'eliminar_curso',
    'calificar_intento',
    'ver_alumnos'
  );

-- 7. Asignar permisos al rol ADMINISTRADOR (si existe)
INSERT IGNORE INTO roles_permisos (rol_id, permiso_id)
SELECT r.rol_id, p.permiso_id
FROM roles r
CROSS JOIN permisos p
WHERE r.nombre_rol = 'administrador';

-- 8. Asignar permisos básicos al rol ESTUDIANTE (si existe)
INSERT IGNORE INTO roles_permisos (rol_id, permiso_id)
SELECT r.rol_id, p.permiso_id
FROM roles r
CROSS JOIN permisos p
WHERE r.nombre_rol = 'estudiante'
  AND p.nombre IN ('ver_curso');

-- ============================================================
-- Verificación (ejecutar para revisar)
-- ============================================================
-- SELECT * FROM roles;
-- SELECT * FROM permisos;
-- SELECT * FROM roles_permisos;
-- SELECT * FROM usuarios_roles LIMIT 10;

-- ============================================================
-- Rollback (si es necesario revertir)
-- ============================================================
/*
-- Revertir cambios (usar con precaución)
DROP TABLE IF EXISTS usuarios_roles;
ALTER TABLE cursos DROP COLUMN IF EXISTS created_by;
ALTER TABLE cursos DROP COLUMN IF EXISTS updated_by;
DELETE FROM roles WHERE nombre_rol = 'instructor';
DELETE FROM permisos WHERE nombre IN (
  'gestionar_usuarios', 'gestionar_roles', 
  'ver_reportes', 'editar_cualquier_curso'
);
*/
