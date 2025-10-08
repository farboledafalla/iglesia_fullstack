// PrivateRoute.jsx: este escript se encarga de proteger las rutas del dashboard, si el usuario no está autenticado, se redirige a la pantalla de login, si está autenticado, se renderizan los componentes hijos (rutas del dashboard)

// Importar React y los hooks necesarios, Navigate permite redireccionar a otra página, useLocation permite obtener la ubicación actual
import { Navigate, useLocation } from 'react-router-dom';
// Importar el contexto de autenticación
import { useAuth } from '../../context/AuthContext';

const PrivateRoute = ({ children }) => {
   // Obtener el token desde el contexto de autenticación, este fue guardado en el estado del contexto de autenticación (token) desde el componente LoginForm.jsx en la función login (const dataAuthContext = await login(formData.email, formData.password);) y este usó el contexto para almacenar este dato
   const { token } = useAuth();
   // Obtener la ubicación actual
   const location = useLocation();

   // Si no hay token, redirige a login, esto normalmente lo hace al ingresar por primera vez a la aplicación, ya que no hay token
   if (!token) {
      // Redirigir a /login, pero guardar la ubicación intentada
      // state: { from: location } guarda la ubicación actual en el estado, esto es para que cuando se redirija a /login, se pueda volver a la página anterior
      // replace: true reemplaza la ubicación actual en el historial de navegación, esto es para que no se pueda volver a la página anterior
      return <Navigate to='/login' state={{ from: location }} replace />;
   }

   // Si hay token, renderiza los componentes hijos (rutas del dashboard)
   // children: los componentes hijos (rutas del dashboard) se pasan como propiedades al componente (PrivateRoute.jsx), esto es para que se puedan renderizar en la página de dashboard
   return children;
};

export default PrivateRoute; 