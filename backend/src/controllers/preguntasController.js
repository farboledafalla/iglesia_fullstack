const pool = require('../config/database');

exports.createQuestion = async (req, res) => {
  const { leccion_id, tipo, enunciado, puntos, opciones } = req.body;
  try {
    const [r] = await pool.query('INSERT INTO preguntas (leccion_id, tipo, enunciado, puntos) VALUES (?, ?, ?, ?)', [leccion_id, tipo, enunciado, puntos || 1]);
    const preguntaId = r.insertId;
    if (Array.isArray(opciones)) {
      for (const opt of opciones) {
        await pool.query('INSERT INTO opciones_pregunta (pregunta_id, texto, es_correcta, orden) VALUES (?, ?, ?, ?)', [preguntaId, opt.texto, !!opt.es_correcta, opt.orden || 0]);
      }
    }
    const [q] = await pool.query('SELECT * FROM preguntas WHERE pregunta_id = ?', [preguntaId]);
    res.json({ ok: true, data: q[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, msg: 'Error creando pregunta' });
  }
};

exports.getQuestion = async (req, res) => {
  const id = req.params.id;
  try {
    const [q] = await pool.query('SELECT * FROM preguntas WHERE pregunta_id = ?', [id]);
    if (q.length === 0) return res.status(404).json({ ok: false, msg: 'Pregunta no encontrada' });
    const [op] = await pool.query('SELECT * FROM opciones_pregunta WHERE pregunta_id = ? ORDER BY orden', [id]);
    res.json({ ok: true, data: { ...q[0], opciones: op } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, msg: 'Error obteniendo pregunta' });
  }
};
