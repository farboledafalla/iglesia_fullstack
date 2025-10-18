// AdminDashboard.jsx: este script se encarga de mostrar el dashboard de los usuarios administradores.

import React, { useState, useEffect } from 'react';
// Se importa el hook useAuth para obtener el estado del contexto de autenticación
import { useAuth } from '../../../context/AuthContext';
// Se importan los componentes de recharts para mostrar los gráficos
import {
   PieChart,
   Pie,
   Cell,
   ResponsiveContainer,
   Legend,
   Tooltip,
   BarChart,
   Bar,
   XAxis,
   YAxis,
   CartesianGrid,
} from 'recharts';

const AdminDashboard = () => {
   // Estado para almacenar el total de alumnos
   const [totalAlumnos, setTotalAlumnos] = useState(null);
   // Estado para almacenar la distribución de alumnos por país
   const [alumnosPorPais, setAlumnosPorPais] = useState([]);
   // Estado para almacenar las estadísticas
   const [estadisticas, setEstadisticas] = useState({
      total: 0,
      activos: 0,
      inactivos: 0,
      paises: 0,
   });
   // Estados de loading y error
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);

   // Obtener el token del contexto de autenticación
   const { token } = useAuth();

   // Verde para activos, Rojo para inactivos
   const COLORS = ['#10B981', '#EF4444'];

   // Obtener datos de la API cada vez que cambie el estado token
   useEffect(() => {
      // Función para obtener datos de la API
      const fetchData = async () => {
         try {
            // Obtener los datos de las tarjetas de la parte superior (Total Alumnos, Alumnos Activos, Alumnos Inactivos y Total Paises)
            const totalResponse = await fetch(
               'http://localhost:3002/api/users/total',
               {
                  headers: {
                     Authorization: `Bearer ${token}`,
                  },
               }
            );

            // Si la respuesta no es ok, lanzar un error
            if (!totalResponse.ok) {
               const errorData = await totalResponse.text();
               console.error('Respuesta del servidor:', errorData);
               throw new Error('Error al cargar total de alumnos y países');
            }

            // En la variable totalData se almacenan los datos de la API que es un objeto con el total, activos, inactivos y total de paises
            const totalData = await totalResponse.json();
            // Se almacenan los datos en el estado totalAlumnos con activos e inactivos, esta es para graficar el gráfico de pastel de Estado Alumnos
            setTotalAlumnos([
               {
                  name: 'Activos',
                  value: totalData.activos || 0,
               },
               {
                  name: 'Inactivos',
                  value: totalData.inactivos || 0,
               },
            ]);

            // Actualizar estadísticas con el objeto que nos llega de la API, esta es para mostrar el total de alumnos, activos, inactivos y total de paises en las tarjetas de resumen
            setEstadisticas({
               total: totalData.total || 0,
               activos: totalData.activos || 0,
               inactivos: totalData.inactivos || 0,
               paises: totalData.total_paises || 0,
            });

            // Obtener alumnos por país, aquí se espera un array con objetos que contienen el nombre del país y la cantidad de alumnos
            const paisesResponse = await fetch(
               'http://localhost:3002/api/users/por-pais',
               {
                  headers: {
                     Authorization: `Bearer ${token}`,
                  },
               }
            );

            // Si la respuesta no es ok, lanzar un error
            if (!paisesResponse.ok) {
               const errorData = await paisesResponse.text();
               console.error('Error en respuesta de países:', errorData);
               throw new Error('Error al cargar distribución por país');
            }

            // En la variable paisesData se almacenan los datos de la API que es un array con objetos que contienen el nombre del país y la cantidad de alumnos, usamos .json() para convertir la respuesta en un objeto
            const paisesData = await paisesResponse.json();

            // Verificar la estructura de los datos, se valida que si sea un array, si no es un array, se retorna un array vacío. Al no ser un array generaría un error en el frontend porque el estado alumnosPorPais se definió como un array y no un objeto.
            if (!Array.isArray(paisesData)) {
               console.error(
                  'Los datos de países no son un array:',
                  paisesData
               );
               setAlumnosPorPais([]);
               return;
            }

            // Actualizar el estado con los datos de los países
            setAlumnosPorPais(paisesData);
         } catch (error) {
            console.error('Error completo:', error);
            setError(error.message);
         } finally {
            setLoading(false);
         }
      };

      // Llamar a la función para obtener datos
      fetchData();
   }, [token]);

   if (loading) return <div>Cargando dashboard...</div>;
   if (error) return <div>Error: {error}</div>;

   return (
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
         {/* Tarjetas de Resumen */}
         <div className='sm:flex-auto mb-4'>
            <h1 className='text-2xl font-semibold text-gray-900'>Usuarios</h1>
         </div>

         <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-6'>
            <div className='bg-white rounded-lg shadow p-6'>
               <h3 className='text-lg font-medium text-gray-900'>
                  Total Usuarios
               </h3>
               <p className='mt-2 text-3xl font-bold text-indigo-600'>
                  {estadisticas.total}
               </p>
            </div>
            <div className='bg-white rounded-lg shadow p-6'>
               <h3 className='text-lg font-medium text-gray-900'>
                  Usuarios Activos
               </h3>
               <p className='mt-2 text-3xl font-bold text-green-600'>
                  {estadisticas.activos}
               </p>
            </div>
            <div className='bg-white rounded-lg shadow p-6'>
               <h3 className='text-lg font-medium text-gray-900'>
                  Usuarios Inactivos
               </h3>
               <p className='mt-2 text-3xl font-bold text-red-600'>
                  {estadisticas.inactivos}
               </p>
            </div>
            <div className='bg-white rounded-lg shadow p-6'>
               <h3 className='text-lg font-medium text-gray-900'>
                  Total Países
               </h3>
               <p className='mt-2 text-3xl font-bold text-yellow-600'>
                  {estadisticas.paises}
               </p>
            </div>
         </div>

         {/* Gráficas */}
         <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            {/* Gráfico de Estado de Alumnos */}
            <div className='bg-white rounded-lg shadow p-6'>
               <h2 className='text-xl font-semibold mb-4'>
                  Estado de Usuarios
               </h2>
               <div className='h-80'>
                  <ResponsiveContainer width='100%' height='100%'>
                     <PieChart>
                        <Pie
                           data={totalAlumnos}
                           cx='50%'
                           cy='50%'
                           labelLine={false}
                           outerRadius={80}
                           fill='#8884d8'
                           dataKey='value'
                           label={({ name, percent }) =>
                              `${name}: ${(percent * 100).toFixed(0)}%`
                           }
                        >
                           {totalAlumnos.map((entry, index) => (
                              <Cell
                                 key={`cell-${index}`}
                                 fill={COLORS[index % COLORS.length]}
                              />
                           ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                     </PieChart>
                  </ResponsiveContainer>
               </div>
            </div>

            {/* Gráfico de Alumnos por País */}
            <div className='bg-white rounded-lg shadow p-6'>
               <h2 className='text-xl font-semibold mb-4'>Usuarios por País</h2>
               <div className='h-80'>
                  <ResponsiveContainer width='100%' height='100%'>
                     <BarChart
                        data={alumnosPorPais}
                        margin={{
                           top: 5,
                           right: 30,
                           left: 20,
                           bottom: 5,
                        }}
                     >
                        <CartesianGrid strokeDasharray='3 3' />
                        <XAxis
                           dataKey='pais'
                           angle={-45}
                           textAnchor='end'
                           height={60}
                        />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar
                           dataKey='cantidad'
                           fill='#6366F1'
                           name='Cantidad de Alumnos'
                        />
                     </BarChart>
                  </ResponsiveContainer>
               </div>
            </div>
         </div>
      </div>
   );
};

export default AdminDashboard;
