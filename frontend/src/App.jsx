// App.jsx: es el script que contiene toda la aplicación, por eso es invocado desde /src/main.jsx
// Se importa el componente Routes desde react-router-dom para crear las rutas de la aplicación y Route para crear una ruta específica
import { Routes, Route, Navigate } from 'react-router-dom';
// Se importa el componente Login desde /src/pages/auth/Login.jsx para ingresar a la App
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ResetPassword from './pages/auth/ResetPassword';
import DashboardRoutes from './routes/DashboardRoutes';
import PrivateRoute from './components/auth/PrivateRoute';
// Proveedor de autenticación para toda la aplicación (/src/context/AuthContext.jsx)
import { AuthProvider } from './context/AuthContext';

function App() {
   return (
      // Proveedor de autenticación para toda la aplicación (/src/context/AuthContext.jsx)
      <AuthProvider>
         <Routes>
            {/* Raíz */}
            {/* Redirección desde raíz /: redirige automáticamente a /login - cambia la URL real del navegador - reemplaza el historial (evita botón atrás extraño) */}
            <Route path='/' element={<Navigate to='/login' replace />} />

            {/* Públicas */}
            {/* Se incluye la pantalla del Login para ingresar a la App */}
            <Route path='/login' element={<Login />} />
            <Route path='/register' element={<Register />} />
            {/* Ruta para ingresar la nueva contraseña */}
            <Route path='/reset-password' element={<ResetPassword />} />

            {/* Privadas */}
            <Route
               path='/dashboard/*'
               element={
                  <PrivateRoute>
                     <DashboardRoutes />
                  </PrivateRoute>
               }
            />

            {/* Wildcard */}

            {/* Renderiza Login si la ruta ingresada en el navegador no existe: No cambia la URL - El usuario puede quedar en rutas inexistentes - Mala UX -Puede romper navegación protegida */}
            {/* <Route path='*' element={<Login />} /> */}
            {/* Así redirige a /login, no renderiza Login */}
            <Route path='*' element={<Navigate to='/login' replace />} />
         </Routes>
      </AuthProvider>
   );
}

export default App;
