import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import Modal from '../../../components/ui/Modal';
import LeccionForm from '../../../components/lecciones/LeccionForm';
import ConfirmModal from '../../../components/ui/ConfirmModal';

const Lecciones = () => {
   const [lecciones, setLecciones] = useState([]);
   const [loading, setLoading] = useState(true);
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [selectedLeccion, setSelectedLeccion] = useState(null);
   const [showConfirmDelete, setShowConfirmDelete] = useState(false);
   const [leccionToDelete, setLeccionToDelete] = useState(null);
   const { token } = useAuth();

   useEffect(() => {
      fetchLecciones();
   }, [token]);

   const fetchLecciones = async () => {
      try {
         const response = await fetch('http://localhost:3002/api/lecciones', {
            headers: {
               Authorization: `Bearer ${token}`,
            },
         });
         const data = await response.json();
         setLecciones(data);
      } catch (error) {
         console.error('Error al cargar lecciones:', error);
      } finally {
         setLoading(false);
      }
   };

   const handleToggleEstado = async (leccion) => {
      try {
         const response = await fetch(
            `http://localhost:3002/api/lecciones/${leccion.leccion_id}/toggle-estado`,
            {
               method: 'PUT',
               headers: {
                  Authorization: `Bearer ${token}`,
               },
            }
         );

         if (!response.ok) {
            throw new Error('Error al cambiar estado de la lección');
         }

         fetchLecciones();
      } catch (error) {
         console.error('Error:', error);
      }
   };

   const handleDeleteClick = (leccion) => {
      setLeccionToDelete(leccion);
      setShowConfirmDelete(true);
   };

   const handleConfirmDelete = async () => {
      try {
         const response = await fetch(
            `http://localhost:3002/api/lecciones/${leccionToDelete.leccion_id}`,
            {
               method: 'DELETE',
               headers: {
                  Authorization: `Bearer ${token}`,
               },
            }
         );

         if (!response.ok) {
            throw new Error('Error al eliminar la lección');
         }

         fetchLecciones();
         setShowConfirmDelete(false);
         setLeccionToDelete(null);
      } catch (error) {
         console.error('Error:', error);
      }
   };

   if (loading) return <div>Cargando...</div>;

   return (
      <div className='px-4 sm:px-6 lg:px-8'>
         <div className='sm:flex sm:items-center'>
            <div className='sm:flex-auto'>
               <h1 className='text-2xl font-semibold text-gray-900'>
                  Lecciones
               </h1>
               <p className='mt-2 text-sm text-gray-700'>
                  Lista de todas las lecciones por módulo
               </p>
            </div>
            <div className='mt-4 sm:mt-0 sm:ml-16 sm:flex-none'>
               <button
                  type='button'
                  onClick={() => setIsModalOpen(true)}
                  className='inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto'
               >
                  Agregar lección
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
                                 className='px-3 py-3.5 text-left text-sm font-semibold text-gray-900'
                              >
                                 Título
                              </th>
                              <th
                                 scope='col'
                                 className='px-3 py-3.5 text-left text-sm font-semibold text-gray-900'
                              >
                                 Módulo
                              </th>
                              <th
                                 scope='col'
                                 className='px-3 py-3.5 text-left text-sm font-semibold text-gray-900'
                              >
                                 Instructor
                              </th>
                              <th
                                 scope='col'
                                 className='px-3 py-3.5 text-left text-sm font-semibold text-gray-900'
                              >
                                 Estado
                              </th>
                              <th
                                 scope='col'
                                 className='relative py-3.5 pl-3 pr-4 sm:pr-6'
                              >
                                 Acciones
                              </th>
                           </tr>
                        </thead>
                        <tbody className='divide-y divide-gray-200 bg-white'>
                           {lecciones.map((leccion) => (
                              <tr key={leccion.leccion_id}>
                                 <td className='whitespace-nowrap px-3 py-4 text-sm text-gray-500'>
                                    {leccion.titulo_leccion}
                                 </td>
                                 <td className='whitespace-nowrap px-3 py-4 text-sm text-gray-500'>
                                    {leccion.nombre_modulo}
                                 </td>
                                 <td className='whitespace-nowrap px-3 py-4 text-sm text-gray-500'>
                                    {leccion.nombre_instructor}
                                 </td>
                                 <td className='whitespace-nowrap px-3 py-4 text-sm text-gray-500'>
                                    <span
                                       className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                                          leccion.estado === 'ACTIVO'
                                             ? 'bg-green-100 text-green-800'
                                             : 'bg-orange-200 text-red-800'
                                       }`}
                                    >
                                       {leccion.estado}
                                    </span>
                                 </td>
                                 <td className='relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6 flex flex-row justify-center'>
                                    <button
                                       onClick={() => {
                                          setSelectedLeccion(leccion);
                                          setIsModalOpen(true);
                                       }}
                                       className='text-indigo-600 hover:text-indigo-900 mr-4'
                                    >
                                       Editar
                                    </button>
                                    <button
                                       onClick={() =>
                                          handleToggleEstado(leccion)
                                       }
                                       className={`${
                                          leccion.estado === 'ACTIVO'
                                             ? 'text-orange-400 hover:text-red-900'
                                             : 'text-green-600 hover:text-green-900'
                                       } mr-4`}
                                    >
                                       {leccion.estado === 'ACTIVO'
                                          ? 'Desactivar'
                                          : 'Activar'}
                                    </button>
                                    <button
                                       onClick={() => handleDeleteClick(leccion)}
                                       className='text-red-600 hover:text-red-900'
                                    >
                                       Eliminar
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
            onClose={() => {
               setIsModalOpen(false);
               setSelectedLeccion(null);
            }}
            title={selectedLeccion ? 'Editar Lección' : 'Agregar Lección'}
         >
            <LeccionForm
               leccion={selectedLeccion}
               onSubmit={(data) => {
                  setIsModalOpen(false);
                  setSelectedLeccion(null);
                  fetchLecciones();
               }}
               onCancel={() => {
                  setIsModalOpen(false);
                  setSelectedLeccion(null);
               }}
            />
         </Modal>

         <ConfirmModal
            isOpen={showConfirmDelete}
            onClose={() => {
               setShowConfirmDelete(false);
               setLeccionToDelete(null);
            }}
            onConfirm={handleConfirmDelete}
            title="Confirmar eliminación"
            message={`¿Estás seguro de que deseas eliminar la lección ${
               leccionToDelete?.titulo_leccion || ''
            }? Esta acción no se puede deshacer.`}
         />
      </div>
   );
};

export default Lecciones;
