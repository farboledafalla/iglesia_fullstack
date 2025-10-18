-- 001_normalize_alumnos_usuarios.sql
-- Objetivo: normalizar la relación entre usuarios y alumnos
-- Fecha: 2025-10-10

-- INSTRUCCIONES IMPORTANTES:

-- 1) Antes de ejecutar: generar y reemplazar el valor de <BCRYPT_HASH_FOR_DEFAULT_PASS> por un hash bcrypt válido.
--    Ejemplo (en tu máquina):
--      node -e "const bcrypt=require('bcryptjs'); console.log(bcrypt.hashSync('123456', 10));"
--$2a$10$zvx9ZmaoI9BLfYsaZu3SKOxE.cMUS4GHIrL89Tci3jgoyIaUSGQ7O
--    Copia el valor resultante y pégalo en la instrucción INSERT abajo.

-- 2) Reemplaza <ESTUDIANTE_ROLE_ID> por el rol_id real que corresponda a 'estudiante'.
--    Puedes obtenerlo corriendo: SELECT rol_id FROM roles WHERE nombre_rol = 'estudiante';
+--------+
| rol_id |
+--------+
|      3 |
+--------+


-- 3) Ejecuta en entorno de mantenimiento (hacer backup y detener tráfico si aplica).
-- 4) El script crea tablas de respaldo (backup_usuarios, backup_alumnos) antes de modificar nada.
-- 5) Revisa los SELECT de verificación antes de proceder a eliminar columnas.

START TRANSACTION;

-- 0) Respaldos (tablas independientes)
DROP TABLE IF EXISTS backup_usuarios;
CREATE TABLE backup_usuarios AS SELECT * FROM usuarios;
--Records: 12  Duplicates: 0  Warnings: 0

DROP TABLE IF EXISTS backup_alumnos;
CREATE TABLE backup_alumnos AS SELECT * FROM alumnos;
--Records: 8  Duplicates: 0  Warnings: 0

-- 1) Obtener rol estudiante (alternativa: sustituir manualmente)
SELECT rol_id INTO @estudiante_role_id FROM roles WHERE nombre_rol = 'estudiante' LIMIT 1;
--Query OK, 1 row affected

-- Si prefieres, ejecuta la consulta anterior aparte y asigna manualmente @estudiante_role_id
-- SET @estudiante_role_id = <ESTUDIANTE_ROLE_ID>;

-- 2) (Opcional) Si no existe @estudiante_role_id, abortar
SELECT @estudiante_role_id;
+---------------------+
| @estudiante_role_id |
+---------------------+
|                   3 |
+---------------------+

-- 3) Insertar en usuarios los registros que vienen de alumnos pero no tienen usuario asociado por email
-- Reemplaza '<BCRYPT_HASH_FOR_DEFAULT_PASS>' con el hash generado localmente.
INSERT INTO usuarios (nombre, email, password_hash, pais_id, rol_id)
SELECT a.nombre, a.email, '$2a$10$zvx9ZmaoI9BLfYsaZu3SKOxE.cMUS4GHIrL89Tci3jgoyIaUSGQ7O', a.pais_id, @estudiante_role_id
FROM alumnos a
LEFT JOIN usuarios u ON u.email = a.email
WHERE u.usuario_id IS NULL;
--Records: 0  Duplicates: 0  Warnings: 0

-- 4) Enlazar alumnos a usuarios por email (solo donde usuario_id sea NULL)
UPDATE alumnos a
JOIN usuarios u ON u.email = a.email
SET a.usuario_id = u.usuario_id
WHERE a.usuario_id IS NULL;
--Rows matched: 0  Changed: 0  Warnings: 0

-- 5) Comprobaciones: revisar registros sin usuario_id
SELECT COUNT(*) AS sin_usuario_id FROM alumnos WHERE usuario_id IS NULL;
+----------------+
| sin_usuario_id |
+----------------+
|              0 |
+----------------+

SELECT COUNT(*) AS total_alumnos FROM alumnos;
+---------------+
| total_alumnos |
+---------------+
|             8 |
+---------------+


-- 6) Ver filas donde alumno y usuario no coinciden (por ejemplo emails duplicados)
SELECT a.alumno_id, a.email AS alumno_email, u.usuario_id AS usuario_id, u.email AS usuario_email
FROM alumnos a
LEFT JOIN usuarios u ON u.usuario_id = a.usuario_id
WHERE u.usuario_id IS NULL OR a.email <> u.email
LIMIT 100;
--Empty set

