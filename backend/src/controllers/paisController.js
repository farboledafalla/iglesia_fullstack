const { validationResult } = require('express-validator');
const pool = require('../config/database');

const paisController = {
   // ... otros métodos existentes ...

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

      try {
         // Iniciar transacción
         await pool.query('START TRANSACTION');

         const resultados = {
            exitosos: [],
            fallidos: [],
         };

         // Procesar cada país
         for (const pais of paises) {
            try {
               // Verificar que el continente existe
               const [continentes] = await pool.query(
                  'SELECT continente_id FROM continentes WHERE continente_id = ?',
                  [pais.continente_id]
               );

               if (continentes.length === 0) {
                  resultados.fallidos.push({
                     nombre_pais: pais.nombre_pais,
                     error: 'El continente especificado no existe',
                  });
                  continue;
               }

               const [result] = await pool.query(
                  'INSERT INTO paises (nombre_pais, continente_id) VALUES (?, ?)',
                  [pais.nombre_pais, pais.continente_id]
               );

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
            await pool.query('ROLLBACK');
            return res.status(400).json({
               msg: 'No se pudo insertar ningún país',
               resultados,
            });
         }

         // Confirmar la transacción
         await pool.query('COMMIT');

         res.json({
            msg: `Se insertaron ${resultados.exitosos.length} países correctamente`,
            resultados,
         });
      } catch (err) {
         await pool.query('ROLLBACK');
         console.error(err.message);
         res.status(500).send('Error del servidor');
      }
   },
};

module.exports = paisController;
