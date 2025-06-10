import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import Modal from '../../../components/ui/Modal';
import PreguntaForm from '../../../components/preguntas/PreguntaForm';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

const Preguntas = () => {
   const { token } = useAuth();
   const [modulos, setModulos] = useState([]);
   const [preguntas, setPreguntas] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);
   const [moduloActivo, setModuloActivo] = useState(null);
   const [leccionActiva, setLeccionActiva] = useState(null);
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [selectedPregunta, setSelectedPregunta] = useState(null);

   useEffect(() => {
      const fetchModulos = async () => {
         try {
            const response = await fetch(
               'http://localhost:3002/api/modulos/con-lecciones',
               {
                  headers: {
                     Authorization: `Bearer ${token}`,
                  },
               }
            );

            if (!response.ok) {
               throw new Error('Error al cargar módulos');
            }

            const data = await response.json();
            setModulos(data);
         } catch (error) {
            setError(error.message);
         } finally {
            setLoading(false);
         }
      };

      fetchModulos();
   }, [token]);

   const fetchPreguntas = async (leccionId) => {
      try {
         const response = await fetch(
            `http://localhost:3002/api/preguntas/leccion/${leccionId}`,
            {
               headers: {
                  Authorization: `Bearer ${token}`,
               },
            }
         );

         if (!response.ok) {
            throw new Error('Error al cargar preguntas');
         }

         const data = await response.json();
         setPreguntas(data);
      } catch (error) {
         setError(error.message);
      }
   };

   const toggleModulo = (moduloId) => {
      setModuloActivo(moduloActivo === moduloId ? null : moduloId);
      setLeccionActiva(null); // Cerrar lección activa al cambiar de módulo
      setPreguntas([]); // Limpiar preguntas al cambiar de módulo
   };

   const toggleLeccion = async (leccionId) => {
      if (leccionActiva === leccionId) {
         setLeccionActiva(null);
         setPreguntas([]);
      } else {
         setLeccionActiva(leccionId);
         await fetchPreguntas(leccionId);
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

         fetchPreguntas(leccionActiva);
      } catch (error) {
         console.error('Error:', error);
      }
   };

   if (loading) return <div>Cargando...</div>;
   if (error) return <div>Error: {error}</div>;

   return (
      <div className='px-4 sm:px-6 lg:px-8'>
         <div className='sm:flex sm:items-center'>
            <div className='sm:flex-auto'>
               <h1 className='text-2xl font-semibold text-gray-900'>
                  Preguntas por Módulo y Lección
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
                     {modulos.map((modulo) => (
                        <div key={modulo.modulo_id} className='bg-white'>
                           <div
                              className='px-4 py-3 border-b border-gray-200 cursor-pointer hover:bg-gray-50'
                              onClick={() => toggleModulo(modulo.modulo_id)}
                           >
                              <div className='flex items-center justify-between'>
                                 <div>
                                    <h3 className='text-lg font-medium text-gray-900'>
                                       {modulo.titulo}
                                    </h3>
                                 </div>
                                 {moduloActivo === modulo.modulo_id ? (
                                    <ChevronUpIcon className='h-5 w-5' />
                                 ) : (
                                    <ChevronDownIcon className='h-5 w-5' />
                                 )}
                              </div>
                           </div>
                           {moduloActivo === modulo.modulo_id && (
                              <div className='p-4 space-y-2'>
                                 {modulo.lecciones.map((leccion) => (
                                    <div
                                       key={leccion.leccion_id}
                                       className='border rounded-lg bg-gray-100'
                                    >
                                       <button
                                          onClick={() =>
                                             toggleLeccion(leccion.leccion_id)
                                          }
                                          className='w-full flex justify-between items-center p-3 hover:bg-gray-50'
                                       >
                                          <span>{leccion.titulo}</span>
                                          {leccionActiva ===
                                          leccion.leccion_id ? (
                                             <ChevronUpIcon className='h-4 w-4' />
                                          ) : (
                                             <ChevronDownIcon className='h-4 w-4' />
                                          )}
                                       </button>
                                       {leccionActiva ===
                                          leccion.leccion_id && (
                                          <div className='p-3 bg-gray-50'>
                                             {preguntas.length > 0 ? (
                                                preguntas.map((pregunta) => (
                                                   <div
                                                      key={pregunta.pregunta_id}
                                                      className='p-2 bg-white rounded-lg shadow-md mb-2'
                                                   >
                                                      {pregunta.contenido_previo && (
                                                         <p className='text-gray-600 text-sm mb-2'>
                                                            {
                                                               pregunta.contenido_previo
                                                            }
                                                         </p>
                                                      )}
                                                      <p className='font-medium'>
                                                         {pregunta.pregunta}
                                                      </p>
                                                      <div className='flex justify-end mt-2 space-x-2'>
                                                         <button
                                                            onClick={() => {
                                                               setSelectedPregunta(
                                                                  pregunta
                                                               );
                                                               setIsModalOpen(
                                                                  true
                                                               );
                                                            }}
                                                            className='text-indigo-600 hover:text-indigo-900'
                                                         >
                                                            Editar
                                                         </button>
                                                         <button
                                                            onClick={() =>
                                                               handleToggleEstado(
                                                                  pregunta
                                                               )
                                                            }
                                                            className={`${
                                                               pregunta.estado ===
                                                               'ACTIVO'
                                                                  ? 'text-red-600 hover:text-red-900'
                                                                  : 'text-green-600 hover:text-green-900'
                                                            }`}
                                                         >
                                                            {pregunta.estado ===
                                                            'ACTIVO'
                                                               ? 'Desactivar'
                                                               : 'Activar'}
                                                         </button>
                                                      </div>
                                                   </div>
                                                ))
                                             ) : (
                                                <p>
                                                   No hay preguntas para esta
                                                   lección
                                                </p>
                                             )}
                                          </div>
                                       )}
                                    </div>
                                 ))}
                              </div>
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
                  fetchPreguntas(leccionActiva);
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
