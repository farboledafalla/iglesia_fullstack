import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const LoginForm = () => {
   const [formData, setFormData] = useState({
      email: '',
      password: '',
   });
   const [error, setError] = useState('');
   const { login } = useAuth();
   const navigate = useNavigate();

   const handleChange = (e) => {
      setFormData({
         ...formData,
         [e.target.name]: e.target.value,
      });
   };

   const handleSubmit = async (e) => {
      e.preventDefault();
      try {
         await login(formData.email, formData.password);
         navigate('/dashboard');
      } catch (error) {
         setError('Error al iniciar sesión');
      }
   };

   return (
      <form className='mt-8 space-y-6' onSubmit={handleSubmit}>
         {error && (
            <div
               className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative'
               role='alert'
            >
               <span className='block sm:inline'>{error}</span>
            </div>
         )}

         <div>
            <label
               htmlFor='email'
               className='block text-sm font-medium text-gray-700'
            >
               Email
            </label>
            <input
               id='email'
               name='email'
               type='email'
               required
               value={formData.email}
               onChange={handleChange}
               className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
            />
         </div>

         <div>
            <label
               htmlFor='password'
               className='block text-sm font-medium text-gray-700'
            >
               Contraseña
            </label>
            <input
               id='password'
               name='password'
               type='password'
               required
               value={formData.password}
               onChange={handleChange}
               className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
            />
         </div>

         <div>
            <button
               type='submit'
               className='w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
            >
               Iniciar Sesión
            </button>
         </div>
      </form>
   );
};

export default LoginForm;
