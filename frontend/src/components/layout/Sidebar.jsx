// Sidebar.jsx: es un script que muestra el sidebar de la aplicación, es un componente funcional que recibe dos propiedades, sidebarOpen y setSidebarOpen, que se utilizan para mostrar y ocultar el sidebar.

import React from 'react';
// NavLink: es un componente que se utiliza para crear enlaces en la aplicación, useLocation: es un hook que se utiliza para obtener la ubicación actual de la aplicación.
import { NavLink, useLocation } from 'react-router-dom';
// useAuth: es un hook que se utiliza para obtener el estado del contexto de autenticación
import { useAuth } from '../../context/AuthContext';

// import { dashboardNavigation } from '../../config/navigation.config';
import { iconMap } from '../../utils/SidebarIcons';

// Importamos el logo de la aplicación
import logo from '../../assets/images/logo_iglesia.png';

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
   // Traemos los datos del usuario en la variable de estado user desde el contexto para verificar si el usuario es administrador
   const { user } = useAuth();
   // Obtenemos la ubicación actual de la aplicación
   const { pathname } = useLocation();
   // Verificamos si el usuario es administrador, en la variable isAdmin se guarda el valor true o false
   // const userRoles = [user?.rol];
   // const childrenRoutes = dashboardNavigation[0];
   // if (!childrenRoutes) return null;
   // if (!user) return null;

   // console.log('dashboardNavigation:', dashboardNavigation);
   // console.log('childrenRoutes:', childrenRoutes);
   // console.log('user:', user);
   const { navigation } = useAuth();

   // Definimos las rutas de navegación si el usuario es administrador
   if (!user) return null;

   // const navigation = dashboardNavigation
   //    .filter((route) => {
   //       if (!route.label) return false;
   //       if (!route.roles) return true;

   //       return route.roles.includes(user?.rol);
   //    })
   //    .map((route) => ({
   //       name: route.label,
   //       href: `/dashboard/${route.path}`,
   //       icon: iconMap[route.icon] || iconMap.home,
   //    }));

   console.log('navigation desde sidebar:', navigation);

   return (
      <>
         {/* Sidebar móvil */}
         <div
            className={`${
               sidebarOpen ? 'block' : 'hidden'
            } fixed inset-0 flex z-40 md:hidden`}
         >
            <div className='fixed inset-0 bg-gray-600 bg-opacity-75' />

            <div className='relative flex-1 flex flex-col max-w-xs w-full bg-white'>
               <div className='absolute top-0 right-0 -mr-12 pt-2'>
                  <button
                     type='button'
                     className='ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white'
                     onClick={() => setSidebarOpen(false)}
                  >
                     <iconMap.x
                        className='h-6 w-6 text-white'
                        aria-hidden='true'
                     />
                  </button>
               </div>

               <div className='flex-1 h-0 pt-5 pb-4 overflow-y-auto'>
                  <div className='flex-shrink-0 flex justify-center items-center px-4'>
                     <img
                        className='h-32 w-32 object-contain'
                        src={logo}
                        alt='Logo'
                     />
                  </div>
                  <nav className='mt-5 px-2 space-y-1'>
                     {navigation.map((item) => {
                        const Icon = iconMap[item.icon] || iconMap.home;
                        return (
                           <NavLink
                              key={item.path}
                              to={`/dashboard/${item.path}`}
                              className={({ isActive }) =>
                                 `${
                                    isActive
                                       ? 'bg-gray-100 text-gray-900'
                                       : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                 } group flex items-center px-2 py-2 text-base font-medium rounded-md`
                              }
                           >
                              {Icon && (
                                 <Icon
                                    className='mr-3 flex-shrink-0 h-6 w-6 text-gray-400 group-hover:text-gray-500'
                                    aria-hidden='true'
                                 />
                              )}
                              {item.label}
                           </NavLink>
                        );
                     })}
                  </nav>
               </div>
            </div>
         </div>

         {/* Sidebar desktop */}
         <div className='hidden md:flex md:flex-shrink-0'>
            <div className='flex flex-col w-64'>
               <div className='flex-1 flex flex-col min-h-0 border-r border-gray-200 bg-white'>
                  <div className='flex-1 flex flex-col pt-5 pb-4 overflow-y-auto'>
                     <div className='flex-shrink-0 flex justify-center items-center px-4'>
                        <img
                           className='h-32 w-32 object-contain'
                           src={logo}
                           alt='Logo'
                        />
                     </div>
                     <nav className='mt-5 flex-1 px-2 space-y-1'>
                        {/* Recorrer el array que tiene las opciones del sidebar */}
                        {navigation.map((item) => {
                           const Icon = iconMap[item.icon] || iconMap.home;

                           return (
                              <NavLink
                                 key={item.path}
                                 to={`/dashboard/${item.path}`}
                                 className={({ isActive }) =>
                                    `${
                                       isActive
                                          ? 'bg-gray-100 text-gray-900'
                                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    } group flex items-center px-2 py-2 text-sm font-medium rounded-md`
                                 }
                              >
                                 {Icon && (
                                    <Icon
                                       className='mr-3 flex-shrink-0 h-6 w-6 text-gray-400 group-hover:text-gray-500'
                                       aria-hidden='true'
                                    />
                                 )}
                                 {item.label}
                              </NavLink>
                           );
                        })}
                     </nav>
                  </div>
               </div>
            </div>
         </div>
      </>
   );
};

export default Sidebar;

// seguimos con el sidebar dinámico desde donde lo dejamos
