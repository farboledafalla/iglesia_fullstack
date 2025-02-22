const checkRole = (roles) => {
   return (req, res, next) => {
      if (!req.user) {
         return res
            .status(401)
            .json({ msg: 'No hay token, permiso no válido' });
      }

      if (!roles.includes(req.user.rol)) {
         return res
            .status(403)
            .json({ msg: 'Usuario no autorizado para esta operación' });
      }

      next();
   };
};

module.exports = { checkRole };
