const pool = require('../config/database');

const rolController = {
   // Obtener todos los roles
   getRoles: async (req, res) => {
      try {
         const [roles] = await pool.query(
            'SELECT rol_id, nombre_rol FROM roles ORDER BY nombre_rol'
         );

         res.json(roles);
      } catch (error) {
         console.error('Error al obtener roles:', error);
         res.status(500).json({
            msg: 'Error al obtener roles',
            error: error.message,
         });
      }
   },
};

module.exports = rolController;
