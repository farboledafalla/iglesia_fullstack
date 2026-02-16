const express = require('express');
const router = express.Router();
const pool = require('../config/database'); // ajusta según tu conexión
const verifyToken = require('../middleware/verifyToken');
const { obtenerFechaHoraActual } = require('../utils/funciones');

router.get('/', verifyToken, async (req, res) => {
   try {
      console.log('req.user completo:', req.user);

      const userId = req.user.id;

      const [rows] = await pool.query(
         `
         SELECT DISTINCT p.name, p.path, p.label, p.icon
         FROM permisos p
         JOIN roles_permisos rp ON rp.permiso_id = p.permiso_id
         JOIN usuarios_roles ur ON ur.rol_id = rp.rol_id
         WHERE ur.usuario_id = ?
         ORDER BY p.permiso_id
      `,
         [userId],
      );

      console.log('\n\n------------------------------------------------');
      console.log(obtenerFechaHoraActual());
      console.log('/navigation/navegation.js');
      console.log(
         'Consulta navigation:',
         `
         SELECT DISTINCT p.name, p.path, p.label, p.icon
         FROM permisos p
         JOIN roles_permisos rp ON rp.permiso_id = p.permiso_id
         JOIN usuarios_roles ur ON ur.rol_id = rp.rol_id
         WHERE ur.usuario_id = ?
         ORDER BY p.permiso_id
      `,
         userId,
      );

      console.log('Rows enviados al frontend:', rows);

      res.json(rows);
   } catch (error) {
      console.error(error);
      res.status(500).json({
         message: 'Error obteniendo navegación del backend',
      });
   }
});

module.exports = router;
