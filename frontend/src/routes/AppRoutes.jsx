import { Routes, Route, Navigate } from 'react-router-dom';
import dashboardRoutes from './dashboard.routes';
import renderRoutes from './RenderRoutes';

import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import ResetPassword from '../pages/auth/ResetPassword';
import Unauthorized from '../pages/dashboard/unautorized/Unauthorized';

const AppRoutes = () => {
   return (
      <Routes>
         {/* Públicas */}
         <Route path='/' element={<Navigate to='/login' replace />} />
         <Route path='/login' element={<Login />} />
         <Route path='/register' element={<Register />} />
         <Route path='/reset-password' element={<ResetPassword />} />
         <Route path='/unauthorized' element={<Unauthorized />} />

         {/* Privadas dinámicas */}
         {renderRoutes(dashboardRoutes)}

         {/* Wildcard */}
         <Route path='*' element={<Navigate to='/login' replace />} />
      </Routes>
   );
};

export default AppRoutes;

/*
AppRoutes
   ↓
renderRoutes
   ↓
PrivateRoute (protección login)
   ↓
DashboardLayout
   ↓
RoleRoute (protección por rol)
   ↓
Página final

*/