COMMIT;

-- 7) Una vez verificado manualmente que todos los alumnos tienen usuario_id correcto y que los datos
--    de usuarios son los que quieres usar como fuente de la verdad, puedes eliminar las columnas duplicadas
--    en la tabla 'alumnos'. Antes de hacerlo, revisa constraints/índices que dependan de ellas.

CREATE TABLE `alumnos` (
  `alumno_id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `pais_id` int(11) DEFAULT NULL,
  `fecha_registro` timestamp NULL DEFAULT current_timestamp(),
  `estado` enum('ACTIVO','INACTIVO') DEFAULT 'ACTIVO',
  `usuario_id` int(11) NOT NULL,
  `identificacion` int(15) NOT NULL,
  PRIMARY KEY (`alumno_id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `unique_usuario` (`usuario_id`),
  UNIQUE KEY `identificacion` (`identificacion`),
  KEY `fk_alumnos_paises` (`pais_id`),
  CONSTRAINT `fk_alumnos_paises` FOREIGN KEY (`pais_id`) REFERENCES `paises` (`pais_id`),
  CONSTRAINT `fk_alumnos_usuarios` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`usuario_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci

-- EJEMPLO: quitar índice/constraint (ajusta el nombre si tu FK/índice tiene otro nombre)
-- ALTER TABLE alumnos DROP FOREIGN KEY fk_alumnos_paises; -- si existe una FK específica a paises (por ejemplo)
-- ALTER TABLE alumnos DROP INDEX unique_email; -- si existiera

--Queries a ejecutar sobre la tabla alumnos para eliminar columnas duplicadas
--pais_id
alter table alumnos drop foreign key fk_alumnos_paises;
alter table alumnos drop key fk_alumnos_paises;
alter table alumnos drop column pais_id;

--email
alter table alumnos drop index email;
alter table alumnos drop column email;

--nombre
alter table alumnos drop column nombre;

--así quedaría la definición de la tabla alumnos
CREATE TABLE `alumnos` (
  `alumno_id` int(11) NOT NULL AUTO_INCREMENT,
  `telefono` varchar(20) DEFAULT NULL,
  `fecha_registro` timestamp NULL DEFAULT current_timestamp(),
  `estado` enum('ACTIVO','INACTIVO') DEFAULT 'ACTIVO',
  `usuario_id` int(11) NOT NULL,
  `identificacion` int(15) NOT NULL,
  PRIMARY KEY (`alumno_id`),
  UNIQUE KEY `unique_usuario` (`usuario_id`),
  UNIQUE KEY `identificacion` (`identificacion`),
  CONSTRAINT `fk_alumnos_usuarios` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`usuario_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci

--datos actuales en la tabla alumnos
select * from alumnos;
+-----------+------------+---------------------+----------+------------+----------------+
| alumno_id | telefono   | fecha_registro      | estado   | usuario_id | identificacion |
+-----------+------------+---------------------+----------+------------+----------------+
|         2 | 3208371159 | 2025-02-16 06:15:16 | ACTIVO   |          1 |      112223344 |
|         3 | 3208480575 | 2025-02-16 06:41:40 | ACTIVO   |          2 |      223334455 |
|         4 | 3334445566 | 2025-02-17 19:50:14 | INACTIVO |          3 |      334445566 |
|         5 | 3112223344 | 2025-02-17 19:54:26 | ACTIVO   |          4 |      445556677 |
|         6 | 3147236261 | 2025-10-09 11:38:06 | ACTIVO   |         11 |      245880661 |
|         8 | 3209998877 | 2025-10-09 18:37:05 | ACTIVO   |         13 |      998887766 |
|         9 | 3214445566 | 2025-10-09 19:42:07 | ACTIVO   |         14 |      887776655 |
|        10 | 3224449988 | 2025-10-09 21:51:18 | ACTIVO   |          7 |      551114433 |
+-----------+------------+---------------------+----------+------------+----------------+


-- 8) Eliminar columnas duplicadas (ejecutar SOLO cuando estés seguro)
-- ALTER TABLE alumnos
--   DROP COLUMN nombre,
--   DROP COLUMN email,
--   DROP COLUMN pais_id;

-- 9) (Rollback manual) Si algo falla y quieres restaurar desde backup:
-- TRUNCATE TABLE alumnos; INSERT INTO alumnos SELECT * FROM backup_alumnos;
-- TRUNCATE TABLE usuarios; INSERT INTO usuarios SELECT * FROM backup_usuarios;

-- END OF SCRIPT
