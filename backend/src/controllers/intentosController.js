const pool = require('../config/database');

// Iniciar intento de lección
exports.startAttempt = async (req, res) => {
  const leccion_id = req.params.leccion_id;
  const { alumno_id } = req.body;
  try {
    const [rows] = await pool.query('INSERT INTO leccion_intentos (alumno_id, leccion_id) VALUES (?, ?)', [alumno_id, leccion_id]);
    const [attempt] = await pool.query('SELECT * FROM leccion_intentos WHERE intento_id = ?', [rows.insertId]);
    res.json({ ok: true, data: attempt[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, msg: 'Error iniciando intento' });
  }
};

// Obtener intento
exports.getAttempt = async (req, res) => {
  const id = req.params.attempt_id;
  try {
    const [rows] = await pool.query('SELECT * FROM leccion_intentos WHERE intento_id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ ok: false, msg: 'Intento no encontrado' });
    const attempt = rows[0];
    const [answers] = await pool.query('SELECT pa.*, p.enunciado FROM pregunta_intentos pa JOIN preguntas p ON p.pregunta_id = pa.pregunta_id WHERE pa.intento_id = ?', [id]);
    res.json({ ok: true, data: { attempt, answers } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, msg: 'Error obteniendo intento' });
  }
};

// Submit intento (submit + auto-grade MCQ)
exports.submitAttempt = async (req, res) => {
  const attempt_id = req.params.attempt_id;
  const { answers } = req.body; // [{ pregunta_id, opcion_id?, respuesta_texto? }]
  try {
    // guardar respuestas y crear pregunta_intentos
    for (const a of answers) {
      const { pregunta_id, opcion_id = null, respuesta_texto = null } = a;
      await pool.query(
        'INSERT INTO pregunta_intentos (intento_id, pregunta_id, opcion_id, respuesta_texto) VALUES (?, ?, ?, ?)'
        , [attempt_id, pregunta_id, opcion_id, respuesta_texto]
      );
    }

    // Auto-grade: computar puntos para preguntas de opciones
    const [rows] = await pool.query(
      `SELECT pi.pregunta_intento_id, pi.pregunta_id, pi.opcion_id, op.es_correcta, p.puntos
       FROM pregunta_intentos pi
       JOIN preguntas p ON p.pregunta_id = pi.pregunta_id
       LEFT JOIN opciones_pregunta op ON op.opcion_id = pi.opcion_id
       WHERE pi.intento_id = ?`, [attempt_id]
    );

    let totalScore = 0;
    for (const r of rows) {
      let puntos_obtenidos = 0;
      if (r.es_correcta) puntos_obtenidos = r.puntos;
      await pool.query('UPDATE pregunta_intentos SET es_correcta = ?, puntos_obtenidos = ? WHERE pregunta_intento_id = ?', [!!r.es_correcta, puntos_obtenidos, r.pregunta_intento_id]);
      totalScore += Number(puntos_obtenidos);
    }

    // actualizar intento
    await pool.query('UPDATE leccion_intentos SET estado = ?, score = ?, submitted_at = NOW(), graded_at = NOW() WHERE intento_id = ?', ['CALIFICADA', totalScore, attempt_id]);

    // recalcular progreso del curso asociado (simple: marcar lección completada si score>0)
    // Obtener leccion y curso
    const [attemptRows] = await pool.query('SELECT leccion_id, alumno_id FROM leccion_intentos WHERE intento_id = ?', [attempt_id]);
    const leccion = attemptRows[0];
    const [mod] = await pool.query('SELECT m.curso_id FROM lecciones l JOIN modulos m ON l.modulo_id = m.modulo_id WHERE l.leccion_id = ?', [leccion.leccion_id]);
    const curso_id = mod[0].curso_id;

    // recompute progress simple: (lecciones completadas / total lecciones) * 100
    const [completed] = await pool.query(
      `SELECT COUNT(DISTINCT l.leccion_id) AS completadas
       FROM leccion_intentos li
       JOIN lecciones l ON l.leccion_id = li.leccion_id
       WHERE li.alumno_id = ? AND li.estado = 'CALIFICADA' AND l.modulo_id IN (SELECT modulo_id FROM modulos WHERE curso_id = ?)
      `, [leccion.alumno_id, curso_id]
    );

    const [total] = await pool.query(
      `SELECT COUNT(l.leccion_id) AS total
       FROM lecciones l
       JOIN modulos m ON l.modulo_id = m.modulo_id
       WHERE m.curso_id = ?`, [curso_id]
    );

    const percent = total[0].total > 0 ? (completed[0].completadas / total[0].total) * 100 : 0;

    // actualizar inscripcion
    await pool.query('UPDATE inscripciones SET porcentaje_progreso = ?, updated_at = NOW() WHERE alumno_id = ? AND curso_id = ?', [percent, leccion.alumno_id, curso_id]);

    res.json({ ok: true, data: { attempt_id, score: totalScore, progress: percent } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, msg: 'Error enviando intento' });
  }
};
