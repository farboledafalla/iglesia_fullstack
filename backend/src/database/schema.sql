DROP DATABASE IF EXISTS iglesia;
CREATE DATABASE iglesia;
USE iglesia;

-- Tabla roles
CREATE TABLE `roles` (
  `rol_id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre_rol` varchar(50) NOT NULL,
  `descripcion` varchar(100) DEFAULT NULL,
  `fecha_registro` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`rol_id`),
  UNIQUE KEY `nombre_rol` (`nombre_rol`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla continentes
CREATE TABLE `continentes` (
  `continente_id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre_continente` varchar(100) NOT NULL,
  `fecha_registro` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`continente_id`),
  UNIQUE KEY `nombre_continente` (`nombre_continente`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla paises
CREATE TABLE `paises` (
  `pais_id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre_pais` varchar(100) NOT NULL,
  `continente_id` int(11) NOT NULL,
  `fecha_registro` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`pais_id`),
  UNIQUE KEY `unique_pais_continente` (`nombre_pais`,`continente_id`),
  KEY `continente_id` (`continente_id`),
  CONSTRAINT `paises_ibfk_1` FOREIGN KEY (`continente_id`) REFERENCES `continentes` (`continente_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla usuarios
CREATE TABLE `usuarios` (
  `usuario_id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `pais_id` int(11) NOT NULL,
  `rol_id` int(11) NOT NULL,
  `estado` enum('ACTIVO','INACTIVO') DEFAULT 'ACTIVO',
  `fecha_registro` timestamp NULL DEFAULT current_timestamp(),
  `reset_token` varchar(255) DEFAULT NULL,
  `reset_token_expires` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`usuario_id`),
  UNIQUE KEY `email` (`email`),
  KEY `pais_id` (`pais_id`),
  KEY `rol_id` (`rol_id`),
  CONSTRAINT `usuarios_ibfk_1` FOREIGN KEY (`pais_id`) REFERENCES `paises` (`pais_id`),
  CONSTRAINT `usuarios_ibfk_2` FOREIGN KEY (`rol_id`) REFERENCES `roles` (`rol_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


--Tabla alumnos
CREATE TABLE `alumnos` (
  `alumno_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `telefono` varchar(20) DEFAULT NULL,
  `fecha_registro` timestamp NULL DEFAULT current_timestamp(),
  `usuario_id` int(11) NOT NULL,
  `identificacion` int(15) NOT NULL,
  PRIMARY KEY (`alumno_id`),
  UNIQUE KEY `unique_usuario` (`usuario_id`),
  UNIQUE KEY `identificacion` (`identificacion`),
  CONSTRAINT `fk_alumnos_usuarios` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`usuario_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB CHARSET=utf8mb4;

-- Tabla de cursos
CREATE TABLE IF NOT EXISTS cursos (
  curso_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  estado ENUM('ENPROGRESO','COMPLETADO','ARCHIVADO') DEFAULT 'ENPROGRESO'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--ejemplos de cursos
INSERT INTO cursos (titulo, descripcion, estado) VALUES
  ('Libro de Genesis', 'Conoce el libro de Genesis.', 'ENPROGRESO'),
  ('Libro de Exoso', 'Conoce el libro de Exoso.', 'ENPROGRESO'),
  ('Libro de Deuteronomios', 'Conoce el libro de Deuteronomios.', 'ENPROGRESO');

-- Tabla de permisos
/* CREATE TABLE IF NOT EXISTS permisos (
  permiso_id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) UNIQUE NOT NULL,
  descripcion TEXT
); */

CREATE TABLE permisos (
    permiso_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    path VARCHAR(100) NOT NULL,
    label VARCHAR(100) NOT NULL,
    icon VARCHAR(50),
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- Ejemplos de permisos
INSERT INTO permisos (name, path,label,icon) VALUES
  ('admin', 'admin', 'Dashboard','home'),
  ('usuarios', 'usuarios', 'Usuarios','users'),
  ('alumnos', 'alumnos', 'Alumnos','graduation'),
  ('modulos', 'modulos', 'Modulos','list'),
  ('lecciones', 'lecciones', 'Lecciones','book'),
  ('preguntas', 'preguntas', 'Preguntas','academic'),
  ('progreso', 'progreso', 'Progreso','chart'),
  ('student', 'student', 'Student','home'),
  ('perfil', 'perfil', 'Perfil','user');

-- Asociar permisos a 'instructor' (obtén role_id del INSERT anterior)
-- Supongamos role_id = 3
INSERT INTO roles_permisos (rol_id, permiso_id)
SELECT r.rol_id, p.permiso_id
FROM roles r JOIN permisos p ON p.nombre IN ('crear_curso','ver_curso','editar_curso','eliminar_curso','calificar_intento','ver_alumnos')
WHERE r.nombre_rol='instructor'
ORDER BY p.permiso_id;
  
-- Tabla de relación roles-permisos
CREATE TABLE IF NOT EXISTS roles_permisos (
  rol_id INT NOT NULL,
  permiso_id INT NOT NULL,
  PRIMARY KEY (rol_id, permiso_id),
  FOREIGN KEY (rol_id) REFERENCES roles(rol_id),
  FOREIGN KEY (permiso_id) REFERENCES permisos(permiso_id)
);

INSERT INTO roles_permisos(rol_id,permiso_id) VALUES
(1,1),
(1,2),
(1,3),
(1,4),
(1,5),
(1,6),
(1,7);


CREATE TABLE usuarios_roles (
    usuario_id INT,
    rol_id INT,
    PRIMARY KEY (usuario_id, rol_id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(usuario_id),
    FOREIGN KEY (rol_id) REFERENCES roles(rol_id)
);


INSERT INTO usuarios_roles(usuario_id,rol_id) VALUES
(4,1);




-- Tabla de instructores por curso
 CREATE TABLE IF NOT EXISTS cursos_instructores (
  curso_id BIGINT NOT NULL,  -- Cambiado a BIGINT para coincidir
  usuario_id INT(11) NOT NULL,  -- Cambiado a INT(11) para coincidir
  rol_en_curso ENUM('instructor','asistente') DEFAULT 'instructor',
  assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (curso_id, usuario_id),
  FOREIGN KEY (curso_id) REFERENCES cursos(curso_id) ON DELETE CASCADE,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(usuario_id) ON DELETE CASCADE
);

-- Tabla de módulos (pertenecen a un curso)
CREATE TABLE IF NOT EXISTS modulos (
  modulo_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  curso_id BIGINT NOT NULL,
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT,
  orden INT DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (curso_id) REFERENCES cursos(curso_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla de lecciones (pertenecen a un módulo)
CREATE TABLE IF NOT EXISTS lecciones (
  leccion_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  modulo_id BIGINT NOT NULL,
  titulo VARCHAR(255) NOT NULL,
  contenido TEXT,
  orden INT DEFAULT 0,
  duracion INT DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (modulo_id) REFERENCES modulos(modulo_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla de preguntas (por lección)
CREATE TABLE IF NOT EXISTS preguntas (
  pregunta_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  leccion_id BIGINT NOT NULL,
  tipo ENUM('MULTIPLE_CHOICE','TRUE_FALSE','SHORT_ANSWER','LONG_ANSWER') DEFAULT 'MULTIPLE_CHOICE',
  enunciado TEXT NOT NULL,
  puntos INT DEFAULT 1,
  orden INT DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (leccion_id) REFERENCES lecciones(leccion_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Opciones (para preguntas de selección múltiple / true-false)
CREATE TABLE IF NOT EXISTS opciones_pregunta (
  opcion_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  pregunta_id BIGINT NOT NULL,
  texto TEXT NOT NULL,
  es_correcta BOOLEAN DEFAULT FALSE,
  orden INT DEFAULT 0,
  FOREIGN KEY (pregunta_id) REFERENCES preguntas(pregunta_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla para inscripciones (inscripciones)
-- Relaciona alumno (alumno_id) con curso (curso_id) y guarda estado por curso
CREATE TABLE IF NOT EXISTS inscripciones (
  inscripcion_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  alumno_id BIGINT NOT NULL,
  curso_id BIGINT NOT NULL,
  estado ENUM('INSCRITA','SUSPENDIDA','COMPLETADA','BORRADA') DEFAULT 'INSCRITA',
  porcentaje_progreso DECIMAL(5,2) DEFAULT 0.00,
  started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_alumno_curso (alumno_id, curso_id),
  FOREIGN KEY (alumno_id) REFERENCES alumnos(alumno_id) ON DELETE CASCADE,
  FOREIGN KEY (curso_id) REFERENCES cursos(curso_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla para intentos de lección (por alumno y lección) -> agrupa respuestas por intento
CREATE TABLE IF NOT EXISTS leccion_intentos (
  intento_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  alumno_id BIGINT NOT NULL,
  leccion_id BIGINT NOT NULL,
  estado ENUM('EN_PROGRESO','ENVIADA','CALIFICADA') DEFAULT 'EN_PROGRESO',
  score DECIMAL(6,2) DEFAULT 0.00,
  started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  submitted_at DATETIME NULL,
  graded_at DATETIME NULL,
  duration_seconds INT DEFAULT 0,
  FOREIGN KEY (alumno_id) REFERENCES alumnos(alumno_id) ON DELETE CASCADE,
  FOREIGN KEY (leccion_id) REFERENCES lecciones(leccion_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Respuestas por pregunta dentro de un intento de lección
CREATE TABLE IF NOT EXISTS pregunta_intentos (
  pregunta_intento_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  intento_id BIGINT NOT NULL,
  pregunta_id BIGINT NOT NULL,
  respuesta_texto TEXT,
  opcion_id BIGINT NULL, -- si aplicó
  es_correcta BOOLEAN NULL,
  puntos_obtenidos DECIMAL(6,2) DEFAULT 0.00,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (intento_id) REFERENCES leccion_intentos(intento_id) ON DELETE CASCADE,
  FOREIGN KEY (pregunta_id) REFERENCES preguntas(pregunta_id) ON DELETE CASCADE,
  FOREIGN KEY (opcion_id) REFERENCES opciones_pregunta(opcion_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla para respuestas agregadas (por si quieres historial simplificado)
CREATE TABLE IF NOT EXISTS respuestas_alumno (
  respuesta_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  alumno_id BIGINT NOT NULL,
  pregunta_id BIGINT NOT NULL,
  intento_id BIGINT NULL,
  respuesta_texto TEXT,
  opcion_id BIGINT NULL,
  es_correcta BOOLEAN NULL,
  retroalimentacion TEXT,
  puntos_obtenidos DECIMAL(6,2) DEFAULT 0.00,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (alumno_id) REFERENCES alumnos(alumno_id) ON DELETE CASCADE,
  FOREIGN KEY (pregunta_id) REFERENCES preguntas(pregunta_id) ON DELETE CASCADE,
  FOREIGN KEY (intento_id) REFERENCES leccion_intentos(intento_id) ON DELETE SET NULL,
  FOREIGN KEY (opcion_id) REFERENCES opciones_pregunta(opcion_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Índices para consultas comunes
CREATE INDEX idx_leccion_modulo ON lecciones (modulo_id);
CREATE INDEX idx_pregunta_leccion ON preguntas (leccion_id);
CREATE INDEX idx_enrollment_alumno ON enrollments (alumno_id);
CREATE INDEX idx_intento_alumno ON leccion_intentos (alumno_id);


--Tablas creadas hasta ahora
show tables;
+-------------------+
| Tables_in_iglesia |
+-------------------+
| alumnos           |
| continentes       |
| cursos            |
| inscripciones     |
| leccion_intentos  |
| lecciones         |
| modulos           |
| opciones_pregunta |
| paises            |
| pregunta_intentos |
| preguntas         |
| respuestas_alumno |
| roles             |
| usuarios          |
+-------------------+
14 rows

/*
CREATE TABLE progreso_lecciones (
   progreso_leccion_id INT PRIMARY KEY AUTO_INCREMENT,
   alumno_id INT NOT NULL,
   leccion_id INT NOT NULL,
   ultima_pregunta_respondida INT,
   total_preguntas_respondidas INT DEFAULT 0,
   total_preguntas INT NOT NULL,
   estado ENUM('EN_PROGRESO', 'COMPLETADA') DEFAULT 'EN_PROGRESO',
   fecha_inicio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
   fecha_completado TIMESTAMP NULL,
   FOREIGN KEY (alumno_id) REFERENCES alumnos(alumno_id),
   FOREIGN KEY (leccion_id) REFERENCES lecciones(leccion_id),
   FOREIGN KEY (ultima_pregunta_respondida) REFERENCES preguntas(pregunta_id),
   UNIQUE KEY unique_alumno_leccion (alumno_id, leccion_id)
);

CREATE TABLE progreso_modulos (
   progreso_modulo_id INT PRIMARY KEY AUTO_INCREMENT,
   alumno_id INT NOT NULL,
   modulo_id INT NOT NULL,
   lecciones_completadas INT DEFAULT 0,
   total_lecciones INT NOT NULL,
   estado ENUM('NO_INICIADO', 'EN_PROGRESO', 'COMPLETADO') DEFAULT 'NO_INICIADO',
   fecha_inicio TIMESTAMP NULL,
   fecha_completado TIMESTAMP NULL,
   FOREIGN KEY (alumno_id) REFERENCES alumnos(alumno_id),
   FOREIGN KEY (modulo_id) REFERENCES modulos(modulo_id),
   UNIQUE KEY unique_alumno_modulo (alumno_id, modulo_id)
);

CREATE INDEX idx_preguntas_leccion ON preguntas(leccion_id);
CREATE INDEX idx_progreso_alumno ON progreso_lecciones(alumno_id);
CREATE INDEX idx_respuestas_alumno ON respuestas_alumno(alumno_id);
CREATE INDEX idx_progreso_modulos_alumno ON progreso_modulos(alumno_id);*/

/*
show tables;
+--------------------+
| Tables_in_iglesia  |
+--------------------+
| administradores    |
| alumnos            |
| continentes        |
| instructores       |
| lecciones          |
| modulos            |
| paises             |
| preguntas          |
| progreso_lecciones |
| progreso_modulos   |
| respuestas_alumno  |
| roles              |
| usuarios           |
+--------------------+
*/
