-- 001_normalize_alumnos_usuarios.sql
-- Objetivo: normalizar la relación entre usuarios y alumnos
-- Fecha: 2025-10-10
-- INSTRUCCIONES IMPORTANTES:
-- 1) Antes de ejecutar: generar y reemplazar el valor de <BCRYPT_HASH_FOR_DEFAULT_PASS> por un hash bcrypt válido.
--    Ejemplo (en tu máquina):
--      node -e "const bcrypt=require('bcryptjs'); console.log(bcrypt.hashSync('123456', 10));"
--    Copia el valor resultante y pégalo en la instrucción INSERT abajo.
-- 2) Reemplaza <ESTUDIANTE_ROLE_ID> por el rol_id real que corresponda a 'estudiante'.
--    Puedes obtenerlo corriendo: SELECT rol_id FROM roles WHERE nombre_rol = 'estudiante';
-- 3) Ejecuta en entorno de mantenimiento (hacer backup y detener tráfico si aplica).
-- 4) El script crea tablas de respaldo (backup_usuarios, backup_alumnos) antes de modificar nada.
-- 5) Revisa los SELECT de verificación antes de proceder a eliminar columnas.

START TRANSACTION;

-- 0) Respaldos (tablas independientes)
DROP TABLE IF EXISTS backup_usuarios;
CREATE TABLE backup_usuarios AS SELECT * FROM usuarios;

DROP TABLE IF EXISTS backup_alumnos;
CREATE TABLE backup_alumnos AS SELECT * FROM alumnos;

-- 1) Obtener rol estudiante (alternativa: sustituir manualmente)
SELECT rol_id INTO @estudiante_role_id FROM roles WHERE nombre_rol = 'estudiante' LIMIT 1;
-- Si prefieres, ejecuta la consulta anterior aparte y asigna manualmente @estudiante_role_id
-- SET @estudiante_role_id = <ESTUDIANTE_ROLE_ID>;

-- 2) (Opcional) Si no existe @estudiante_role_id, abortar
SELECT @estudiante_role_id;

-- 3) Insertar en usuarios los registros que vienen de alumnos pero no tienen usuario asociado por email
-- Reemplaza '<BCRYPT_HASH_FOR_DEFAULT_PASS>' con el hash generado localmente.
INSERT INTO usuarios (nombre, email, password_hash, pais_id, rol_id)
SELECT a.nombre, a.email, '<BCRYPT_HASH_FOR_DEFAULT_PASS>', a.pais_id, @estudiante_role_id
FROM alumnos a
LEFT JOIN usuarios u ON u.email = a.email
WHERE u.usuario_id IS NULL;

-- 4) Enlazar alumnos a usuarios por email (solo donde usuario_id sea NULL)
UPDATE alumnos a
JOIN usuarios u ON u.email = a.email
SET a.usuario_id = u.usuario_id
WHERE a.usuario_id IS NULL;

-- 5) Comprobaciones: revisar registros sin usuario_id
SELECT COUNT(*) AS sin_usuario_id FROM alumnos WHERE usuario_id IS NULL;
SELECT COUNT(*) AS total_alumnos FROM alumnos;

-- 6) Ver filas donde alumno y usuario no coinciden (por ejemplo emails duplicados)
SELECT a.alumno_id, a.email AS alumno_email, u.usuario_id AS usuario_id, u.email AS usuario_email
FROM alumnos a
LEFT JOIN usuarios u ON u.usuario_id = a.usuario_id
WHERE u.usuario_id IS NULL OR a.email <> u.email
LIMIT 100;

COMMIT;

-- 7) Una vez verificado manualmente que todos los alumnos tienen usuario_id correcto y que los datos
--    de usuarios son los que quieres usar como fuente de la verdad, puedes eliminar las columnas duplicadas
--    en la tabla 'alumnos'. Antes de hacerlo, revisa constraints/índices que dependan de ellas.

-- EJEMPLO: quitar índice/constraint (ajusta el nombre si tu FK/índice tiene otro nombre)
-- ALTER TABLE alumnos DROP FOREIGN KEY fk_alumnos_paises; -- si existe una FK específica a paises (por ejemplo)
-- ALTER TABLE alumnos DROP INDEX unique_email; -- si existiera

-- 8) Eliminar columnas duplicadas (ejecutar SOLO cuando estés seguro)
-- ALTER TABLE alumnos
--   DROP COLUMN nombre,
--   DROP COLUMN email,
--   DROP COLUMN pais_id;

-- 9) (Rollback manual) Si algo falla y quieres restaurar desde backup:
-- TRUNCATE TABLE alumnos; INSERT INTO alumnos SELECT * FROM backup_alumnos;
-- TRUNCATE TABLE usuarios; INSERT INTO usuarios SELECT * FROM backup_usuarios;

-- END OF SCRIPT
