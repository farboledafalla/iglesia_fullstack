-- 003_schema_courses_progress.sql
-- Esquema para cursos, módulos, lecciones, preguntas, respuestas de alumnos y progreso
-- Fecha: 2025-10-14

-- NOTA: Ajusta tipos, nombres y constraints a tu convención y a las tablas existentes.
-- Este script crea las tablas necesarias para soportar múltiples cursos, módulos, lecciones,
-- preguntas (con opciones), inscripciones/enrollments, intentos (attempts) y respuestas de alumnos.

START TRANSACTION;

-- Tabla de cursos
CREATE TABLE IF NOT EXISTS cursos (
  curso_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  estado ENUM('ENPROGRESO','COMPLETADO','ARCHIVADO') DEFAULT 'ENPROGRESO'
);

-- Tabla de módulos (pertenecen a un curso)s
CREATE TABLE IF NOT EXISTS modulos (
  modulo_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  curso_id BIGINT NOT NULL,
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT,
  orden INT DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (curso_id) REFERENCES cursos(curso_id) ON DELETE CASCADE
);

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
);

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
);

-- Opciones (para preguntas de selección múltiple / true-false)
CREATE TABLE IF NOT EXISTS opciones_pregunta (
  opcion_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  pregunta_id BIGINT NOT NULL,
  texto TEXT NOT NULL,
  es_correcta BOOLEAN DEFAULT FALSE,
  orden INT DEFAULT 0,
  FOREIGN KEY (pregunta_id) REFERENCES preguntas(pregunta_id) ON DELETE CASCADE
);

-- Tabla para inscripciones (enrollments)
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
);

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
);

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
);

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
);

-- Índices para consultas comunes
CREATE INDEX idx_leccion_modulo ON lecciones (modulo_id);
CREATE INDEX idx_pregunta_leccion ON preguntas (leccion_id);
CREATE INDEX idx_enrollment_alumno ON enrollments (alumno_id);
CREATE INDEX idx_intento_alumno ON leccion_intentos (alumno_id);

COMMIT;

-- FIN del script
