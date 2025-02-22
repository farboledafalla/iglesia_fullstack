import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

const AlumnoForm = ({ alumno, onSubmit, onCancel }) => {
   const { token } = useAuth();
   const [formData, setFormData] = useState({
      nombre: '',
      email: '',
      telefono: '',
      pais_id: '',
   });
   const [paises, setPaises] = useState([]);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      const fetchPaises = async () => {
         try {
            const response = await fetch('http://localhost:3002/api/paises', {
               headers: {
                  Authorization: `Bearer ${token}`,
               },
            });
            const data = await response.json();
            setPaises(data);
         } catch (error) {
            console.error('Error al cargar países:', error);
         } finally {
            setLoading(false);
         }
      };

      fetchPaises();
   }, [token]);

   // Inicializar el formulario cuando se recibe el alumno
   useEffect(() => {
      if (alumno) {
         setFormData({
            nombre: alumno.nombre || '',
            email: alumno.email || '',
            telefono: alumno.telefono || '',
            pais_id: alumno.pais_id || '', // Usar el pais_id del alumno
         });
      }
   }, [alumno]);

   const handleChange = (e) => {
      setFormData({
         ...formData,
         [e.target.name]: e.target.value,
      });
   };

   const handleSubmit = async (e) => {
      e.preventDefault();

      try {
         const url = alumno
            ? `http://localhost:3002/api/alumnos/${alumno.alumno_id}`
            : 'http://localhost:3002/api/alumnos';

         const method = alumno ? 'PUT' : 'POST';

         const response = await fetch(url, {
            method: method,
            headers: {
               'Content-Type': 'application/json',
               Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(formData),
         });

         if (!response.ok) {
            throw new Error('Error al guardar el alumno');
         }

         const data = await response.json();
         onSubmit(data);
      } catch (error) {
         console.error('Error:', error);
         // Aquí podrías mostrar un mensaje de error al usuario
      }
   };

   if (loading) {
      return (
         <div className='flex justify-center items-center'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600'></div>
            <span className='ml-2'>Cargando países...</span>
         </div>
      );
   }

   return (
      <form onSubmit={handleSubmit} className='space-y-6'>
         <div>
            <label
               htmlFor='nombre'
               className='block text-sm font-medium text-gray-700'
            >
               Nombre
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
               htmlFor='email'
               className='block text-sm font-medium text-gray-700'
            >
               Email
            </label>
            <input
               type='email'
               name='email'
               id='email'
               value={formData.email}
               onChange={handleChange}
               required
               className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
            />
         </div>

         <div>
            <label
               htmlFor='telefono'
               className='block text-sm font-medium text-gray-700'
            >
               Teléfono
            </label>
            <input
               type='tel'
               name='telefono'
               id='telefono'
               value={formData.telefono}
               onChange={handleChange}
               className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
            />
         </div>

         <div>
            <label
               htmlFor='pais_id'
               className='block text-sm font-medium text-gray-700'
            >
               País
            </label>
            <select
               id='pais_id'
               name='pais_id'
               value={formData.pais_id}
               onChange={handleChange}
               className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
            >
               <option value=''>Seleccione un país</option>
               {paises.map((pais) => (
                  <option key={pais.pais_id} value={pais.pais_id}>
                     {pais.nombre_pais}
                  </option>
               ))}
            </select>
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
               {alumno ? 'Actualizar' : 'Crear'}
            </button>
         </div>
      </form>
   );
};

export default AlumnoForm;
