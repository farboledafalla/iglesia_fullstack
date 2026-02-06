//AlumnoForm.jsx: este script define el formulario para crear y editar usuarios.

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { use } from 'react';

//Las 3 propiedades que recibe el componente son:  alumno, onSubmit y onCancel. alumno es el alumno que se va a editar, onSubmit es una función que se ejecuta cuando se guarda el alumno y onCancel es una función que se ejecuta cuando se cancela la edición o creación del alumno.
const AlumnoForm = ({ alumno, onSubmit, onCancel }) => {
   const { token } = useAuth();
   const [formData, setFormData] = useState({
      usuario_id: '',
      identificacion: '',
      nombre: '',
      email: '',
      telefono: '',
      pais_id: '',
   });
   const [paises, setPaises] = useState([]);
   const [usuarios, setUsuarios] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState('');
   const [usuarioTieneAlumno, setUsuarioTieneAlumno] = useState(false);
   const [alumnoExistente, setAlumnoExistente] = useState(null);
   const [identificacionSoloLectura, setIdentificacionSoloLectura] =
      useState(false);
   const [nombreSoloLectura, setNombreSoloLectura] = useState(false);
   const [emailSoloLectura, setEmailSoloLectura] = useState(false);
   const [telefonoSoloLectura, setTelefonoSoloLectura] = useState(false);
   const [paisSoloLectura, setPaisSoloLectura] = useState(false);
   const [botonCrearSoloLectura, setBotonCrearSoloLectura] = useState(false);

   const inputIdentificacionRef = useRef(null);
   const inputTelefonoRef = useRef(null);
   const inputNombreRef = useRef(null);

   //Logs para depuración
   console.log('AlumnoForm - alumno prop:', alumno);

   useEffect(() => {
      if (!alumno) {
         //Cambia valor de soloLectura al cargar el componente
         setIdentificacionSoloLectura(true);
         setNombreSoloLectura(true);
         setEmailSoloLectura(true);
         setTelefonoSoloLectura(true);
         setPaisSoloLectura(true);
         setBotonCrearSoloLectura(true);
      }
   }, []);

   // Cargar países al iniciar
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

      const fetchUsuarios = async () => {
         try {
            const response = await fetch('http://localhost:3002/api/users', {
               headers: {
                  Authorization: `Bearer ${token}`,
               },
            });
            const data = await response.json();
            setUsuarios(data);
         } catch (error) {
            console.error('Error al cargar usuarios:', error);
         } finally {
            setLoading(false);
         }
      };

      fetchPaises();
      fetchUsuarios();
   }, [token]);

   // Inicializar el formulario cuando se recibe el alumno en la propiedad value (value={formData.nombre}) del formulario.
   useEffect(() => {
      if (alumno) {
         setFormData({
            usuario_id: alumno.usuario_id || '',
            identificacion: alumno.identificacion || '',
            nombre: alumno.nombre || '',
            email: alumno.email || '',
            telefono: alumno.telefono || '',
            pais_id: alumno.pais_id || '', // Usar el pais_id del alumno
         });

         // Esperar un poco para superar la animación del modal y asegurar que el input esté montado
         setTimeout(() => {
            try {
               inputTelefonoRef.current?.focus();
            } catch (e) {
               // ignore
            }
         }, 50);
      }
   }, [alumno]);

   const handleChange = (e) => {
      const { name, value } = e.target;

      // Si se selecciona un usuario, cargar sus datos en el formulario
      if (name === 'usuario_id') {
         setFormData((prev) => {
            // opción vacía: limpiar campos relacionados con el usuario
            if (!value) {
               return {
                  ...prev,
                  usuario_id: '',
                  nombre: '',
                  email: '',
                  pais_id: '',
               };
            }

            // buscar el usuario seleccionado en la lista ya cargada
            const selected = usuarios.find(
               (u) => String(u.usuario_id) === String(value)
            );

            if (!selected) {
               // si por alguna razón no está (p. ej. aún cargando), solo setear id
               return {
                  ...prev,
                  usuario_id: value,
               };
            }

            // Verificar en backend si ese usuario ya tiene un alumno
            (async () => {
               try {
                  const resp = await fetch(
                     `http://localhost:3002/api/alumnos/by-usuario/${selected.usuario_id}`,
                     {
                        headers: { Authorization: `Bearer ${token}` },
                     }
                  );
                  const json = await resp.json();
                  setUsuarioTieneAlumno(Boolean(json.exists));
                  setAlumnoExistente(json.alumno ?? null);
               } catch (err) {
                  console.error('Error verificando alumno existente:', err);
                  setUsuarioTieneAlumno(false);
                  setAlumnoExistente(null);
               }
            })();

            // Volcar datos del usuario en el formulario (no borra otros campos)
            return {
               ...prev,
               usuario_id: selected.usuario_id,
               nombre: selected.nombre ?? prev.nombre,
               email: selected.email ?? prev.email,
               pais_id: selected.pais_id ?? prev.pais_id,
            };
         });

         //Volver valor a false para poder editar campos nuevamente
         setIdentificacionSoloLectura(false);
         setTelefonoSoloLectura(false);
         setBotonCrearSoloLectura(false);

         inputIdentificacionRef.current.focus();

         return;
      }

      // manejo normal para otros campos
      setFormData((prev) => ({ ...prev, [name]: value }));
   };

   const handleSubmit = async (e) => {
      e.preventDefault();

      try {
         const url = alumno
            ? `http://localhost:3002/api/alumnos/${alumno.alumno_id}`
            : 'http://localhost:3002/api/alumnos';

         const method = alumno ? 'PUT' : 'POST';
         const payload = {
            usuario_id: formData.usuario_id,
            identificacion: formData.identificacion,
            telefono: formData.telefono,
         };

         const response = await fetch(url, {
            method: method,
            headers: {
               'Content-Type': 'application/json',
               Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
         });

         const data = await response.json();

         if (!response.ok) {
            // Mostrar el mensaje que envía el backend si existe
            setError(data.msg || data.error || 'Error al guardar el alumno');
            return;
         }

         // Limpia error previo y devuelve la data al padre
         setError('');
         onSubmit(data);

         //Volver valor a false para poder editar campos nuevamente
         setTelefonoSoloLectura(false);
         setBotonCrearSoloLectura(false);
      } catch (error) {
         console.error('Error:', error);
         setError(error.message || 'Error al guardar el alumno');
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

   // Función para manejar el evento de tecla en el primer input (identificación)
   const handleIdentificacionKeyDown = (e) => {
      if (e.key === 'Tab') {
         e.preventDefault(); // Evitar el tabulador normal
         inputTelefonoRef.current.focus(); // Mover el foco al segundo input
      }
   };

   // Función para manejar el evento de tecla en el botón crear/actualizar
   const handleSubmitButtonKeyDown = (e) => {
      if (e.key === 'Tab') {
         e.preventDefault(); // Evitar el tabulador normal
         inputIdentificacionRef.current.focus(); // Mover el foco al primer input
      }
   };

   return (
      <form onSubmit={handleSubmit} className='space-y-6'>
         {/* (Listado de usuarios) Crear un alumno */}
         {alumno ? null : (
            <>
               <label
                  htmlFor='usuario_id'
                  className='block text-sm font-medium text-gray-700'
               >
                  Usuario
               </label>
               <select
                  id='usuario_id'
                  name='usuario_id'
                  value={formData.usuario_id}
                  onChange={handleChange}
                  required
                  className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
               >
                  <option value=''>Selecciona un usuario</option>
                  {usuarios.map((usuario) => (
                     <option
                        key={usuario.usuario_id}
                        value={usuario.usuario_id}
                     >
                        {usuario.nombre}
                     </option>
                  ))}
               </select>
            </>
         )}

         {usuarioTieneAlumno && (
            <div className='bg-yellow-50 border-l-4 border-yellow-400 p-4'>
               <p className='text-yellow-800'>
                  Este usuario ya tiene un alumno asociado. No podrá crear un
                  nuevo alumno para el mismo usuario.
               </p>
            </div>
         )}

         {/* (identificacion) Editar alumno */}
         <div>
            <label
               htmlFor='identificacion'
               className='block text-sm font-medium text-gray-700 mt-3'
            >
               Identificacion
            </label>
            <input
               type='text'
               name='identificacion'
               id='identificacion'
               ref={inputIdentificacionRef}
               value={formData.identificacion}
               onKeyDown={handleIdentificacionKeyDown}
               onChange={handleChange}
               required
               readOnly={!!identificacionSoloLectura}
               className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                  identificacionSoloLectura
                     ? 'bg-gray-100 focus:border-gray-300 focus:ring-gray-300 text-gray-600 cursor-not-allowed'
                     : ''
               }`}
            />
         </div>

         {/* (nombre) Editar alumno */}
         {!!formData.usuario_id && alumno ? (
            <div>
               <label
                  htmlFor='nombre'
                  className='block text-sm font-medium text-gray-700 mt-3'
               >
                  Nombre
               </label>
               <input
                  type='text'
                  name='nombre'
                  id='nombre'
                  ref={inputNombreRef}
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                  readOnly={!!formData.usuario_id && alumno}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                     !!formData.usuario_id && alumno
                        ? 'bg-gray-100 focus:border-gray-300 focus:ring-gray-300 text-gray-600 cursor-not-allowed'
                        : ''
                  }`}
               />
            </div>
         ) : (
            <div>
               <label
                  htmlFor='nombre'
                  className='block text-sm font-medium text-gray-700 mt-3'
               >
                  Nombre
               </label>
               <input
                  type='text'
                  name='nombre'
                  id='nombre'
                  ref={inputNombreRef}
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                  readOnly={nombreSoloLectura}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                     nombreSoloLectura
                        ? 'bg-gray-100 focus:border-gray-300 focus:ring-gray-300 text-gray-600 cursor-not-allowed'
                        : ''
                  }`}
               />
            </div>
         )}

         {/* Cuando se va a editar un alumno */}
         {alumno ? null : (
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
                  readOnly={emailSoloLectura}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                     emailSoloLectura
                        ? 'bg-gray-100 focus:border-gray-300 focus:ring-gray-300 text-gray-600 cursor-not-allowed'
                        : ''
                  }`}
               />
            </div>
         )}

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
               ref={inputTelefonoRef}
               readOnly={telefonoSoloLectura}
               onChange={handleChange}
               className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                  telefonoSoloLectura
                     ? 'bg-gray-100 focus:border-gray-300 focus:ring-gray-300 text-gray-600 cursor-not-allowed'
                     : ''
               }`}
            />
         </div>

         {alumno ? null : (
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
                  disabled={paisSoloLectura}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                     paisSoloLectura
                        ? 'bg-gray-100 focus:border-gray-300 focus:ring-gray-300 text-gray-600 cursor-not-allowed'
                        : ''
                  }`}
               >
                  <option value=''>Seleccione un país</option>
                  {paises.map((pais) => (
                     <option key={pais.pais_id} value={pais.pais_id}>
                        {pais.nombre_pais}
                     </option>
                  ))}
               </select>
            </div>
         )}

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
               disabled={botonCrearSoloLectura}
               onKeyDown={handleSubmitButtonKeyDown}
               className={`inline-flex justify-center rounded-md border border-transparent py-2 px-4 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                  botonCrearSoloLectura
                     ? 'bg-gray-400 cursor-not-allowed'
                     : 'bg-indigo-600 hover:bg-indigo-700'
               }`}
            >
               {alumno ? 'Actualizar' : 'Crear'}
            </button>
         </div>
      </form>
   );
};

export default AlumnoForm;
