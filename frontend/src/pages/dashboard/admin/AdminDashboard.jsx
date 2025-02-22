import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
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
   const [totalAlumnos, setTotalAlumnos] = useState(null);
   const [alumnosPorPais, setAlumnosPorPais] = useState([]);
   const [estadisticas, setEstadisticas] = useState({
      total: 0,
      activos: 0,
      inactivos: 0,
      paises: 0,
   });
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);
   const { token } = useAuth();

   const COLORS = ['#10B981', '#EF4444']; // Verde para activos, Rojo para inactivos

   useEffect(() => {
      const fetchData = async () => {
         try {
            // Obtener total de alumnos (activos/inactivos)
            const totalResponse = await fetch(
               'http://localhost:3002/api/alumnos/total',
               {
                  headers: {
                     Authorization: `Bearer ${token}`,
                  },
               }
            );

            if (!totalResponse.ok) {
               const errorData = await totalResponse.text();
               console.error('Respuesta del servidor:', errorData);
               throw new Error('Error al cargar total de alumnos');
            }

            const totalData = await totalResponse.json();
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

            setEstadisticas({
               total: totalData.total || 0,
               activos: totalData.activos || 0,
               inactivos: totalData.inactivos || 0,
               paises: totalData.total_paises || 0,
            });

            // Obtener alumnos por país
            const paisesResponse = await fetch(
               'http://localhost:3002/api/alumnos/por-pais',
               {
                  headers: {
                     Authorization: `Bearer ${token}`,
                  },
               }
            );

            if (!paisesResponse.ok) {
               const errorData = await paisesResponse.text();
               console.error('Error en respuesta de países:', errorData);
               throw new Error('Error al cargar distribución por país');
            }

            const paisesData = await paisesResponse.json();

            // Verificar la estructura de los datos
            if (!Array.isArray(paisesData)) {
               console.error(
                  'Los datos de países no son un array:',
                  paisesData
               );
               setAlumnosPorPais([]);
               return;
            }

            setAlumnosPorPais(paisesData);
         } catch (error) {
            console.error('Error completo:', error);
            setError(error.message);
         } finally {
            setLoading(false);
         }
      };

      fetchData();
   }, [token]);

   if (loading) return <div>Cargando dashboard...</div>;
   if (error) return <div>Error: {error}</div>;

   return (
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
         {/* Tarjetas de Resumen */}
         <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-6'>
            <div className='bg-white rounded-lg shadow p-6'>
               <h3 className='text-lg font-medium text-gray-900'>
                  Total Alumnos
               </h3>
               <p className='mt-2 text-3xl font-bold text-indigo-600'>
                  {estadisticas.total}
               </p>
            </div>
            <div className='bg-white rounded-lg shadow p-6'>
               <h3 className='text-lg font-medium text-gray-900'>
                  Alumnos Activos
               </h3>
               <p className='mt-2 text-3xl font-bold text-green-600'>
                  {estadisticas.activos}
               </p>
            </div>
            <div className='bg-white rounded-lg shadow p-6'>
               <h3 className='text-lg font-medium text-gray-900'>
                  Alumnos Inactivos
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
               <h2 className='text-xl font-semibold mb-4'>Estado de Alumnos</h2>
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
               <h2 className='text-xl font-semibold mb-4'>Alumnos por País</h2>
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
