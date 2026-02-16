// auth.js: es un middleware que se ejecuta antes de cada petición para verificar si el usuario está autenticado.

// jsonwebtoken: es una librería que nos permite generar y verificar tokens JWT.
const jwt = require('jsonwebtoken');
const { obtenerFechaHoraActual } = require('../utils/funciones');

// Tenemos 3 parametros: req es la petición, res es la respuesta y next es una función que se ejecuta cuando el primer middleware ha terminado de ejecutarse y buscar el siguiente middleware.
// En este caso la petición (req) es la petición que se hace al servidor y la respuesta (res) es la respuesta que se le manda al cliente.
// Un ejemplo de req es que el cliente pide a la url /api/users y el servidor responde con un json con los usuarios.
module.exports = (req, res, next) => {
   // Leer el token del header, esta línea es para leer el token que se le manda en el header de la petición y el replace es para quitar la palablr 'Bearer' del token.
   const token = req.header('Authorization')?.replace('Bearer ', '');

   // Revisar si no hay token, envíar un mensaje de error al cliente (frontend) y no se ejecuta la función next() que es para ejecutar la siguiente función en el middleware.
   if (!token) {
      console.log('\n\n------------------------------------------------');
      //Mostrar mensaje en cosola
      console.error(
         '\nMensaje enviado al FrontEnd: No hay token, permiso no válido',
      );
      return res.status(401).json({ msg: 'No hay token, permiso no válido' });
   }

   try {
      // Verificar token, la función verify es para verificar si el token es válido y si es válido la función devuelve el payload del token.
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Agregar el usuario al request para que pueda ser usado en cualquier parte del servidor.
      req.user = decoded;

      // Verificar estado de cuenta en la base de datos
      //En este caso se debe usar req.user.id porque en el payload del token se envía el id del usuario como 'id' y no como 'usuario_id'
      //Si se usa req.user.usuario_id no funcionará porque en el payload del token no existe esa propiedad
      const pool = require('../config/database');
      pool
         .query('SELECT estado FROM usuarios WHERE usuario_id = ?', [
            req.user.id,
         ])
         .then(([rows]) => {
            if (!rows || rows.length === 0)
               return res.status(401).json({ msg: 'Usuario no encontrado' });
            if (rows[0].estado !== 'ACTIVO')
               return res.status(403).json({
                  msg: 'Cuenta de usuario no activa',
                  email: req.user.email,
               });
            next();
         })
         .catch((err) => {
            console.error('Error verificando estado de usuario:', err);
            res.status(500).json({ msg: 'Error interno' });
         });
   } catch (err) {
      console.log('\n\n------------------------------------------------');
      //Mostrar mensaje en cosola
      console.error('\nMensaje enviado al FrontEnd: Token no válido');
      //Mostrar mensaje completo
      console.log('\nMensaje completo: ', err.message);

      res.status(401).json({ msg: 'Token no válido' });
   }
};
