// ResetPassword.jsx: este componente se encarga de mostrar un formulario para restablecer la contraseña de un usuario.

import React, { useState } from 'react';
// Se importa el hook useNavigate para redirigir al usuario a otra página, useLocation para obtener la URL actual, y Link para crear enlaces a otras páginas.
import { useNavigate, useLocation, Link } from 'react-router-dom';

const ResetPassword = () => {
   // Se declaran los estados del formulario y error (newPassword, confirmPassword, error, success, loading, navigate, location)
   const [newPassword, setNewPassword] = useState('');
   const [confirmPassword, setConfirmPassword] = useState('');
   const [error, setError] = useState('');
   const [success, setSuccess] = useState('');
   const [loading, setLoading] = useState(false);
   const navigate = useNavigate();
   const location = useLocation();

   // Obtener el token que viaja en la URL que llegó al email
   const getTokenFromQuery = () => {
      // Obtener la URL actual
      const params = new URLSearchParams(location.search);
      // Obtener el token, que viaja en la URL como parámetro (token)
      return params.get('token');
   };

   // Función que se ejecuta cuando se envía el formulario
   const handleSubmit = async (e) => {
      // Prevenir el comportamiento por defecto del formulario
      e.preventDefault();

      // Setear los estados (error y success) a vacío
      setError('');
      setSuccess('');

      // Validar que los campos no estén vacíos
      if (!newPassword || !confirmPassword) {
         setError('Por favor completa todos los campos.');
         return;
      }

      // Validar que las contraseñas sean iguales
      if (newPassword !== confirmPassword) {
         setError('Las contraseñas no coinciden.');
         return;
      }

      // Obtener el token de la URL
      const token = getTokenFromQuery();
      if (!token) {
         setError('Token inválido o faltante.');
         return;
      }

      // Setear el estado loading a true
      setLoading(true);

      // Enviar la petición al backend
      try {
         const response = await fetch(
            'http://localhost:3002/api/auth/reset-password',
            {
               method: 'POST',
               headers: {
                  'Content-Type': 'application/json',
               },
               body: JSON.stringify({ token, newPassword }),
            }
         );

         // Validar la respuesta del backend
         const data = await response.json();
         if (!response.ok) {
            throw new Error(data.msg || 'Error al restablecer la contraseña');
         }

         // Si todo salió bien, mostrar un mensaje de éxito y redirigir al usuario a la página de inicio de sesión
         setSuccess(
            'Contraseña actualizada correctamente. Ahora puedes iniciar sesión.'
         );

         // Redirigir al usuario a la página de inicio de sesión después de 2 segundos
         setTimeout(() => {
            navigate('/login');
         }, 2000);
      } catch (err) {
         setError(err.message);
      } finally {
         setLoading(false);
      }
   };

   return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
         <div className='max-w-md w-full space-y-8'>
            <div className='text-center'>
               <h1 className='text-3xl font-bold text-gray-900'>
                  Restablecer Contraseña
               </h1>
               <p className='mt-2 text-sm text-gray-600'>
                  Ingresa tu nueva contraseña a continuación.
               </p>
            </div>
            <form className='mt-8 space-y-6' onSubmit={handleSubmit}>
               {/* Se renderiza si existe algún error */}
               {error && (
                  <div
                     className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative'
                     role='alert'
                  >
                     <span className='block sm:inline'>{error}</span>
                  </div>
               )}
               {/* Se renderiza si el cambio de contraseña salió bien */}
               {success && (
                  <div
                     className='bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative'
                     role='alert'
                  >
                     <span className='block sm:inline'>{success}</span>
                  </div>
               )}
               <div>
                  <label
                     htmlFor='newPassword'
                     className='block text-sm font-medium text-gray-700'
                  >
                     Nueva Contraseña
                  </label>
                  <input
                     id='newPassword'
                     name='newPassword'
                     type='password'
                     required
                     value={newPassword}
                     onChange={(e) => setNewPassword(e.target.value)}
                     className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
                  />
               </div>
               <div>
                  <label
                     htmlFor='confirmPassword'
                     className='block text-sm font-medium text-gray-700'
                  >
                     Confirmar Contraseña
                  </label>
                  <input
                     id='confirmPassword'
                     name='confirmPassword'
                     type='password'
                     required
                     value={confirmPassword}
                     onChange={(e) => setConfirmPassword(e.target.value)}
                     className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
                  />
               </div>
               <div>
                  <button
                     type='submit'
                     disabled={loading}
                     className='w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                  >
                     {loading ? 'Actualizando...' : 'Restablecer Contraseña'}
                  </button>
               </div>
            </form>
            <div className='text-center'>
               <Link
                  to='/login'
                  className='font-medium text-indigo-600 hover:text-indigo-500'
               >
                  Volver al inicio de sesión
               </Link>
            </div>
         </div>
      </div>
   );
};

export default ResetPassword;
