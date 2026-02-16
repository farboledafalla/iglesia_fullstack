import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DashboardRedirect = () => {
   const { user } = useAuth();

   if (user?.rol?.includes('admin')) {
      return <Navigate to='admin' replace />;
   }

   if (user?.rol?.includes('student')) {
      return <Navigate to='student' replace />;
   }

   return <Navigate to='/unauthorized' replace />;
   // return <Navigate to='/login' replace />;
};

export default DashboardRedirect;
