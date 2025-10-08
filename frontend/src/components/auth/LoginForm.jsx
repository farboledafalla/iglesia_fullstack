// LoginForm.jsx: este script se encarga de manejar el formulario de inicio de sesión de la aplicación
// import React, { useState } from'react'; esto se importa para poder usar el hook useState
import React, { useState, useRef, useEffect } from 'react';
// Importar el hook useNavigate para redirigir a otras páginas
import { useNavigate } from 'react-router-dom';
// Importar el contexto de autenticación
import { useAuth } from '../../context/AuthContext';

// Definición del componente LoginForm
const LoginForm = () => {
   // Estado del formulario y error (formData y error)
   const [formData, setFormData] = useState({
      email: '',
      password: '',
   });
   const [error, setError] = useState('');
   const inputEmailRef = useRef(null);

   // Obtener la función login del contexto de autenticación
   const { login } = useAuth();
   // Obtener la función navigate del hook useNavigate
   const navigate = useNavigate();

   // useEffect para establecer el foco en el campo de email al montar el componente
   useEffect(() => {
      inputEmailRef.current.focus();
   }, []);

   // Manejo de cambios en el formulario, cada vez que se cambie un campo del formulario, se actualiza el estado del formulario (formData)
   const handleChange = (e) => {
      setFormData({
         ...formData,
         [e.target.name]: e.target.value,
      });
   };

   // Manejo del envío del formulario, cuando se envía el formulario, se invoca la función login del contexto de autenticación y si se autenticó correctamente, se redirige a la página de dashboard
   const handleSubmit = async (e) => {
      // Prevenir el comportamiento por defecto del formulario
      e.preventDefault();

      // Invocar la función login del contexto de autenticación enviando los datos del formulario (email y password)
      try {
         const dataAuthContext = await login(formData.email, formData.password);

         if (dataAuthContext && !dataAuthContext.ok) {
            // Creamos un array con los dos valores, eliminamos valores vacíos/undefined con filter, y unimos con join
            const msg =
               [dataAuthContext?.msg, dataAuthContext?.email]
                  .filter(Boolean)
                  .join(' ') ??
               dataAuthContext?.error ??
               'Error al iniciar sesión';
            setError(msg);
            setFormData({ email: '', password: '' }); // Limpiar formulario
            inputEmailRef.current.focus(); // Volver a poner el foco en el campo email
            return; // Salir de la función si hay un error
         }

         //Imprimir data, retornada desde /AuthConttext.jsx en la función login
         //Se imprime solo para pruebas y si es que se requieren esos datos para algo, ya se tienen en el estado del contexto de autenticación (user y token)
         console.log('Data retornada desde AuthContext: ', dataAuthContext);

         navigate('/dashboard');
      } catch (error) {
         //imprimir error en la consola, este error viene desde AuthContext.jsx
         console.error('Error en el login desde LoginForm:', error);
         // Si hay un error, se actualiza el estado del error (error) para que se muestre en pantalla
         setError('Error al iniciar sesión');
      }
   };

   return (
      <form className='mt-8 space-y-6' onSubmit={handleSubmit}>
         {/* Si ocurrió un error en el login, se actualizó el estado (error) por ende se muestra el contendio de ese estado en pantalla */}
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
               ref={inputEmailRef} // Referencia para el foco al cargar el componente
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
