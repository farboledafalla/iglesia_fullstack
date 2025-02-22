const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
   // Leer el token del header
   const token = req.header('Authorization')?.replace('Bearer ', '');

   if (!token) {
      return res.status(401).json({ msg: 'No hay token, permiso no válido' });
   }

   try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded.user;
      next();
   } catch (err) {
      res.status(401).json({ msg: 'Token no válido' });
   }
};
