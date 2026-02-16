// DashboardLayout.jsx: es un script que se encarga de mostrar el layout de la aplicación, es decir, el sidebar y el contenido principal.

import React, { useState } from 'react';
// Se importa el sidebar y el header
import Sidebar from './Sidebar';
import Header from './Header';

// Se importa Outlet para mostrar el contenido de las rutas hijas
import { Outlet } from 'react-router-dom';

const DashboardLayout = () => {
   // Estado para mostrar el sidebar en móvil
   const [sidebarOpen, setSidebarOpen] = useState(false);

   console.log('DashboardLayout render');
   return (
      <div className='h-screen flex overflow-hidden bg-gray-100'>
         {/* Sidebar para móvil */}
         <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

         {/* Contenido principal */}
         <div className='flex flex-col w-0 flex-1 overflow-hidden'>
            <Header setSidebarOpen={setSidebarOpen} />

            <main className='flex-1 relative overflow-y-auto focus:outline-none'>
               <div className='py-6'>
                  <div className='w-full mx-auto px-4 sm:px-6 md:px-8'>
                     <Outlet />
                  </div>
               </div>
            </main>
         </div>
      </div>
   );
};

export default DashboardLayout;
