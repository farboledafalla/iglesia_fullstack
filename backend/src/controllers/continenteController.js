const { validationResult } = require('express-validator');
const pool = require('../config/database');

const continenteController = {
   // Obtener todos los continentes
   getContinentes: async (req, res) => {
      try {
         const [continentes] = await pool.query(
            'SELECT * FROM continentes ORDER BY nombre_continente'
         );
         res.json(continentes);
      } catch (err) {
         console.error(err.message);
         res.status(500).send('Error del servidor');
      }
   },

   // Obtener un continente por ID
   getContinenteById: async (req, res) => {
      try {
         const [continentes] = await pool.query(
            'SELECT * FROM continentes WHERE continente_id = ?',
            [req.params.id]
         );

         if (continentes.length === 0) {
            return res.status(404).json({ msg: 'Continente no encontrado' });
         }

         res.json(continentes[0]);
      } catch (err) {
         console.error(err.message);
         res.status(500).send('Error del servidor');
      }
   },

   // Crear un nuevo continente
   createContinente: async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
         return res.status(400).json({ errors: errors.array() });
      }

      const { nombre_continente } = req.body;

      try {
         const [result] = await pool.query(
            'INSERT INTO continentes (nombre_continente) VALUES (?)',
            [nombre_continente]
         );

         res.json({
            msg: 'Continente creado correctamente',
            continenteId: result.insertId,
         });
      } catch (err) {
         if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ msg: 'El continente ya existe' });
         }
         console.error(err.message);
         res.status(500).send('Error del servidor');
      }
   },

   // Actualizar un continente
   updateContinente: async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
         return res.status(400).json({ errors: errors.array() });
      }

      const { nombre_continente } = req.body;
      const continente_id = req.params.id;

      try {
         const [result] = await pool.query(
            'UPDATE continentes SET nombre_continente = ? WHERE continente_id = ?',
            [nombre_continente, continente_id]
         );

         if (result.affectedRows === 0) {
            return res.status(404).json({ msg: 'Continente no encontrado' });
         }

         res.json({ msg: 'Continente actualizado correctamente' });
      } catch (err) {
         if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ msg: 'El continente ya existe' });
         }
         console.error(err.message);
         res.status(500).send('Error del servidor');
      }
   },

   // Eliminar un continente
   deleteContinente: async (req, res) => {
      try {
         // Primero verificar si hay países asociados
         const [paises] = await pool.query(
            'SELECT COUNT(*) as count FROM paises WHERE continente_id = ?',
            [req.params.id]
         );

         if (paises[0].count > 0) {
            return res.status(400).json({
               msg: 'No se puede eliminar el continente porque tiene países asociados',
            });
         }

         const [result] = await pool.query(
            'DELETE FROM continentes WHERE continente_id = ?',
            [req.params.id]
         );

         if (result.affectedRows === 0) {
            return res.status(404).json({ msg: 'Continente no encontrado' });
         }

         res.json({ msg: 'Continente eliminado correctamente' });
      } catch (err) {
         console.error(err.message);
         res.status(500).send('Error del servidor');
      }
   },

   // Crear múltiples continentes
   createMultipleContinentes: async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
         return res.status(400).json({ errors: errors.array() });
      }

      const { continentes } = req.body;

      if (!Array.isArray(continentes) || continentes.length === 0) {
         return res.status(400).json({
            msg: 'Debe proporcionar un array de continentes',
         });
      }

      try {
         // Iniciar transacción
         await pool.query('START TRANSACTION');

         const resultados = {
            exitosos: [],
            fallidos: [],
         };

         // Procesar cada continente
         for (const continente of continentes) {
            try {
               const [result] = await pool.query(
                  'INSERT INTO continentes (nombre_continente) VALUES (?)',
                  [continente.nombre_continente]
               );

               resultados.exitosos.push({
                  nombre_continente: continente.nombre_continente,
                  continente_id: result.insertId,
               });
            } catch (err) {
               // Si hay error de duplicado, agregarlo a fallidos
               if (err.code === 'ER_DUP_ENTRY') {
                  resultados.fallidos.push({
                     nombre_continente: continente.nombre_continente,
                     error: 'El continente ya existe',
                  });
               } else {
                  throw err; // Si es otro tipo de error, lanzarlo
               }
            }
         }

         // Si no se insertó ningún continente, hacer rollback
         if (resultados.exitosos.length === 0) {
            await pool.query('ROLLBACK');
            return res.status(400).json({
               msg: 'No se pudo insertar ningún continente',
               resultados,
            });
         }

         // Confirmar la transacción
         await pool.query('COMMIT');

         res.json({
            msg: `Se insertaron ${resultados.exitosos.length} continentes correctamente`,
            resultados,
         });
      } catch (err) {
         // Si hay cualquier error, hacer rollback
         await pool.query('ROLLBACK');
         console.error(err.message);
         res.status(500).send('Error del servidor');
      }
   },
};

module.exports = continenteController;
