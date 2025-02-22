import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const PrivateRoute = ({ children }) => {
   const { token } = useAuth();
   const location = useLocation();

   // Si no hay token, redirige a login
   if (!token) {
      // Redirigir a /login, pero guardar la ubicación intentada
      return <Navigate to="/login" state={{ from: location }} replace />;
   }

   // Si hay token, renderiza los componentes hijos (rutas del dashboard)
   return children;
};

export default PrivateRoute; 