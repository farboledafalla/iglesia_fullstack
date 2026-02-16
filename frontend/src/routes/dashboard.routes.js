import DashboardLayout from '../components/layout/DashboardLayout';
import DashboardRedirect from './DashboardRedirect';

import AdminDashboard from '../pages/dashboard/admin/AdminDashboard';
import StudentDashboard from '../pages/dashboard/student/StudentDashboard';

import Usuarios from '../pages/dashboard/usuarios/Usuarios';
import Alumnos from '../pages/dashboard/alumnos/Alumnos';
import Modulos from '../pages/dashboard/modulos/Modulos';
import Lecciones from '../pages/dashboard/lecciones/Lecciones';
import Preguntas from '../pages/dashboard/preguntas/Preguntas';
import Progreso from '../pages/dashboard/progreso/Progreso';

import PerfilAlumno from '../pages/dashboard/perfil/PerfilAlumno';

const dashboardRoutes = [
   {
      path: '/dashboard',
      element: DashboardLayout,
      children: [
         {
            index: true,
            element: DashboardRedirect,
         },
         {
            path: 'admin',
            element: AdminDashboard,
            roles: ['admin'],
            label: 'Dashboard',
            icon: 'home',
         },
         {
            path: 'usuarios',
            element: Usuarios,
            roles: ['admin'],
            label: 'Usuarios',
            icon: 'users',
         },
         {
            path: 'alumnos',
            element: Alumnos,
            roles: ['admin'],
            label: 'Alumnos',
            icon: 'graduation',
         },
         {
            path: 'modulos',
            element: Modulos,
            roles: ['admin'],
            label: 'Módulos',
            icon: 'book',
         },
         {
            path: 'lecciones',
            element: Lecciones,
            roles: ['admin'],
            label: 'Lecciones',
            icon: 'lessons',
         },
         {
            path: 'preguntas',
            element: Preguntas,
            roles: ['admin'],
            label: 'Preguntas',
            icon: 'questions',
         },
         {
            path: 'progreso',
            element: Progreso,
            roles: ['admin'],
            label: 'Progreso',
            icon: 'progress',
         },
         {
            path: 'student',
            element: StudentDashboard,
            roles: ['student'],
            label: 'Inicio',
            icon: 'home',
         },
         {
            path: 'perfil',
            element: PerfilAlumno,
            roles: ['student'],
            label: 'Perfil',
            icon: 'users',
         },
      ],
   },
];

export default dashboardRoutes;
