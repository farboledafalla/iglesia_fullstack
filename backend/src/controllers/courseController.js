const { validationResult } = require('express-validator');
const pool = require('../config/database');

const courseController = {
    // Obtener todos los módulos
    getModulos: async (req, res) => {
        try {
            const [modulos] = await pool.query(
                'SELECT m.*, u.nombre as instructor_nombre ' +
                'FROM Modulos m ' +
                'JOIN Instructores i ON m.instructor_id = i.instructor_id ' +
                'JOIN Usuarios u ON i.usuario_id = u.usuario_id'
            );
            res.json(modulos);
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Error del servidor');
        }
    },

    // Obtener módulo por ID
    getModuloById: async (req, res) => {
        try {
            const [modulos] = await pool.query(
                'SELECT m.*, u.nombre as instructor_nombre ' +
                'FROM Modulos m ' +
                'JOIN Instructores i ON m.instructor_id = i.instructor_id ' +
                'JOIN Usuarios u ON i.usuario_id = u.usuario_id ' +
                'WHERE m.modulo_id = ?',
                [req.params.id]
            );

            if (modulos.length === 0) {
                return res.status(404).json({ msg: 'Módulo no encontrado' });
            }

            res.json(modulos[0]);
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Error del servidor');
        }
    },

    // Crear módulo
    createModulo: async (req, res) => {
        const { nombre_modulo, descripcion, instructor_id } = req.body;

        try {
            const [result] = await pool.query(
                'INSERT INTO Modulos (nombre_modulo, descripcion, instructor_id) VALUES (?, ?, ?)',
                [nombre_modulo, descripcion, instructor_id]
            );

            res.json({
                msg: 'Módulo creado correctamente',
                modulo_id: result.insertId
            });
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Error del servidor');
        }
    },

    // Actualizar módulo
    updateModulo: async (req, res) => {
        const { nombre_modulo, descripcion } = req.body;
        const modulo_id = req.params.id;

        try {
            const [result] = await pool.query(
                'UPDATE Modulos SET nombre_modulo = ?, descripcion = ? WHERE modulo_id = ?',
                [nombre_modulo, descripcion, modulo_id]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({ msg: 'Módulo no encontrado' });
            }

            res.json({ msg: 'Módulo actualizado correctamente' });
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Error del servidor');
        }
    },

    // Eliminar módulo
    deleteModulo: async (req, res) => {
        try {
            const [result] = await pool.query(
                'DELETE FROM Modulos WHERE modulo_id = ?',
                [req.params.id]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({ msg: 'Módulo no encontrado' });
            }

            res.json({ msg: 'Módulo eliminado correctamente' });
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Error del servidor');
        }
    },

    // Obtener todas las lecciones
    getLecciones: async (req, res) => {
        try {
            const [lecciones] = await pool.query(
                'SELECT l.*, m.nombre_modulo FROM Lecciones l ' +
                'JOIN Modulos m ON l.modulo_id = m.modulo_id ' +
                'ORDER BY l.orden'
            );
            res.json(lecciones);
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Error del servidor');
        }
    },

    // Obtener lección por ID
    getLeccionById: async (req, res) => {
        try {
            const [lecciones] = await pool.query(
                'SELECT l.*, m.nombre_modulo FROM Lecciones l ' +
                'JOIN Modulos m ON l.modulo_id = m.modulo_id ' +
                'WHERE l.leccion_id = ?',
                [req.params.id]
            );

            if (lecciones.length === 0) {
                return res.status(404).json({ msg: 'Lección no encontrada' });
            }

            res.json(lecciones[0]);
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Error del servidor');
        }
    },

    // Crear lección
    createLeccion: async (req, res) => {
        const { modulo_id, titulo_leccion, contenido, orden } = req.body;

        try {
            const [result] = await pool.query(
                'INSERT INTO Lecciones (modulo_id, titulo_leccion, contenido, orden) VALUES (?, ?, ?, ?)',
                [modulo_id, titulo_leccion, contenido, orden]
            );

            res.json({
                msg: 'Lección creada correctamente',
                leccion_id: result.insertId
            });
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Error del servidor');
        }
    },

    // Actualizar lección
    updateLeccion: async (req, res) => {
        const { titulo_leccion, contenido, orden } = req.body;
        const leccion_id = req.params.id;

        try {
            const [result] = await pool.query(
                'UPDATE Lecciones SET titulo_leccion = ?, contenido = ?, orden = ? WHERE leccion_id = ?',
                [titulo_leccion, contenido, orden, leccion_id]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({ msg: 'Lección no encontrada' });
            }

            res.json({ msg: 'Lección actualizada correctamente' });
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Error del servidor');
        }
    },

    // Eliminar lección
    deleteLeccion: async (req, res) => {
        try {
            const [result] = await pool.query(
                'DELETE FROM Lecciones WHERE leccion_id = ?',
                [req.params.id]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({ msg: 'Lección no encontrada' });
            }

            res.json({ msg: 'Lección eliminada correctamente' });
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Error del servidor');
        }
    }
};

module.exports = courseController; 