// Header.jsx: es un script que se encarga de mostrar el header de la aplicación, es decir, el nombre de la aplicación, el nombre del usuario y el botón de cerrar sesión.

import React from 'react';
// Se importa el hook useAuth para obtener el estado del contexto de autenticación
import { useAuth } from '../../context/AuthContext';
// Se importa el hook useNavigate para redireccionar al usuario a otra página
import { useNavigate } from 'react-router-dom';
// Se importa el icono de menu de heroicons
import { Bars3Icon as MenuIcon } from '@heroicons/react/24/outline';

const Header = ({ setSidebarOpen }) => {
   // Se obtiene el estado user y logout del contexto de autenticación
   const { user, logout } = useAuth();
   // Se obtiene la función navigate para redireccionar al usuario a otra página
   const navigate = useNavigate();

   // Función para cerrar sesión
   const handleLogout = () => {
      logout();
      navigate('/login');
   };

   return (
      <header className='bg-white shadow'>
         <div className='w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between'>
            <button
               className='md:hidden -ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500'
               onClick={() => setSidebarOpen(true)}
            >
               <span className='sr-only'>Abrir sidebar</span>
               <MenuIcon className='h-6 w-6' aria-hidden='true' />
            </button>

            <div className='flex items-center justify-between flex-1'>
               <div>
                  <span className='text-gray-800 text-4xl'>
                     Estudio Biblico
                  </span>
               </div>
               <div>
                  <span className='text-gray-700 mr-4'>{user?.nombre}</span>
                  <button
                     onClick={handleLogout}
                     className='bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2'
                  >
                     Cerrar Sesión
                  </button>
               </div>
            </div>
         </div>
      </header>
   );
};

export default Header;
