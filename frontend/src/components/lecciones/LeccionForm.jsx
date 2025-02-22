import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

const LeccionForm = ({ leccion, onSubmit, onCancel }) => {
   const [formData, setFormData] = useState({
      titulo_leccion: '',
      contenido: '',
      modulo_id: '',
   });
   const [modulos, setModulos] = useState([]);
   const [error, setError] = useState('');
   const { token } = useAuth();

   useEffect(() => {
      fetchModulos();
   }, [token]);

   useEffect(() => {
      if (leccion) {
         setFormData({
            titulo_leccion: leccion.titulo_leccion,
            contenido: leccion.contenido,
            modulo_id: String(leccion.modulo_id),
         });
      } else {
         setFormData({
            titulo_leccion: '',
            contenido: '',
            modulo_id: '',
         });
      }
   }, [leccion]);

   const fetchModulos = async () => {
      try {
         const response = await fetch('http://localhost:3002/api/modulos', {
            headers: {
               Authorization: `Bearer ${token}`,
            },
         });
         const data = await response.json();
         setModulos(data);
      } catch (err) {
         console.error('Error al cargar módulos:', err);
      }
   };

   const handleChange = (e) => {
      setFormData({
         ...formData,
         [e.target.name]: e.target.value,
      });
   };

   const handleSubmit = async (e) => {
      e.preventDefault();
      setError('');

      try {
         const response = await fetch(
            `http://localhost:3002/api/lecciones${
               leccion ? `/${leccion.leccion_id}` : ''
            }`,
            {
               method: leccion ? 'PUT' : 'POST',
               headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
               },
               body: JSON.stringify(formData),
            }
         );

         if (!response.ok) {
            throw new Error('Error al guardar la lección');
         }

         onSubmit(formData);
      } catch (error) {
         console.error('Error:', error);
         setError(error.message);
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
               htmlFor='titulo_leccion'
               className='block text-sm font-medium text-gray-700'
            >
               Título de la Lección
            </label>
            <input
               type='text'
               name='titulo_leccion'
               id='titulo_leccion'
               value={formData.titulo_leccion}
               onChange={handleChange}
               required
               className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
            />
         </div>

         <div>
            <label
               htmlFor='modulo_id'
               className='block text-sm font-medium text-gray-700'
            >
               Módulo
            </label>
            <select
               name='modulo_id'
               id='modulo_id'
               value={formData.modulo_id}
               onChange={handleChange}
               required
               className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
            >
               <option value=''>Selecciona un módulo</option>
               {modulos.map((modulo) => (
                  <option key={modulo.modulo_id} value={modulo.modulo_id}>
                     {modulo.nombre}
                  </option>
               ))}
            </select>
         </div>

         <div>
            <label
               htmlFor='contenido'
               className='block text-sm font-medium text-gray-700'
            >
               Contenido
            </label>
            <textarea
               name='contenido'
               id='contenido'
               rows={4}
               value={formData.contenido}
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
               {leccion ? 'Actualizar' : 'Crear'}
            </button>
         </div>
      </form>
   );
};

export default LeccionForm;
