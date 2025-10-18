const pool = require('../config/database');

// Crear inscripcion
exports.create = async (req, res) => {
  const { alumno_id, curso_id } = req.body;
  try {
    // validar que usuario tiene cuenta activa (req.user viene del middleware auth)
    const [userRows] = await pool.query('SELECT estado FROM usuarios WHERE usuario_id = ?', [req.user.usuario_id]);
    if (!userRows || userRows.length === 0 || userRows[0].estado !== 'ACTIVO') {
      return res.status(403).json({ ok: false, msg: 'Cuenta de usuario no activa' });
    }

    const [rows] = await pool.query('INSERT INTO inscripciones (alumno_id, curso_id) VALUES (?, ?)', [alumno_id, curso_id]);
    const [ins] = await pool.query('SELECT * FROM inscripciones WHERE inscripcion_id = ?', [rows.insertId]);
    res.json({ ok: true, data: ins[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, msg: 'Error creando inscripcion' });
  }
};

exports.listByAlumno = async (req, res) => {
  const alumno_id = req.query.alumno_id || req.params.alumno_id;
  try {
    const [rows] = await pool.query('SELECT i.*, c.titulo FROM inscripciones i JOIN cursos c ON c.curso_id = i.curso_id WHERE i.alumno_id = ?', [alumno_id]);
    res.json({ ok: true, data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, msg: 'Error listando inscripciones' });
  }
};

exports.update = async (req, res) => {
  const id = req.params.id;
  const { estado, porcentaje_progreso } = req.body;
  try {
    await pool.query('UPDATE inscripciones SET estado = ?, porcentaje_progreso = ?, updated_at = NOW() WHERE inscripcion_id = ?', [estado, porcentaje_progreso, id]);
    const [row] = await pool.query('SELECT * FROM inscripciones WHERE inscripcion_id = ?', [id]);
    res.json({ ok: true, data: row[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, msg: 'Error actualizando inscripcion' });
  }
};
