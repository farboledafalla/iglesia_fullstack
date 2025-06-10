// App.js es el script que contiene toda la aplicación, por eso es invocado desde /src/main.jsx
import { Routes, Route } from 'react-router-dom';
// Se importa el componente Login desde /src/pages/auth/Login.jsx para ingresar a la App
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ResetPassword from './pages/auth/ResetPassword';
import DashboardRoutes from './routes/DashboardRoutes';
import PrivateRoute from './components/auth/PrivateRoute';
// Proveedor de autenticación para toda la aplicación (/src/context/AuthContext.jsx)
import { AuthProvider } from './context/AuthContext';
import Preguntas from './pages/dashboard/preguntas/Preguntas';

function App() {
   return (
      // Proveedor de autenticación para toda la aplicación (/src/context/AuthContext.jsx)
      <AuthProvider>
         <Routes>
            {/* Rutas públicas de inicio de la aplicación */}
            {/* Se incluye la pantalla del Login para ingresar a la App */}
            <Route path='/login' element={<Login />} />
            <Route path='/register' element={<Register />} />
            {/* Ruta para ingresar la nueva contraseña */}
            <Route path='/reset-password' element={<ResetPassword />} />

            {/* Rutas protegidas del dashboard */}
            <Route
               path='/dashboard/*'
               element={
                  <PrivateRoute>
                     <DashboardRoutes />
                  </PrivateRoute>
               }
            />

            {/* Redirigir a login si la ruta ingresada en el navegador no existe */}
            <Route path='*' element={<Login />} />
         </Routes>
      </AuthProvider>
   );
}

export default App;
