API: Endpoints sugeridos para inscripciones y progreso
====================================================

Este documento describe endpoints REST sugeridos para manejar:
- Gestión de cursos, módulos y lecciones
- Inscripciones (enrollments)
- Intentos de lección (attempts)
- Envío y corrección de respuestas
- Cálculo y actualización de progreso

Autenticación
--------------
- Todos los endpoints que afectan datos de alumnos deben requerir Authorization Bearer <JWT>.
- El middleware de auth debe verificar `usuarios.account_status === 'ACTIVE'`.

Convenciones
-----------
- `alumno_id` proviene de la relación `alumnos.usuario_id -> usuarios.usuario_id`.
- Todas las respuestas siguen el formato: { ok: boolean, data: {...}, msg?: string }

Endpoints fundamentales (resumen)
--------------------------------
1) Inscripciones

- POST /api/enrollments
  - Crea una inscripción (inscribe un alumno en un curso)
  - Body: { alumno_id, curso_id }
  - Flow:
    - Verificar que `usuarios.account_status === 'ACTIVE'`.
    - INSERT INTO enrollments (alumno_id, curso_id, status='ENROLLED')

- GET /api/enrollments?alumno_id=:alumno_id
  - Lista inscripciones de un alumno

- PATCH /api/enrollments/:enrollment_id
  - Actualiza estado (SUSPENDED, DROPPED, COMPLETED) y completed_at
  - Body: { status }

2) Intentos de lección (attempts)

- POST /api/lessons/:leccion_id/attempts
  - Inicia un nuevo intento para la lección
  - Body: { alumno_id }
  - Crea leccion_attempts con estado 'IN_PROGRESS'
  - Devuelve { attempt_id }

- GET /api/attempts/:attempt_id
  - Obtiene detalle del intento y preguntas asociadas (pregunta_attempts)

- POST /api/attempts/:attempt_id/submit
  - Marca el intento como SUBMITTED
  - Body: opcional { answers: [{ pregunta_id, opcion_id?, respuesta_texto? }] }
  - Inserta/actualiza pregunta_attempts y dispara corrección automática donde aplique
  - Calcula score y marca attempt estado 'GRADED' (o dejar para grading asíncrono)

3) Respuestas y corrección

- POST /api/attempts/:attempt_id/answers
  - Añade respuestas inmediatas por pregunta
  - Body: { pregunta_id, opcion_id?, respuesta_texto? }
  - Inserta en pregunta_attempts y en respuestas_alumno (histórico)
  - Si pregunta tiene opciones y `es_correcta = true` marcar `es_correcta=true` y asignar puntos

- GET /api/attempts/:attempt_id/grade
  - Retorna el puntaje calculado por attempt

4) Cálculo de progreso y actualización de enrollments

- Cuando un attempt se califica (GRADES), recomputar el progreso del alumno en ese curso:
  - opción simple (por lección): el progreso en curso = (numero_lecciones_completadas / total_lecciones) * 100
  - o por puntos: (puntos_obtenidos / puntos_totales) * 100

- Endpoint sugerido (invocado internamente por backend):
  - POST /api/enrollments/:enrollment_id/recompute-progress
    - Recalcula progress_percent y sets completed_at si >=100% y status -> COMPLETED

5) Endpoints administrativos

- GET /api/courses (list, con módulos y lecciones embebidas)
- POST /api/courses, /api/modules, /api/lessons, /api/questions
- PATCH /api/questions/:id (para marcar opciones correctas, puntos, etc.)

Esquema de flujo (simplificado)
-------------------------------
1. Usuario (activo) inicia sesión.
2. Usuario es un alumno; se crea/obtiene su `alumno_id`.
3. Al inscribirse en curso: POST /api/enrollments -> ENROLLED.
4. Al iniciar lección: POST /api/lessons/:leccion_id/attempts -> attempt_id.
5. El alumno envía respuestas (POST /api/attempts/:id/answers) o envía todas al final (submit).
6. Backend corrige automáticamente preguntas de elección múltiple y calcula score.
7. Se actualiza attempt.score y attempt.estado = GRADED.
8. Recompute-progress actualiza `enrollments.progress_percent` y marca completado si aplica.

Notas de implementación y rendimiento
-------------------------------------
- Para corrección automática, solo aplicar a preguntas con `tipo` que permitan auto-evaluación.
- Para preguntas abiertas (SHORT_ANSWER/LONG_ANSWER), desarrollar flujo de revisión manual o NLP: guardar `estado='PENDING_REVIEW'`.
- Mantener índices en columnas usadas frecuentemente (alumno_id, leccion_id, curso_id).
- Evitar transacciones largas: crear attempt y respuestas en una transacción corta; la corrección y recompute de progreso pueden ser procesos asíncronos si son costosos.

Ejemplo de pseudocódigo para 'submit' y 'grade' (backend)
-------------------------------------------------------
1) En API /attempts/:id/submit:
  - marcar attempt.submitted_at = NOW(); estado = 'SUBMITTED'
  - por cada pregunta en attempt:
    - si pregunta.tipo soporta auto-eval:
      - comparar opcion_id con opciones_pregunta.es_correcta o aplicar regla
      - asignar puntos_obtenidos
    - si no, dejar es_correcta = NULL y puntos_obtenidos = 0 (pendiente)
  - calcular score total y actualizar attempt.score y estado='GRADED' (si no hay preguntas pendientes)
  - llamar a recompute-progress(enrollment_id)

Front-end: UX y consideraciones
------------------------------
- Mostrar claramente el estado de inscripción por curso (Enrollments), y botón para iniciar lecciones.
- Durante intento: UI de preguntas con autosave parcial (guardar respuestas en local o en server) para tolerancia a desconexiones.
- Mostrar feedback inmediato para preguntas de opción múltiple.
- Mostrar panel de progreso por curso (barra con percent y lecciones completadas)

Fin del README
