Migración: Normalizar 'alumnos' y 'usuarios'
=========================================

Objetivo
--------
Mover la verdad sobre datos personales (nombre, email, país) a la tabla `usuarios` y eliminar las columnas duplicadas en `alumnos` (`nombre`, `email`, `pais_id`). Dejar `alumnos.usuario_id` como referencia obligatoria.

Contenido de este directorio
----------------------------
- `001_normalize_alumnos_usuarios.sql`: script principal que crea respaldos, inserta usuarios faltantes (basado en email), enlaza `alumnos.usuario_id` y contiene instrucciones para eliminar columnas duplicadas de forma segura.

Pasos detallados y recomendaciones (ejecución segura)
----------------------------------------------------
1) Preparación
   - Haz una copia de seguridad completa de la base de datos (mysqldump o herramienta equivalente):

     ```powershell
     # Ejecutar en PowerShell (Windows)
     mysqldump -u <db_user> -p<db_pass> --host=<host> --databases <db_name> > C:\backups\iglesia_backup_$(Get-Date -Format yyyyMMdd_HHmmss).sql
     ```

   - Asegúrate de tener acceso a la consola de MySQL y privilegios para crear tablas, alterar tablas y realizar INSERT/UPDATE.
   - Pon la aplicación en modo mantenimiento o pausa tráfico si es posible.

2) Preparar valores dinámicos
   - Generar un hash bcrypt para la contraseña por defecto que se asignará a los usuarios creados a partir de registros en `alumnos` (solo si no hay usuario con el email).
     Ejemplo con Node.js (desde el directorio del proyecto o con Node instalado):

     ```powershell
     node -e "const bcrypt=require('bcryptjs'); console.log(bcrypt.hashSync('cambiar123', 10));"
     ```

     Copia el hash generado y reemplaza `<BCRYPT_HASH_FOR_DEFAULT_PASS>` en `001_normalize_alumnos_usuarios.sql`.

   - Determina el `rol_id` correspondiente a estudiantes (ejecuta):

     ```sql
     SELECT rol_id, nombre_rol FROM roles WHERE nombre_rol LIKE '%estudiante%';
     ```

     Si prefieres, puedes reemplazar manualmente `@estudiante_role_id` con ese valor en el script antes de ejecutarlo.

3) Revisión del script
   - Abre `001_normalize_alumnos_usuarios.sql` y revisa las secciones comentadas.
   - Asegúrate de que los nombres de FK/índices en tu DB coincidan con los que podrías necesitar eliminar antes de dropear columnas (la sección de DROP está comentada y debe ajustarse a tu esquema).

4) Ejecutar en un entorno de staging primero
   - Nunca ejecutes directamente en producción sin probar en staging o copia de la BD.
   - Ejecuta el script en staging y valida:
     - Todos los `alumnos` han obtenido `usuario_id` (consulta: `SELECT COUNT(*) FROM alumnos WHERE usuario_id IS NULL;` debe ser 0 o los resultados esperados).
     - Verifica que los nuevos `usuarios` creados tengan datos correctos (nombre, email, pais_id, rol_id).

5) Verificaciones posteriores al script
   - Revisar filas con inconsistencias:

     ```sql
     SELECT a.alumno_id, a.usuario_id, a.nombre AS alumno_nombre, u.nombre AS usuario_nombre, a.email AS alumno_email, u.email AS usuario_email
     FROM alumnos a
     LEFT JOIN usuarios u ON u.usuario_id = a.usuario_id
     WHERE a.usuario_id IS NULL OR a.email <> u.email
     LIMIT 200;
     ```

   - Validar integridad referencial y crear FK si lo deseas:

     ```sql
     ALTER TABLE alumnos
     ADD CONSTRAINT fk_alumnos_usuarios FOREIGN KEY (usuario_id) REFERENCES usuarios(usuario_id) ON DELETE SET NULL;
     ```

6) Eliminar columnas duplicadas (solo si todo está verificado)
   - Ajusta la siguiente instrucción según constraints/índices y ejecuta solo cuando estés seguro:

     ```sql
     ALTER TABLE alumnos
       DROP COLUMN nombre,
       DROP COLUMN email,
       DROP COLUMN pais_id;
     ```

   - Si la columna `pais_id` tenía FK hacia `paises`, elimina esa FK primero con su nombre real.

7) Cambios en el código
   - Backend: actualizar los controladores para leer `nombre`, `email`, `pais` desde `usuarios` haciendo JOIN cuando recopiles datos de alumnos.
   - Frontend: `AlumnoForm.jsx` debe dejar de enviar `nombre/email/pais_id` al crear/editar; usar `usuario_id` para mostrar esos datos desde el objeto `usuario`.

8) Rollback
   - Si algo sale mal y quieres restaurar desde los backups creados en el script:

     ```sql
     TRUNCATE TABLE alumnos; INSERT INTO alumnos SELECT * FROM backup_alumnos;
     TRUNCATE TABLE usuarios; INSERT INTO usuarios SELECT * FROM backup_usuarios;
     ```

   - Alternativamente restaura el dump de mysqldump.

9) Post-migración
   - Ejecuta tests funcionales / UI flows: registro, login, crear alumno, editar alumno, listar alumnos.
   - Monitorea logs y performance.

Contacto y notas
----------------
- Si quieres, puedo generar un script adicional que haga un escaneo automático de controladores en `backend/src/controllers` para listar queries que toquen `alumnos.nombre`, `alumnos.email` o `alumnos.pais_id`, para que sea más fácil actualizar el backend.

-- FIN --
