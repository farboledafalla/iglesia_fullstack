import React from 'react';
import { Link } from 'react-router-dom';
import RegisterForm from '../../components/auth/RegisterForm';

const Register = () => {
   return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
         <div className='max-w-md w-full space-y-8'>
            <div className='text-center'>
               <h1 className='text-3xl font-bold text-gray-900'>
                  Plataforma de Capacitación
               </h1>
               <p className='mt-2 text-sm text-gray-600'>
                  Crea tu cuenta para comenzar
               </p>
            </div>
            <RegisterForm />
            <div className='text-center'>
               <p className='text-sm text-gray-600'>
                  ¿Ya tienes una cuenta?{' '}
                  <Link
                     to='/login'
                     className='font-medium text-indigo-600 hover:text-indigo-500'
                  >
                     Inicia sesión aquí
                  </Link>
               </p>
            </div>
         </div>
      </div>
   );
};

export default Register;
