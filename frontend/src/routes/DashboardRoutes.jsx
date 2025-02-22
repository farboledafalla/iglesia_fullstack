import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import AdminDashboard from '../pages/dashboard/admin/AdminDashboard';
import StudentDashboard from '../pages/dashboard/student/StudentDashboard';
import Alumnos from '../pages/dashboard/alumnos/Alumnos';
import Modulos from '../pages/dashboard/modulos/Modulos';
import Lecciones from '../pages/dashboard/lecciones/Lecciones';
import Preguntas from '../pages/dashboard/preguntas/Preguntas';
import Progreso from '../pages/dashboard/progreso/Progreso';
import Usuarios from '../pages/dashboard/usuarios/Usuarios';
import PerfilAlumno from '../pages/dashboard/perfil/PerfilAlumno';
import { useAuth } from '../context/AuthContext';

const DashboardRoutes = () => {
   const { user } = useAuth();
   const isAdmin = user?.rol === 'admin';

   return (
      <Routes>
         <Route path='/' element={<DashboardLayout />}>
            {isAdmin ? (
               <>
                  <Route index element={<AdminDashboard />} />
                  <Route path='alumnos' element={<Alumnos />} />
                  <Route path='modulos' element={<Modulos />} />
                  <Route path='lecciones' element={<Lecciones />} />
                  <Route path='preguntas' element={<Preguntas />} />
                  <Route path='progreso' element={<Progreso />} />
                  <Route path='usuarios' element={<Usuarios />} />
               </>
            ) : (
               <>
                  <Route index element={<StudentDashboard />} />
                  <Route path='perfil' element={<PerfilAlumno />} />
               </>
            )}
            <Route path='*' element={<Navigate to='/dashboard' replace />} />
         </Route>
      </Routes>
   );
};

export default DashboardRoutes;
