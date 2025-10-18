import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import Modal from '../../../components/ui/Modal';
import UsuarioForm from '../../../components/usuarios/UsuarioForm';

const Usuarios = () => {
   const [usuarios, setUsuarios] = useState([]);
   const [loading, setLoading] = useState(true);
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [selectedUsuario, setSelectedUsuario] = useState(null);
   const { token } = useAuth();

   const fetchUsuarios = async () => {
      try {
         const response = await fetch('http://localhost:3002/api/users', {
            headers: {
               Authorization: `Bearer ${token}`,
            },
         });
         const data = await response.json();
         setUsuarios(data);
      } catch (error) {
         console.error('Error al cargar usuarios:', error);
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      fetchUsuarios();
   }, [token]);

   const handleOpenModal = (usuario = null) => {
      console.log('usuario selected:', usuario);

      setSelectedUsuario(usuario);
      setIsModalOpen(true);
   };

   const handleCloseModal = () => {
      setSelectedUsuario(null);
      setIsModalOpen(false);
   };

   const handleSubmit = async (data) => {
      // Normalización defensiva: el backend puede devolver { msg, user }
      const user = data?.user ?? data;

      // Si no recibimos un usuario con id, reconsultamos la lista como fallback
      if (!user || !user.usuario_id) {
         await fetchUsuarios();
         handleCloseModal();
         return;
      }

      if (selectedUsuario) {
         // Actualizar usuario existente en la lista
         const updatedUsuarios = usuarios.map((u) =>
            u.usuario_id === selectedUsuario.usuario_id ? { ...u, ...user } : u
         );
         setUsuarios(updatedUsuarios);
      } else {
         // Evitar duplicados: si ya existe, actualizamos en lugar de añadir
         const exists = usuarios.some((u) => u.usuario_id === user.usuario_id);
         if (exists) {
            setUsuarios(
               usuarios.map((u) =>
                  u.usuario_id === user.usuario_id ? { ...u, ...user } : u
               )
            );
         } else {
            setUsuarios([...usuarios, user]);
         }
      }

      handleCloseModal();
   };

   const handleToggleEstado = async (id) => {
      try {
         const response = await fetch(
            `http://localhost:3002/api/users/toggle-estado/${id}`,
            {
               method: 'PUT',
               headers: {
                  Authorization: `Bearer ${token}`,
               },
            }
         );

         if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.msg || 'Error al cambiar estado');
         }

         await fetchUsuarios();
      } catch (error) {
         console.error('Error:', error);
         // Aquí puedes mostrar un mensaje de error al usuario
      }
   };

   if (loading) return <div>Cargando...</div>;

   return (
      <div>
         <div className='sm:flex sm:items-center'>
            <div className='sm:flex-auto'>
               <h1 className='text-2xl font-semibold text-gray-900'>
                  Usuarios
               </h1>
               <p className='mt-2 text-sm text-gray-700'>
                  Lista de todos los usuarios del sistema
               </p>
            </div>
            <div className='mt-4 sm:mt-0 sm:ml-16 sm:flex-none'>
               <button
                  type='button'
                  className='inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto'
                  onClick={() => handleOpenModal()}
               >
                  Agregar usuario
               </button>
            </div>
         </div>

         <div className='mt-8 flex flex-col'>
            <div className='-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8'>
               <div className='inline-block min-w-full py-2 align-middle md:px-6 lg:px-8'>
                  <div className='overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg'>
                     <table className='min-w-full divide-y divide-gray-300'>
                        <thead className='bg-gray-50'>
                           <tr>
                              <th
                                 scope='col'
                                 className='py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6'
                              >
                                 Nombre
                              </th>
                              <th
                                 scope='col'
                                 className='px-3 py-3.5 text-left text-sm font-semibold text-gray-900'
                              >
                                 Email
                              </th>
                              <th
                                 scope='col'
                                 className='px-3 py-3.5 text-left text-sm font-semibold text-gray-900'
                              >
                                 Rol
                              </th>
                              <th
                                 scope='col'
                                 className='px-3 py-3.5 text-left text-sm font-semibold text-gray-900'
                              >
                                 País
                              </th>
                              <th
                                 scope='col'
                                 className='px-3 py-3.5 text-center text-sm font-semibold text-gray-900'
                              >
                                 Estado
                              </th>
                              <th
                                 scope='col'
                                 className='px-3 py-3.5 text-center text-sm font-semibold text-gray-900'
                              >
                                 Acciones
                              </th>
                           </tr>
                        </thead>
                        <tbody className='divide-y divide-gray-200 bg-white'>
                           {usuarios.map((usuario) => (
                              <tr key={usuario.usuario_id}>
                                 <td className='whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6'>
                                    {usuario.nombre}
                                 </td>
                                 <td className='whitespace-nowrap px-3 py-4 text-sm text-gray-500'>
                                    {usuario.email}
                                 </td>
                                 <td className='whitespace-nowrap px-3 py-4 text-sm text-gray-500'>
                                    {usuario.nombre_rol}
                                 </td>
                                 <td className='whitespace-nowrap px-3 py-4 text-sm text-gray-500'>
                                    {usuario.nombre_pais}
                                 </td>
                                 <td className='whitespace-nowrap px-3 py-4 text-sm text-gray-500 text-center'>
                                    <span
                                       className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                                          usuario.estado === 'ACTIVO'
                                             ? 'bg-green-100 text-green-800'
                                             : 'bg-red-100 text-red-800'
                                       }`}
                                    >
                                       {usuario.estado}
                                    </span>
                                 </td>
                                 <td className='whitespace-nowrap px-3 py-4 text-sm text-gray-500 text-center'>
                                    <button
                                       onClick={() => handleOpenModal(usuario)}
                                       className='text-indigo-600 hover:text-indigo-900 mr-4'
                                    >
                                       Editar
                                    </button>
                                    <button
                                       onClick={() =>
                                          handleToggleEstado(usuario.usuario_id)
                                       }
                                       className={`${
                                          usuario.estado === 'ACTIVO'
                                             ? 'text-red-600 hover:text-red-900'
                                             : 'text-green-600 hover:text-green-900'
                                       }`}
                                    >
                                       {usuario.estado === 'ACTIVO'
                                          ? 'Desactivar'
                                          : 'Activar'}
                                    </button>
                                 </td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
               </div>
            </div>
         </div>

         <Modal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            title={selectedUsuario ? 'Editar Usuario' : 'Crear Usuario'}
         >
            <UsuarioForm
               usuario={selectedUsuario}
               onSubmit={handleSubmit}
               onCancel={handleCloseModal}
            />
         </Modal>
      </div>
   );
};

export default Usuarios;
