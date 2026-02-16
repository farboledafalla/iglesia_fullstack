// DashboardRoutes.jsx: es un script que contiene las rutas del dashboard de la aplicación

// Importar componentes de React Router, Routes me permite definir las rutas de la aplicación y Route me permite definir una ruta específica y Navigate me permite redirigir a una ruta específica
import { Routes, Route, Navigate } from 'react-router-dom';
// Importar el hook useAuth para obtener el estado del contexto de autenticación
import { useAuth } from '../context/AuthContext';
// Configuración del ruteador
import { getDashboardConfig } from './dashboard.config';

// Layout
// DashboardLayout.jsx: es un script que contiene el layout general del dashboard de la aplicación
import DashboardLayout from '../components/layout/DashboardLayout';

// Páginas Admin
import AdminDashboard from '../pages/dashboard/admin/AdminDashboard';

import Usuarios from '../pages/dashboard/usuarios/Usuarios';
import Alumnos from '../pages/dashboard/alumnos/Alumnos';
import Modulos from '../pages/dashboard/modulos/Modulos';
import Lecciones from '../pages/dashboard/lecciones/Lecciones';
import Preguntas from '../pages/dashboard/preguntas/Preguntas';
import Progreso from '../pages/dashboard/progreso/Progreso';

// Páginas student
import StudentDashboard from '../pages/dashboard/student/StudentDashboard';
import PerfilAlumno from '../pages/dashboard/perfil/PerfilAlumno';

const DashboardRoutes = () => {
   // Obtener el estado del contexto de autenticación, user me permite obtener el estado del usuario desde donce puedo saber si es admin o no
   const { user, loading } = useAuth();
   // Consultar las rutas según rol
   const config = getDashboardConfig(user);

   // Mientras loading=true, user=null...entonces no renderizaría bien...por eso mejor que retorne null
   if (loading) return null;

   // Si el usuario es admin, se muestra el dashboard de admin, si no, se muestra el dashboard de alumno
   const isAdmin = user?.rol === 'admin';

   return (
      <Routes>
         {/* Layout del Dashboard */}
         <Route element={<DashboardLayout />}>
            {isAdmin ? (
               <>
                  {/* Rutas del Dashboard de Admin */}
                  {/* El index se refiere a la ruta por defecto */}
                  <Route index element={<AdminDashboard />} />
                  <Route path='usuarios' element={<Usuarios />} />
                  <Route path='alumnos' element={<Alumnos />} />
                  <Route path='modulos' element={<Modulos />} />
                  <Route path='lecciones' element={<Lecciones />} />
                  <Route path='preguntas' element={<Preguntas />} />
                  <Route path='progreso' element={<Progreso />} />
               </>
            ) : (
               <>
                  {/* Rutas del Dashboard de Student */}
                  <Route index element={<StudentDashboard />} />
                  <Route path='perfil' element={<PerfilAlumno />} />
               </>
            )}
            {/* Ruta por defecto, si el usuario ingresa una ruta que no existe, se redirige a la ruta de inicio del dashboard */}
            <Route path='*' element={<Navigate to='/dashboard' replace />} />
         </Route>
      </Routes>
   );
};

export default DashboardRoutes;

/*

2. Separación por rol dentro del router

const isAdmin = user?.rol === 'admin';

Esto está bien para:
- MVP
- sistemas pequeños/medianos
- dashboards internos

Luego lo puedes migrar a RoleRoute si crece.


ANTES:

App.jsx
   └── <Routes>
           └── <Route element={<DashboardRoutes />} />
                   └── <Routes>   ← router interno



AHORA:

App.jsx
 └── Routes (único router real)
       └── /dashboard
             └── PrivateRoute
                   └── DashboardLayout
                         └── DashboardRoutes (solo Route)




*/
