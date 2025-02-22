import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

const PreguntaForm = ({ pregunta, onSubmit, onCancel }) => {
   const [formData, setFormData] = useState({
      leccion_id: '',
      contenido_previo: '',
      pregunta: '',
      orden: '',
   });
   const [lecciones, setLecciones] = useState([]);
   const [error, setError] = useState('');
   const { token } = useAuth();

   useEffect(() => {
      fetchLecciones();
   }, [token]);

   useEffect(() => {
      if (pregunta) {
         setFormData({
            leccion_id: String(pregunta.leccion_id),
            contenido_previo: pregunta.contenido_previo,
            pregunta: pregunta.pregunta,
            orden: String(pregunta.orden),
         });
      } else {
         setFormData({
            leccion_id: '',
            contenido_previo: '',
            pregunta: '',
            orden: '',
         });
      }
   }, [pregunta]);

   const fetchLecciones = async () => {
      try {
         const response = await fetch('http://localhost:3002/api/lecciones', {
            headers: {
               Authorization: `Bearer ${token}`,
            },
         });
         const data = await response.json();
         setLecciones(data);
      } catch (err) {
         console.error('Error al cargar lecciones:', err);
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
         const url = pregunta
            ? `http://localhost:3002/api/preguntas/${pregunta.pregunta_id}`
            : 'http://localhost:3002/api/preguntas';

         const response = await fetch(url, {
            method: pregunta ? 'PUT' : 'POST',
            headers: {
               'Content-Type': 'application/json',
               Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(formData),
         });

         if (!response.ok) {
            throw new Error('Error al guardar la pregunta');
         }

         onSubmit(formData);
      } catch (error) {
         console.error('Error:', error);
         setError('Error al guardar la pregunta');
      }
   };

   return (
      <form onSubmit={handleSubmit} className='space-y-6'>
         {error && (
            <div className='text-red-600 text-sm font-medium'>{error}</div>
         )}

         <div>
            <label
               htmlFor='leccion_id'
               className='block text-sm font-medium text-gray-700'
            >
               Lección
            </label>
            <select
               name='leccion_id'
               id='leccion_id'
               value={formData.leccion_id}
               onChange={handleChange}
               required
               className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
            >
               <option value=''>Selecciona una lección</option>
               {lecciones.map((leccion) => (
                  <option key={leccion.leccion_id} value={leccion.leccion_id}>
                     {leccion.titulo_leccion}
                  </option>
               ))}
            </select>
         </div>

         <div>
            <label
               htmlFor='contenido_previo'
               className='block text-sm font-medium text-gray-700'
            >
               Contenido Previo
            </label>
            <textarea
               name='contenido_previo'
               id='contenido_previo'
               rows={4}
               value={formData.contenido_previo}
               onChange={handleChange}
               required
               className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
            />
         </div>

         <div>
            <label
               htmlFor='pregunta'
               className='block text-sm font-medium text-gray-700'
            >
               Pregunta
            </label>
            <textarea
               name='pregunta'
               id='pregunta'
               rows={3}
               value={formData.pregunta}
               onChange={handleChange}
               required
               className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
            />
         </div>

         <div>
            <label
               htmlFor='orden'
               className='block text-sm font-medium text-gray-700'
            >
               Orden
            </label>
            <input
               type='number'
               name='orden'
               id='orden'
               value={formData.orden}
               onChange={handleChange}
               required
               min='1'
               className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
            />
         </div>

         <div className='flex justify-end space-x-3'>
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
               {pregunta ? 'Actualizar' : 'Crear'}
            </button>
         </div>
      </form>
   );
};

export default PreguntaForm; 