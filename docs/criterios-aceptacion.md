Criterios de Aceptación (Gherkin)
1. Registro e inicio de sesión de estudiantes
Feature: Registro e inicio de sesión de estudiantes

Scenario: Registro exitoso de estudiante
  Given que un usuario no registrado accede al formulario de registro
  When ingresa un email válido y una contraseña válida
  And confirma la contraseña
  Then el sistema crea una cuenta de estudiante
  And muestra un mensaje de confirmación

Scenario: Inicio de sesión exitoso
  Given que un estudiante registrado existe en la base de datos
  When ingresa su email y contraseña válidos en el formulario de login
  Then el sistema concede acceso al dashboard del estudiante


2. Avance secuencial en lecciones
Feature: Avance secuencial en lecciones

Scenario: Estudiante accede a la primera lección
  Given que el estudiante está inscrito en un curso
  When accede al curso desde su dashboard
  Then el sistema muestra la primera lección del primer módulo

Scenario: Estudiante intenta saltar a una lección siguiente
  Given que el estudiante no ha completado la lección actual
  When intenta acceder a una lección posterior
  Then el sistema bloquea el acceso
  And muestra un mensaje indicando que debe completar la lección previa


3. Retroalimentación obligatoria en lección
Feature: Retroalimentación en lecciones

Scenario: Estudiante completa retroalimentación
  Given que el estudiante finalizó el contenido de una lección
  When responde todas las preguntas de retroalimentación
  Then el sistema marca la lección como completada
  And habilita la siguiente lección


4. Cuestionario al finalizar módulo
Feature: Cuestionario de módulo

Scenario: Estudiante aprueba cuestionario de módulo
  Given que el estudiante completó todas las lecciones del módulo
  When responde el cuestionario y aprueba
  Then el sistema marca el módulo como completado
  And habilita el siguiente módulo


5. Certificación
Feature: Generación de certificado

Scenario: Estudiante completa todos los módulos del curso
  Given que el estudiante finalizó todos los módulos del curso
  When revisa su progreso en el dashboard
  Then el sistema genera un certificado en PDF
  And permite descargarlo desde la plataforma


6. Gestión de usuarios por administrador
Feature: Gestión de usuarios por administrador

Scenario: Administrador crea un nuevo instructor
  Given que el administrador está autenticado
  When completa el formulario de creación de usuario con rol "Instructor"
  Then el sistema registra al nuevo instructor
  And muestra el usuario en la lista de instructores


7. Métricas básicas
Feature: Reporte de métricas para administrador

Scenario: Visualizar métricas de estudiantes
  Given que el administrador está autenticado
  When accede al panel de métricas
  Then el sistema muestra número de estudiantes activos e inactivos
  And muestra la distribución por país
