// App.jsx: es el script que contiene toda la aplicación, por eso es invocado desde /src/main.jsx
// Se importa el componente Routes desde react-router-dom para crear las rutas de la aplicación y Route para crear una ruta específica
import { Routes, Route } from 'react-router-dom';
// Se importa el componente Login desde /src/pages/auth/Login.jsx para ingresar a la App
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ResetPassword from './pages/auth/ResetPassword';
import DashboardRoutes from './routes/DashboardRoutes';
import PrivateRoute from './routes/PrivateRoute';
// Proveedor de autenticación para toda la aplicación (/src/context/AuthContext.jsx)
import { AuthProvider } from './context/AuthContext';
import AppRoutes from './routes/AppRoutes';

function App() {
   return (
      // Proveedor de autenticación para toda la aplicación (/src/context/AuthContext.jsx)
      <AuthProvider>
         <AppRoutes />
      </AuthProvider>
   );
}

export default App;
