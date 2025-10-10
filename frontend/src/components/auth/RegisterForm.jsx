// RegisterForm.jsx: este componente se encarga de renderizar el formulario de registro de usuario y enviar los datos al backend para registrar al usuario

import React, { useState, useEffect } from 'react';
// Importar el hook useNavigate para redirigir a otra página
import { useNavigate } from 'react-router-dom';
// Importar el contexto de autenticación
import { useAuth } from '../../context/AuthContext';

// Definición del componente RegisterForm
const RegisterForm = () => {
   // Estado para el formulario
   const [formData, setFormData] = useState({
      identificacion: '',
      nombre: '',
      email: '',
      password: '',
      telefono: '',
      pais_id: '',
   });
   // Estado para el país seleccionado
   const [paises, setPaises] = useState([]);
   // Estado para el error
   const [error, setError] = useState('');

   // Obtener la función login del contexto de autenticación
   const { login } = useAuth();
   // Obtener la función navigate del hook useNavigate
   const navigate = useNavigate();

   // Cargar países al iniciar el componente, esto se hace mediante una petición GET a la API en el endpont (/api/paises)
   useEffect(() => {
      const fetchPaises = async () => {
         try {
            const response = await fetch('http://localhost:3002/api/paises');
            const data = await response.json();
            setPaises(data);
         } catch (err) {
            console.error('Error al cargar países:', err);
         }
      };

      // Llamar a la funci��n fetchPaises
      fetchPaises();
   }, []);

   // Función para manejar el cambio en el formulario en los diferentes campos del formulario
   const handleChange = (e) => {
      setFormData({
         ...formData,
         [e.target.name]: e.target.value,
      });
   };

   // Función para manejar el envío del formulario, cuando se envía el formulario, se envía una petición POST a la API en el endpoint (/api/auth/register) con los datos del formulario
   const handleSubmit = async (e) => {
      e.preventDefault();
      setError('');

      try {
         const response = await fetch(
            'http://localhost:3002/api/auth/register',
            {
               method: 'POST',
               headers: {
                  'Content-Type': 'application/json',
               },
               body: JSON.stringify(formData),
            }
         );

         const data = await response.json();

         if (!response.ok) {
            throw new Error(data.msg || 'Error al registrar usuario');
         }

         // Auto-login usando la función del contexto (misma firma que LoginForm)
         const authRes = await login(formData.email, formData.password);

         if (authRes?.ok) {
            navigate('/dashboard');
         } else {
            // Registro exitoso pero no se pudo iniciar sesión automáticamente
            setError(
               authRes?.msg ??
                  'Registro correcto pero no se pudo iniciar sesión'
            );
         }
      } catch (err) {
         setError(err.message);
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
               htmlFor='identificacion'
               className='block text-sm font-medium text-gray-700 mt-3'
            >
               Identificacion
            </label>
            <input
               type='text'
               name='identificacion'
               id='identificacion'
               placeholder='Número de identificación'
               value={formData.identificacion}
               onChange={handleChange}
               required
               className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
            />
         </div>

         <div>
            <label
               htmlFor='nombre'
               className='block text-sm font-medium text-gray-700'
            >
               Nombre
            </label>
            <input
               id='nombre'
               name='nombre'
               type='text'
               required
               placeholder='Nombre completo'
               value={formData.nombre}
               onChange={handleChange}
               className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
            />
         </div>
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
               placeholder='Correo electrónico'
               value={formData.email}
               onChange={handleChange}
               className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
            />
         </div>
         <div>
            <label
               htmlFor='telefono'
               className='block text-sm font-medium text-gray-700'
            >
               Teléfono
            </label>
            <input
               id='telefono'
               name='telefono'
               type='tel'
               placeholder='Número de teléfono'
               value={formData.telefono}
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
               placeholder='Contraseña'
               value={formData.password}
               onChange={handleChange}
               className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
            />
         </div>
         <div>
            <label
               htmlFor='pais_id'
               className='block text-sm font-medium text-gray-700'
            >
               País
            </label>
            <select
               id='pais_id'
               name='pais_id'
               required
               value={formData.pais_id}
               onChange={handleChange}
               className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
            >
               <option value=''>Selecciona un país</option>
               {paises.map((pais) => (
                  <option key={pais.pais_id} value={pais.pais_id}>
                     {pais.nombre_pais}
                  </option>
               ))}
            </select>
         </div>

         <div>
            <button
               type='submit'
               className='w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
            >
               Registrarse
            </button>
         </div>
      </form>
   );
};

export default RegisterForm;
