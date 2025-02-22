import { Routes, Route } from 'react-router-dom';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import DashboardRoutes from './routes/DashboardRoutes';
import PrivateRoute from './components/auth/PrivateRoute';
import { AuthProvider } from './context/AuthContext';
import Preguntas from './pages/dashboard/preguntas/Preguntas';

function App() {
   return (
      <AuthProvider>
         <Routes>
            <Route path='/login' element={<Login />} />
            <Route path='/register' element={<Register />} />

            {/* Rutas protegidas del dashboard */}
            <Route
               path='/dashboard/*'
               element={
                  <PrivateRoute>
                     <DashboardRoutes />
                  </PrivateRoute>
               }
            />

            {/* Redirigir a login si la ruta no existe */}
            <Route path='*' element={<Login />} />
         </Routes>
      </AuthProvider>
   );
}

export default App;
