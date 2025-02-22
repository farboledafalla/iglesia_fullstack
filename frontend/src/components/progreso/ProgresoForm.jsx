import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

const ProgresoForm = ({ progreso, onSubmit, onCancel }) => {
   const [formData, setFormData] = useState({
      alumno_id: '',
      leccion_id: '',
      completado: false,
      fecha_completado: new Date().toISOString().split('T')[0],
   });
   const [alumnos, setAlumnos] = useState([]);
   const [modulos, setModulos] = useState([]);
   const [lecciones, setLecciones] = useState([]);
   const [selectedModulo, setSelectedModulo] = useState('');
   const [error, setError] = useState('');
   const { token } = useAuth();

   // Cargar alumnos
   useEffect(() => {
      const fetchAlumnos = async () => {
         try {
            const response = await fetch('http://localhost:3002/api/alumnos', {
               headers: {
                  Authorization: `Bearer ${token}`,
               },
            });
            const data = await response.json();
            setAlumnos(data);
         } catch (err) {
            console.error('Error al cargar alumnos:', err);
         }
      };

      fetchAlumnos();
   }, [token]);

   // Cargar módulos
   useEffect(() => {
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

      fetchModulos();
   }, [token]);

   // Cargar lecciones cuando se selecciona un módulo
   useEffect(() => {
      const fetchLecciones = async () => {
         if (!selectedModulo) {
            setLecciones([]);
            return;
         }

         try {
            const response = await fetch(
               `http://localhost:3002/api/lecciones/modulo/${selectedModulo}`,
               {
                  headers: {
                     Authorization: `Bearer ${token}`,
                  },
               }
            );
            const data = await response.json();
            setLecciones(data);
         } catch (err) {
            console.error('Error al cargar lecciones:', err);
         }
      };

      fetchLecciones();
   }, [selectedModulo, token]);

   // Cargar datos si es edición
   useEffect(() => {
      if (progreso) {
         setFormData({
            alumno_id: progreso.alumno_id,
            leccion_id: progreso.leccion_id,
            completado: progreso.completado,
            fecha_completado: new Date(progreso.fecha_completado)
               .toISOString()
               .split('T')[0],
         });
         setSelectedModulo(progreso.modulo_id);
      }
   }, [progreso]);

   const handleChange = (e) => {
      const value =
         e.target.type === 'checkbox'
            ? e.target.checked
            : e.target.value;
      setFormData({
         ...formData,
         [e.target.name]: value,
      });
   };

   const handleModuloChange = (e) => {
      setSelectedModulo(e.target.value);
      setFormData({
         ...formData,
         leccion_id: '',
      });
   };

   const handleSubmit = async (e) => {
      e.preventDefault();
      setError('');

      try {
         const response = await fetch(
            `http://localhost:3002/api/progreso-alumnos${
               progreso ? `/${progreso.id}` : ''
            }`,
            {
               method: progreso ? 'PUT' : 'POST',
               headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
               },
               body: JSON.stringify(formData),
            }
         );

         if (!response.ok) {
            throw new Error('Error al guardar el progreso');
         }

         const data = await response.json();
         onSubmit(data);
      } catch (err) {
         setError(err.message);
      }
   };

   return (
      <form onSubmit={handleSubmit} className="space-y-4">
         {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4">
               <p className="text-red-700">{error}</p>
            </div>
         )}

         <div>
            <label
               htmlFor="alumno_id"
               className="block text-sm font-medium text-gray-700"
            >
               Alumno
            </label>
            <select
               id="alumno_id"
               name="alumno_id"
               value={formData.alumno_id}
               onChange={handleChange}
               required
               className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
               <option value="">Selecciona un alumno</option>
               {alumnos.map((alumno) => (
                  <option key={alumno.id} value={alumno.id}>
                     {alumno.nombre}
                  </option>
               ))}
            </select>
         </div>

         <div>
            <label
               htmlFor="modulo"
               className="block text-sm font-medium text-gray-700"
            >
               Módulo
            </label>
            <select
               id="modulo"
               value={selectedModulo}
               onChange={handleModuloChange}
               required
               className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
               <option value="">Selecciona un módulo</option>
               {modulos.map((modulo) => (
                  <option key={modulo.id} value={modulo.id}>
                     {modulo.nombre_modulo}
                  </option>
               ))}
            </select>
         </div>

         <div>
            <label
               htmlFor="leccion_id"
               className="block text-sm font-medium text-gray-700"
            >
               Lección
            </label>
            <select
               id="leccion_id"
               name="leccion_id"
               value={formData.leccion_id}
               onChange={handleChange}
               required
               className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
               <option value="">Selecciona una lección</option>
               {lecciones.map((leccion) => (
                  <option key={leccion.id} value={leccion.id}>
                     {leccion.titulo_leccion}
                  </option>
               ))}
            </select>
         </div>

         <div className="flex items-center">
            <input
               id="completado"
               name="completado"
               type="checkbox"
               checked={formData.completado}
               onChange={handleChange}
               className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label
               htmlFor="completado"
               className="ml-2 block text-sm text-gray-900"
            >
               Lección completada
            </label>
         </div>

         <div>
            <label
               htmlFor="fecha_completado"
               className="block text-sm font-medium text-gray-700"
            >
               Fecha de completado
            </label>
            <input
               type="date"
               name="fecha_completado"
               id="fecha_completado"
               value={formData.fecha_completado}
               onChange={handleChange}
               required
               className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
         </div>

         <div className="flex justify-end space-x-3 pt-4">
            <button
               type="button"
               onClick={onCancel}
               className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
               Cancelar
            </button>
            <button
               type="submit"
               className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
               {progreso ? 'Actualizar' : 'Registrar'}
            </button>
         </div>
      </form>
   );
};

export default ProgresoForm; 