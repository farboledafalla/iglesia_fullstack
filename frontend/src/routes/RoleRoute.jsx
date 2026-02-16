import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RoleRoute = ({ children, roles }) => {
   const { user } = useAuth();
   console.log('roles: ', roles);

   // Usamos los roles definidos para las rutas en (dashboard.routes.js) enviados desde RenderRoute.jsx

   // Rutas sin roles definidos
   if (!roles || roles.length === 0) {
      return children;
   }

   const hasRole = user?.roles?.some((role) => roles.includes(role));

   if (!hasRole) {
      return <Navigate to='/unauthorized' replace />;
   }

   return children;
};

export default RoleRoute;
