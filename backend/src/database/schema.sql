DROP DATABASE IF EXISTS iglesia;
CREATE DATABASE iglesia;
USE iglesia;

--Definicion de tablas desde la base de datos

CREATE TABLE `roles` (
  `rol_id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre_rol` varchar(50) NOT NULL,
  `fecha_registro` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`rol_id`),
  UNIQUE KEY `nombre_rol` (`nombre_rol`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `continentes` (
  `continente_id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre_continente` varchar(100) NOT NULL,
  `fecha_registro` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`continente_id`),
  UNIQUE KEY `nombre_continente` (`nombre_continente`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

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

CREATE TABLE `instructores` (
  `instructor_id` int(11) NOT NULL AUTO_INCREMENT,
  `usuario_id` int(11) NOT NULL,
  `biografia` text DEFAULT NULL,
  `fecha_registro` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`instructor_id`),
  KEY `usuario_id` (`usuario_id`),
  CONSTRAINT `instructores_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`usuario_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `alumnos` (
  `alumno_id` int(11) NOT NULL AUTO_INCREMENT,
  `usuario_id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `telefono` varchar(20),
  `pais_id` int(11) NOT NULL,
  `estado` enum('ACTIVO','INACTIVO') DEFAULT 'ACTIVO',
  `fecha_registro` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`alumno_id`),
  KEY `fk_alumnos_usuarios` (`usuario_id`),
  KEY `fk_alumnos_paises` (`pais_id`),
  CONSTRAINT `fk_alumnos_paises` FOREIGN KEY (`pais_id`) REFERENCES `paises` (`pais_id`),
  CONSTRAINT `fk_alumnos_usuarios` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`usuario_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  UNIQUE KEY `unique_usuario` (`usuario_id`),
  UNIQUE KEY `unique_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


CREATE TABLE `modulos` (
  `modulo_id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) DEFAULT NULL,
  `descripcion` text DEFAULT NULL,
  `instructor_id` int(11) NOT NULL,
  `duracion` int(11) DEFAULT NULL COMMENT 'Duracion en horas',
  `fecha_inicio` date DEFAULT NULL,
  `fecha_fin` date DEFAULT NULL,
  `estado` enum('ACTIVO','INACTIVO') DEFAULT 'ACTIVO',
  `fecha_creacion` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`modulo_id`),
  KEY `instructor_id` (`instructor_id`),
  CONSTRAINT `modulos_ibfk_1` FOREIGN KEY (`instructor_id`) REFERENCES `instructores` (`instructor_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `lecciones` (
  `leccion_id` int(11) NOT NULL AUTO_INCREMENT,
  `modulo_id` int(11) NOT NULL,
  `titulo_leccion` varchar(100) NOT NULL,
  `contenido` text NOT NULL,
  `estado` enum('ACTIVO','INACTIVO') DEFAULT 'ACTIVO',
  `orden` int(11) NOT NULL,
  `fecha_creacion` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`leccion_id`),
  KEY `modulo_id` (`modulo_id`),
  CONSTRAINT `lecciones_ibfk_1` FOREIGN KEY (`modulo_id`) REFERENCES `modulos` (`modulo_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

/*
show tables;
+-------------------+
| Tables_in_iglesia |
+-------------------+
| administradores   |
| alumnos           |
| continentes       |
| instructores      |
| lecciones         |
| modulos           |
| paises            |
| roles             |
| usuarios          |
+-------------------+
*/

CREATE TABLE preguntas (
   pregunta_id INT PRIMARY KEY AUTO_INCREMENT,
   leccion_id INT NOT NULL,
   contenido_previo TEXT NOT NULL,
   pregunta TEXT NOT NULL,
   orden INT NOT NULL,
   estado ENUM('ACTIVO', 'INACTIVO') DEFAULT 'ACTIVO',
   fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
   FOREIGN KEY (leccion_id) REFERENCES lecciones(leccion_id)
);

CREATE TABLE respuestas_alumno (
   respuesta_id INT PRIMARY KEY AUTO_INCREMENT,
   alumno_id INT NOT NULL,
   pregunta_id INT NOT NULL,
   texto_respuesta TEXT NOT NULL,
   estado ENUM('PENDIENTE_REVISAR', 'APROBADA', 'RECHAZADA') DEFAULT 'PENDIENTE_REVISAR',
   comentario_instructor TEXT,
   fecha_respuesta TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
   fecha_revision TIMESTAMP NULL,
   FOREIGN KEY (alumno_id) REFERENCES alumnos(alumno_id),
   FOREIGN KEY (pregunta_id) REFERENCES preguntas(pregunta_id),
   UNIQUE KEY unique_alumno_pregunta (alumno_id, pregunta_id)
);

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
CREATE INDEX idx_progreso_modulos_alumno ON progreso_modulos(alumno_id);

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
