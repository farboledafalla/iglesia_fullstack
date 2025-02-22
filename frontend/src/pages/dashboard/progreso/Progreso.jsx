import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import Modal from '../../../components/ui/Modal';
import ProgresoForm from '../../../components/progreso/ProgresoForm';

const Progreso = () => {
   const [progresos, setProgresos] = useState([]);
   const [loading, setLoading] = useState(true);
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [selectedProgreso, setSelectedProgreso] = useState(null);
   const { token } = useAuth();

   useEffect(() => {
      const fetchProgresos = async () => {
         try {
            const response = await fetch(
               'http://localhost:3002/api/progreso-alumnos',
               {
                  headers: {
                     Authorization: `Bearer ${token}`,
                  },
               }
            );
            const data = await response.json();
            setProgresos(data);
         } catch (error) {
            console.error('Error al cargar progresos:', error);
         } finally {
            setLoading(false);
         }
      };

      fetchProgresos();
   }, [token]);

   const handleOpenModal = (progreso = null) => {
      setSelectedProgreso(progreso);
      setIsModalOpen(true);
   };

   const handleCloseModal = () => {
      setSelectedProgreso(null);
      setIsModalOpen(false);
   };

   const handleSubmit = async (data) => {
      const updatedProgresos = selectedProgreso
         ? progresos.map((p) =>
              p.id === selectedProgreso.id ? { ...p, ...data } : p
           )
         : [...progresos, data];
      setProgresos(updatedProgresos);
      handleCloseModal();
   };

   if (loading) return <div>Cargando...</div>;

   return (
      <div>
         <div className='sm:flex sm:items-center'>
            <div className='sm:flex-auto'>
               <h1 className='text-2xl font-semibold text-gray-900'>
                  Progreso de Alumnos
               </h1>
               <p className='mt-2 text-sm text-gray-700'>
                  Seguimiento del avance de los alumnos en los módulos
               </p>
            </div>
            <div className='mt-4 sm:mt-0 sm:ml-16 sm:flex-none'>
               <button
                  type='button'
                  className='inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto'
                  onClick={() => handleOpenModal()}
               >
                  Registrar progreso
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
                                 Alumno
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
                                 Lección
                              </th>
                              <th
                                 scope='col'
                                 className='px-3 py-3.5 text-left text-sm font-semibold text-gray-900'
                              >
                                 Estado
                              </th>
                              <th
                                 scope='col'
                                 className='px-3 py-3.5 text-left text-sm font-semibold text-gray-900'
                              >
                                 Fecha
                              </th>
                              <th
                                 scope='col'
                                 className='relative py-3.5 pl-3 pr-4 sm:pr-6'
                              >
                                 <span className='sr-only'>Acciones</span>
                              </th>
                           </tr>
                        </thead>
                        <tbody className='divide-y divide-gray-200 bg-white'>
                           {progresos.map((progreso) => (
                              <tr key={progreso.progreso_leccion_id}>
                                 <td className='whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6'>
                                    {progreso.nombre_alumno}
                                 </td>
                                 <td className='whitespace-nowrap px-3 py-4 text-sm text-gray-500'>
                                    {progreso.nombre_modulo}
                                 </td>
                                 <td className='whitespace-nowrap px-3 py-4 text-sm text-gray-500'>
                                    {progreso.titulo_leccion}
                                 </td>
                                 <td className='whitespace-nowrap px-3 py-4 text-sm text-gray-500'>
                                    <span
                                       className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                                          progreso.estado === 'COMPLETADA'
                                             ? 'bg-green-100 text-green-800'
                                             : 'bg-yellow-100 text-yellow-800'
                                       }`}
                                    >
                                       {progreso.estado === 'COMPLETADA'
                                          ? 'Completada'
                                          : 'En progreso'}
                                    </span>
                                 </td>
                                 <td className='whitespace-nowrap px-3 py-4 text-sm text-gray-500'>
                                    {new Date(
                                       progreso.fecha_completado
                                    ).toLocaleDateString()}
                                 </td>
                                 <td className='relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6'>
                                    <button
                                       onClick={() => handleOpenModal(progreso)}
                                       className='text-indigo-600 hover:text-indigo-900'
                                    >
                                       Editar
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
            title={
               selectedProgreso ? 'Editar Progreso' : 'Registrar Nuevo Progreso'
            }
         >
            <ProgresoForm
               progreso={selectedProgreso}
               onSubmit={handleSubmit}
               onCancel={handleCloseModal}
            />
         </Modal>
      </div>
   );
};

export default Progreso;
