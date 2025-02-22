import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { Outlet } from 'react-router-dom';

const DashboardLayout = () => {
   const [sidebarOpen, setSidebarOpen] = useState(false);

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
