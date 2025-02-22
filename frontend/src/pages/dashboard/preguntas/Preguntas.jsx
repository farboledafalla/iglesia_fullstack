import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import Modal from '../../../components/ui/Modal';
import PreguntaForm from '../../../components/preguntas/PreguntaForm';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

const Preguntas = () => {
   const [preguntas, setPreguntas] = useState([]);
   const [loading, setLoading] = useState(true);
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [selectedPregunta, setSelectedPregunta] = useState(null);
   const [expandedLecciones, setExpandedLecciones] = useState({});
   const { token } = useAuth();

   useEffect(() => {
      fetchPreguntas();
   }, [token]);

   const fetchPreguntas = async () => {
      try {
         const response = await fetch('http://localhost:3002/api/preguntas', {
            headers: {
               Authorization: `Bearer ${token}`,
            },
         });
         const data = await response.json();
         
         // Agrupar preguntas por lección
         const preguntasPorLeccion = data.reduce((acc, pregunta) => {
            if (!acc[pregunta.leccion_id]) {
               acc[pregunta.leccion_id] = {
                  leccion_id: pregunta.leccion_id,
                  titulo_leccion: pregunta.titulo_leccion,
                  modulo: pregunta.nombre_modulo,
                  preguntas: [],
               };
            }
            acc[pregunta.leccion_id].preguntas.push(pregunta);
            return acc;
         }, {});

         setPreguntas(Object.values(preguntasPorLeccion));
      } catch (error) {
         console.error('Error al cargar preguntas:', error);
      } finally {
         setLoading(false);
      }
   };

   const handleToggleEstado = async (pregunta) => {
      try {
         const response = await fetch(
            `http://localhost:3002/api/preguntas/${pregunta.pregunta_id}/toggle-estado`,
            {
               method: 'PUT',
               headers: {
                  Authorization: `Bearer ${token}`,
               },
            }
         );

         if (!response.ok) {
            throw new Error('Error al cambiar estado de la pregunta');
         }

         fetchPreguntas();
      } catch (error) {
         console.error('Error:', error);
      }
   };

   const toggleLeccion = (leccionId) => {
      setExpandedLecciones((prev) => ({
         ...prev,
         [leccionId]: !prev[leccionId],
      }));
   };

   if (loading) return <div>Cargando...</div>;

   return (
      <div className='px-4 sm:px-6 lg:px-8'>
         <div className='sm:flex sm:items-center'>
            <div className='sm:flex-auto'>
               <h1 className='text-2xl font-semibold text-gray-900'>
                  Preguntas por Lección
               </h1>
               <p className='mt-2 text-sm text-gray-700'>
                  Administra las preguntas de cada lección
               </p>
            </div>
            <div className='mt-4 sm:mt-0 sm:ml-16 sm:flex-none'>
               <button
                  type='button'
                  onClick={() => setIsModalOpen(true)}
                  className='inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto'
               >
                  Agregar pregunta
               </button>
            </div>
         </div>

         <div className='mt-8 flex flex-col'>
            <div className='-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8'>
               <div className='inline-block min-w-full py-2 align-middle md:px-6 lg:px-8'>
                  <div className='overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg'>
                     {preguntas.map((leccion) => (
                        <div key={leccion.leccion_id} className='bg-white'>
                           <div
                              className='px-4 py-3 border-b border-gray-200 cursor-pointer hover:bg-gray-50'
                              onClick={() => toggleLeccion(leccion.leccion_id)}
                           >
                              <div className='flex items-center justify-between'>
                                 <div>
                                    <h3 className='text-lg font-medium text-gray-900'>
                                       {leccion.titulo_leccion}
                                    </h3>
                                    <p className='text-sm text-gray-500'>
                                       {leccion.modulo}
                                    </p>
                                 </div>
                                 {expandedLecciones[leccion.leccion_id] ? (
                                    <ChevronUpIcon className='h-5 w-5' />
                                 ) : (
                                    <ChevronDownIcon className='h-5 w-5' />
                                 )}
                              </div>
                           </div>
                           {expandedLecciones[leccion.leccion_id] && (
                              <table className='min-w-full divide-y divide-gray-300'>
                                 <thead className='bg-gray-50'>
                                    <tr>
                                       <th className='px-3 py-3.5 text-left text-sm font-semibold text-gray-900'>
                                          Orden
                                       </th>
                                       <th className='px-3 py-3.5 text-left text-sm font-semibold text-gray-900'>
                                          Contenido Previo
                                       </th>
                                       <th className='px-3 py-3.5 text-left text-sm font-semibold text-gray-900'>
                                          Pregunta
                                       </th>
                                       <th className='px-3 py-3.5 text-left text-sm font-semibold text-gray-900'>
                                          Estado
                                       </th>
                                       <th className='relative py-3.5 pl-3 pr-4 sm:pr-6'>
                                          Acciones
                                       </th>
                                    </tr>
                                 </thead>
                                 <tbody className='divide-y divide-gray-200 bg-white'>
                                    {leccion.preguntas.map((pregunta) => (
                                       <tr key={pregunta.pregunta_id}>
                                          <td className='whitespace-nowrap px-3 py-4 text-sm text-gray-500'>
                                             {pregunta.orden}
                                          </td>
                                          <td className='px-3 py-4 text-sm text-gray-500'>
                                             {pregunta.contenido_previo}
                                          </td>
                                          <td className='px-3 py-4 text-sm text-gray-500'>
                                             {pregunta.pregunta}
                                          </td>
                                          <td className='whitespace-nowrap px-3 py-4 text-sm text-gray-500'>
                                             <span
                                                className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                                                   pregunta.estado === 'ACTIVO'
                                                      ? 'bg-green-100 text-green-800'
                                                      : 'bg-orange-200 text-red-800'
                                                }`}
                                             >
                                                {pregunta.estado}
                                             </span>
                                          </td>
                                          <td className='relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6 flex flex-row justify-center'>
                                             <button
                                                onClick={() => {
                                                   setSelectedPregunta(pregunta);
                                                   setIsModalOpen(true);
                                                }}
                                                className='text-indigo-600 hover:text-indigo-900 mr-4'
                                             >
                                                Editar
                                             </button>
                                             <button
                                                onClick={() =>
                                                   handleToggleEstado(pregunta)
                                                }
                                                className={`${
                                                   pregunta.estado === 'ACTIVO'
                                                      ? 'text-orange-400 hover:text-red-900'
                                                      : 'text-green-600 hover:text-green-900'
                                                }`}
                                             >
                                                {pregunta.estado === 'ACTIVO'
                                                   ? 'Desactivar'
                                                   : 'Activar'}
                                             </button>
                                          </td>
                                       </tr>
                                    ))}
                                 </tbody>
                              </table>
                           )}
                        </div>
                     ))}
                  </div>
               </div>
            </div>
         </div>

         <Modal
            isOpen={isModalOpen}
            onClose={() => {
               setIsModalOpen(false);
               setSelectedPregunta(null);
            }}
            title={selectedPregunta ? 'Editar Pregunta' : 'Agregar Pregunta'}
         >
            <PreguntaForm
               pregunta={selectedPregunta}
               onSubmit={(data) => {
                  setIsModalOpen(false);
                  setSelectedPregunta(null);
                  fetchPreguntas();
               }}
               onCancel={() => {
                  setIsModalOpen(false);
                  setSelectedPregunta(null);
               }}
            />
         </Modal>
      </div>
   );
};

export default Preguntas; 