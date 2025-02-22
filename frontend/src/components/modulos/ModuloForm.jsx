import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

const ModuloForm = ({ modulo, onSubmit, onCancel }) => {
   const [formData, setFormData] = useState({
      nombre: '',
      descripcion: '',
      instructor_id: '',
      duracion: '',
      fecha_inicio: '',
      fecha_fin: '',
   });
   const [instructores, setInstructores] = useState([]);
   const [error, setError] = useState('');
   const { token } = useAuth();

   useEffect(() => {
      // Cargar lista de instructores
      const fetchInstructores = async () => {
         try {
            const response = await fetch(
               'http://localhost:3002/api/instructores',
               {
                  headers: {
                     Authorization: `Bearer ${token}`,
                  },
               }
            );
            const data = await response.json();
            setInstructores(data);
         } catch (err) {
            console.error('Error al cargar instructores:', err);
         }
      };

      fetchInstructores();
   }, [token]);

   useEffect(() => {
      if (modulo) {
         setFormData({
            nombre: modulo.nombre,
            descripcion: modulo.descripcion || '',
            instructor_id: String(modulo.instructor_id),
            duracion: modulo.duracion || '',
            fecha_inicio: modulo.fecha_inicio
               ? modulo.fecha_inicio.split('T')[0]
               : '',
            fecha_fin: modulo.fecha_fin ? modulo.fecha_fin.split('T')[0] : '',
         });
      } else {
         setFormData({
            nombre: '',
            descripcion: '',
            instructor_id: '',
            duracion: '',
            fecha_inicio: '',
            fecha_fin: '',
         });
      }
   }, [modulo]);

   const handleChange = (e) => {
      setFormData({
         ...formData,
         [e.target.name]: e.target.value,
      });
   };

   const handleSubmit = async (e) => {
      //ver que viaja en el body
      console.log(formData);

      e.preventDefault();
      setError('');

      try {
         const response = await fetch(
            `http://localhost:3002/api/modulos${
               modulo ? `/${modulo.modulo_id}` : ''
            }`,
            {
               method: modulo ? 'PUT' : 'POST',
               headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
               },
               body: JSON.stringify(formData),
            }
         );

         if (!response.ok) {
            const data = await response.json();
            throw new Error(data.msg || 'Error al guardar el módulo');
         }

         const data = await response.json();
         onSubmit(data);
      } catch (err) {
         setError(err.message);
      }
   };

   return (
      <form onSubmit={handleSubmit} className='space-y-4'>
         {error && (
            <div className='bg-red-50 border-l-4 border-red-400 p-4'>
               <p className='text-red-700'>{error}</p>
            </div>
         )}

         <div>
            <label
               htmlFor='nombre'
               className='block text-sm font-medium text-gray-700'
            >
               Nombre del Módulo
            </label>
            <input
               type='text'
               name='nombre'
               id='nombre'
               value={formData.nombre}
               onChange={handleChange}
               required
               className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
            />
         </div>

         <div>
            <label
               htmlFor='descripcion'
               className='block text-sm font-medium text-gray-700'
            >
               Descripción
            </label>
            <textarea
               name='descripcion'
               id='descripcion'
               rows={3}
               value={formData.descripcion}
               onChange={handleChange}
               className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
            />
         </div>

         <div>
            <label
               htmlFor='instructor_id'
               className='block text-sm font-medium text-gray-700'
            >
               Instructor
            </label>
            <select
               id='instructor_id'
               name='instructor_id'
               value={formData.instructor_id}
               onChange={handleChange}
               required
               className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
            >
               <option value=''>Selecciona un instructor</option>
               {instructores.map((instructor) => (
                  <option
                     key={instructor.instructor_id}
                     value={instructor.instructor_id}
                  >
                     {instructor.nombre}
                  </option>
               ))}
            </select>
         </div>

         <div>
            <label
               htmlFor='duracion'
               className='block text-sm font-medium text-gray-700'
            >
               Duración (horas)
            </label>
            <input
               type='number'
               name='duracion'
               id='duracion'
               value={formData.duracion}
               onChange={handleChange}
               required
               min='1'
               className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
            />
         </div>

         <div>
            <label
               htmlFor='fecha_inicio'
               className='block text-sm font-medium text-gray-700'
            >
               Fecha de Inicio
            </label>
            <input
               type='date'
               name='fecha_inicio'
               id='fecha_inicio'
               value={formData.fecha_inicio}
               onChange={handleChange}
               required
               className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
            />
         </div>

         <div>
            <label
               htmlFor='fecha_fin'
               className='block text-sm font-medium text-gray-700'
            >
               Fecha de Fin
            </label>
            <input
               type='date'
               name='fecha_fin'
               id='fecha_fin'
               value={formData.fecha_fin}
               onChange={handleChange}
               required
               className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
            />
         </div>

         <div className='flex justify-end space-x-3 pt-4'>
            <button
               type='button'
               onClick={onCancel}
               className='rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2'
            >
               Cancelar
            </button>
            <button
               type='submit'
               className='inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2'
            >
               {modulo ? 'Actualizar' : 'Crear'}
            </button>
         </div>
      </form>
   );
};

export default ModuloForm;
