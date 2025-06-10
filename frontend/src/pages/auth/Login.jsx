// Login.jsx: este script se encarga de renderizar el formulario de login de la aplicación
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
// Componente para mostrar el formulario que tiene los campos para inicio de sesión
import LoginForm from '../../components/auth/LoginForm';
// Componente para mostrar el formulario que tiene los campos para recuperar contraseña
import ForgotForm from '../../components/auth/ForgotForm';

const Login = () => {
   const [showForgot, setShowForgot] = useState(false);
   const [forgotEmail, setForgotEmail] = useState('');
   const [forgotMsg, setForgotMsg] = useState('');
   const [forgotError, setForgotError] = useState('');

   const handleForgotPassword = async (e) => {
      e.preventDefault();
      setForgotMsg('');
      setForgotError('');
      try {
         const response = await fetch(
            'http://localhost:3002/api/auth/forgot-password',
            {
               method: 'POST',
               headers: {
                  'Content-Type': 'application/json',
               },
               body: JSON.stringify({ email: forgotEmail }),
            }
         );
         const data = await response.json();
         if (!response.ok) {
            throw new Error(data.msg || 'Error al solicitar recuperación');
         }
         setForgotMsg(data.msg);
      } catch (err) {
         setForgotError(err.message);
      }
   };

   return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
         <div className='max-w-md w-full space-y-8'>
            {/* Datos de la cabecera de la pantalla de inicio de sesión */}
            <div className='text-center'>
               <h1 className='text-3xl font-bold text-gray-900'>
                  Plataforma de Capacitación
               </h1>
               <p className='mt-2 text-sm text-gray-600'>
                  Inicia sesión en tu cuenta
               </p>
            </div>

            {/* Componente para mostrar el formulario que tiene los campos para inicio de sesión */}
            <LoginForm />

            {/* Recuperar contraseña */}
            <div className='text-center'>
               <p className='text-sm text-gray-600'>
                  <button
                     className='font-medium text-indigo-600 hover:text-indigo-500'
                     type='button'
                     onClick={() => setShowForgot(true)}
                  >
                     ¿Olvidaste tu contraseña?
                  </button>
                  {showForgot && (
                     <div className='fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50'>
                        <div className='bg-white p-6 rounded shadow-md w-full max-w-sm'>
                           <form onSubmit={handleForgotPassword}>
                              <label>
                                 Ingresa tu email:
                                 <input
                                    type='email'
                                    value={forgotEmail}
                                    onChange={(e) =>
                                       setForgotEmail(e.target.value)
                                    }
                                    required
                                    className='block w-full mt-2 mb-4 p-2 border border-gray-300 rounded'
                                 />
                              </label>
                              <div className='flex justify-between'>
                                 <button
                                    type='submit'
                                    className='bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700'
                                 >
                                    Recuperar contraseña
                                 </button>
                                 <button
                                    type='button'
                                    onClick={() => setShowForgot(false)}
                                    className='bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400'
                                 >
                                    Cerrar
                                 </button>
                              </div>
                           </form>
                           {forgotMsg && (
                              <div className='mt-4 text-green-600'>
                                 {forgotMsg}
                              </div>
                           )}
                           {forgotError && (
                              <div className='mt-4 text-red-600'>
                                 {forgotError}
                              </div>
                           )}
                        </div>
                     </div>
                  )}
               </p>
            </div>

            {/* Datos del footer de la pantalla de inicio de sesió */}
            <div className='text-center'>
               <p className='text-sm text-gray-600'>
                  {/* Enlace para ir al componente de Registro (<Register />) */}
                  ¿No tienes una cuenta?{' '}
                  <Link
                     to='/register'
                     className='font-medium text-indigo-600 hover:text-indigo-500'
                  >
                     Regístrate aquí
                  </Link>
               </p>
            </div>
         </div>
      </div>
   );
};

export default Login;
