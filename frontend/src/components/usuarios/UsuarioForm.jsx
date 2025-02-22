import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

const UsuarioForm = ({ usuario, onSubmit, onCancel }) => {
   const [formData, setFormData] = useState({
      nombre: '',
      email: '',
      password: '',
      rol_id: '',
      pais_id: '',
   });
   const [paises, setPaises] = useState([]);
   const [roles, setRoles] = useState([]);
   const [error, setError] = useState('');
   const { token } = useAuth();

   useEffect(() => {
      const fetchPaises = async () => {
         try {
            const response = await fetch('http://localhost:3002/api/paises');
            const data = await response.json();
            setPaises(data);
         } catch (err) {
            console.error('Error al cargar países:', err);
         }
      };

      const fetchRoles = async () => {
         try {
            const response = await fetch('http://localhost:3002/api/roles', {
               headers: {
                  Authorization: `Bearer ${token}`,
               },
            });
            const data = await response.json();
            setRoles(data);
         } catch (err) {
            console.error('Error al cargar roles:', err);
         }
      };

      fetchPaises();
      fetchRoles();
   }, [token]);

   useEffect(() => {
      if (usuario) {
         setFormData({
            nombre: usuario.nombre,
            email: usuario.email,
            password: '',
            rol_id: usuario.rol_id,
            pais_id: usuario.pais_id,
         });
      }
   }, [usuario]);

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
            `http://localhost:3002/api/users${
               usuario ? `/${usuario.usuario_id}` : ''
            }`,
            {
               method: usuario ? 'PUT' : 'POST',
               headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
               },
               body: JSON.stringify(formData),
            }
         );

         if (!response.ok) {
            const data = await response.json();
            throw new Error(data.msg || 'Error al guardar usuario');
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
               htmlFor='password'
               className='block text-sm font-medium text-gray-700'
            >
               {usuario ? 'Nueva Contraseña (opcional)' : 'Contraseña'}
            </label>
            <input
               type='password'
               name='password'
               id='password'
               value={formData.password}
               onChange={handleChange}
               required={!usuario}
               className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
            />
         </div>

         <div>
            <label
               htmlFor='rol_id'
               className='block text-sm font-medium text-gray-700'
            >
               Rol
            </label>
            <select
               id='rol_id'
               name='rol_id'
               value={formData.rol_id}
               onChange={handleChange}
               required
               className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
            >
               <option value=''>Selecciona un rol</option>
               {roles.map((rol) => (
                  <option key={rol.rol_id} value={rol.rol_id}>
                     {rol.nombre_rol}
                  </option>
               ))}
            </select>
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
               required
               className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
            >
               <option value=''>Selecciona un país</option>
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
               {usuario ? 'Actualizar' : 'Crear'}
            </button>
         </div>
      </form>
   );
};

export default UsuarioForm;
