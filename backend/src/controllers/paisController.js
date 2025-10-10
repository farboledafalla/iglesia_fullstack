const { validationResult } = require('express-validator');
const pool = require('../config/database');
// Importar función obtenerFechaHoraActual
const { obtenerFechaHoraActual } = require('../utils/funciones');

const paisController = {
   // ... otros métodos existentes ...
   getPaises: async (req, res) => {
      try {
         const [paises] = await pool.query(
            'SELECT * FROM paises ORDER BY nombre_pais'
         );

         console.log('\n\n------------------------------------------------');
         console.log(obtenerFechaHoraActual());
         console.log('/controllers/paisController.js');
         console.log(
            'Consulta países: \nSELECT * FROM paises ORDER BY nombre_pais'
         );
         res.json(paises);
      } catch (err) {
         console.error(err.message);
         res.status(500).send('Error del servidor');
      }
   },

   // Crear múltiples países
   createMultiplePaises: async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
         return res.status(400).json({ errors: errors.array() });
      }

      const { paises } = req.body;

      if (!Array.isArray(paises) || paises.length === 0) {
         return res.status(400).json({
            msg: 'Debe proporcionar un array de países',
         });
      }

      let connection;
      try {
         connection = await pool.getConnection();

         const query = (sql, params) =>
            new Promise((resolve, reject) => {
               connection.query(sql, params, (err, results) => {
                  if (err) return reject(err);
                  resolve(results);
               });
            });

         // Iniciar transacción en la conexión dedicada
         await new Promise((resB, rejB) => connection.beginTransaction((err) => (err ? rejB(err) : resB())));

         const resultados = {
            exitosos: [],
            fallidos: [],
         };

         // Procesar cada país
         for (const pais of paises) {
            try {
               // Verificar que el continente existe
               const continentes = await query('SELECT continente_id FROM continentes WHERE continente_id = ?', [pais.continente_id]);

               if (continentes.length === 0) {
                  resultados.fallidos.push({
                     nombre_pais: pais.nombre_pais,
                     error: 'El continente especificado no existe',
                  });
                  continue;
               }

               const result = await query('INSERT INTO paises (nombre_pais, continente_id) VALUES (?, ?)', [pais.nombre_pais, pais.continente_id]);

               resultados.exitosos.push({
                  nombre_pais: pais.nombre_pais,
                  pais_id: result.insertId,
                  continente_id: pais.continente_id,
               });
            } catch (err) {
               if (err.code === 'ER_DUP_ENTRY') {
                  resultados.fallidos.push({
                     nombre_pais: pais.nombre_pais,
                     error: 'El país ya existe en este continente',
                  });
               } else {
                  throw err;
               }
            }
         }

         // Si no se insertó ningún país, hacer rollback
         if (resultados.exitosos.length === 0) {
            await new Promise((resR, rejR) => connection.rollback((err) => (err ? rejR(err) : resR())));
            return res.status(400).json({
               msg: 'No se pudo insertar ningún país',
               resultados,
            });
         }

         // Confirmar la transacción
         await new Promise((resC, rejC) => connection.commit((err) => (err ? rejC(err) : resC())));

         res.json({
            msg: `Se insertaron ${resultados.exitosos.length} países correctamente`,
            resultados,
         });
      } catch (err) {
         try {
            if (connection) await new Promise((resR, rejR) => connection.rollback((err) => (err ? rejR(err) : resR())));
         } catch (rbErr) {
            console.error('Error durante rollback:', rbErr);
         }
         console.error(err.message);
         res.status(500).send('Error del servidor');
      } finally {
         if (connection) connection.release();
      }
   },
};

module.exports = paisController;
