export const dashboardNavigation = [
   { path: 'admin', roles: ['admin'], label: 'Dashboard', icon: 'home' },
   { path: 'usuarios', roles: ['admin'], label: 'Usuarios', icon: 'users' },
   { path: 'alumnos', roles: ['admin'], label: 'Alumnos', icon: 'graduation' },
   { path: 'modulos', roles: ['admin'], label: 'Módulos', icon: 'book' },
   {
      path: 'lecciones',
      roles: ['admin'],
      label: 'Lecciones',
      icon: 'academic',
   },
   {
      path: 'preguntas',
      roles: ['admin'],
      label: 'Preguntas',
      icon: 'list',
   },
   { path: 'progreso', roles: ['admin'], label: 'Progreso', icon: 'chart' },
   { path: 'student', roles: ['student'], label: 'Inicio', icon: 'home' },
   { path: 'perfil', roles: ['student'], label: 'Perfil', icon: 'user' },
];
