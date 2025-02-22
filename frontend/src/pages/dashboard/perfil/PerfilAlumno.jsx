import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { Navigate } from 'react-router-dom';

const PerfilAlumno = () => {
   const { user, token } = useAuth();
   const [perfilData, setPerfilData] = useState(null);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);

   useEffect(() => {
      const fetchPerfilData = async () => {
         if (!user?.id || !token) {
            setLoading(false);
            return;
         }

         try {
            const response = await fetch(
               `http://localhost:3002/api/alumnos/perfil/${user.id}`,
               {
                  headers: {
                     Authorization: `Bearer ${token}`,
                  },
               }
            );

            if (!response.ok) {
               throw new Error('Error al cargar el perfil');
            }

            const data = await response.json();
            setPerfilData(data);
         } catch (error) {
            console.error('Error al cargar perfil:', error);
            setError(error.message);
         } finally {
            setLoading(false);
         }
      };

      fetchPerfilData();
   }, [user?.id, token]);

   // Si no hay usuario autenticado, redirigir al login
   if (!user) {
      return <Navigate to='/login' replace />;
   }

   if (loading) {
      return <div>Cargando perfil...</div>;
   }

   if (error) {
      return <div>Error: {error}</div>;
   }

   return (
      <div className='container mx-auto p-4'>
         <h1 className='text-2xl font-bold mb-4'>Mi Perfil</h1>
         <div className='bg-white shadow-md rounded-lg p-6'>
            <div className='mb-4'>
               <h2 className='text-lg font-semibold'>Información Personal</h2>
               <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mt-4'>
                  <p>
                     <span className='font-medium'>Nombre:</span>{' '}
                     {perfilData?.nombre}
                  </p>
                  <p>
                     <span className='font-medium'>Email:</span>{' '}
                     {perfilData?.email}
                  </p>
                  <p>
                     <span className='font-medium'>Teléfono:</span>{' '}
                     {perfilData?.telefono || 'No especificado'}
                  </p>
                  <p>
                     <span className='font-medium'>País:</span>{' '}
                     {perfilData?.nombre_pais || 'No especificado'}
                  </p>
               </div>
            </div>
         </div>
      </div>
   );
};

export default PerfilAlumno;
