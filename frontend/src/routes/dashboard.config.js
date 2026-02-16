export const getDashboardConfig = (user) => {
   const isAdmin = user?.rol === 'admin';

   return isAdmin
      ? ['admin-dashboard', 'usuarios', 'alumnos','modulos','lecciones','preguntas','progreso']
      : ['student-dashboard', 'perfil'];
};
