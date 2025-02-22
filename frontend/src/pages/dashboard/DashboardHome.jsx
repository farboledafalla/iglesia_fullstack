import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
   UserGroupIcon,
   BookOpenIcon,
   AcademicCapIcon,
   ChartBarIcon,
} from '@heroicons/react/24/outline';
import {
   PieChart,
   Pie,
   Cell,
   BarChart,
   Bar,
   XAxis,
   YAxis,
   CartesianGrid,
   Tooltip,
   Legend,
   ResponsiveContainer,
} from 'recharts';

const DashboardHome = () => {
   const [stats, setStats] = useState({
      totalAlumnos: 0,
      alumnosActivos: 0,
      alumnosInactivos: 0,
   });
   const [alumnosPorPais, setAlumnosPorPais] = useState([]);
   const { token } = useAuth();

   useEffect(() => {
      fetchStats();
      fetchAlumnosPorPais();
   }, [token]);

   const fetchStats = async () => {
      try {
         const response = await fetch(
            'http://localhost:3002/api/alumnos/total',
            {
               headers: {
                  Authorization: `Bearer ${token}`,
               },
            }
         );
         const data = await response.json();
         setStats({
            totalAlumnos: data.total,
            alumnosActivos: data.activos,
            alumnosInactivos: data.inactivos,
         });
      } catch (error) {
         console.error('Error al cargar estadísticas:', error);
      }
   };

   const fetchAlumnosPorPais = async () => {
      try {
         const response = await fetch(
            'http://localhost:3002/api/alumnos/por-pais',
            {
               headers: {
                  Authorization: `Bearer ${token}`,
               },
            }
         );
         const data = await response.json();
         setAlumnosPorPais(data);
      } catch (error) {
         console.error('Error al cargar distribución por país:', error);
      }
   };

   const cards = [
      {
         name: 'Total Alumnos',
         value: stats.totalAlumnos,
         icon: UserGroupIcon,
         color: 'bg-blue-500',
         textColor: 'text-blue-600',
         bgColor: 'bg-blue-100',
      },
      {
         name: 'Alumnos Activos',
         value: stats.alumnosActivos,
         icon: ChartBarIcon,
         color: 'bg-green-500',
         textColor: 'text-green-600',
         bgColor: 'bg-green-100',
      },
      {
         name: 'Alumnos Inactivos',
         value: stats.alumnosInactivos,
         icon: ChartBarIcon,
         color: 'bg-red-500',
         textColor: 'text-red-600',
         bgColor: 'bg-red-100',
      },
   ];

   // Datos para el gráfico circular
   const pieData = [
      { name: 'Activos', value: stats.alumnosActivos },
      { name: 'Inactivos', value: stats.alumnosInactivos },
   ];

   const COLORS = ['#22c55e', '#f97316']; // Verde para activos, naranja para inactivos

   return (
      <div className='px-4 sm:px-6 lg:px-8'>
         <h1 className='text-2xl font-semibold text-gray-900'>Dashboard</h1>

         <div className='mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
            {cards.map((card) => (
               <div
                  key={card.name}
                  className='bg-white overflow-hidden shadow rounded-lg'
               >
                  <div className='p-5'>
                     <div className='flex items-center'>
                        <div className='flex-shrink-0'>
                           <card.icon
                              className={`h-6 w-6 ${card.textColor}`}
                              aria-hidden='true'
                           />
                        </div>
                        <div className='ml-5 w-0 flex-1'>
                           <dl>
                              <dt className='text-sm font-medium text-gray-500 truncate'>
                                 {card.name}
                              </dt>
                              <dd className='flex items-baseline'>
                                 <div className='text-2xl font-semibold text-gray-900'>
                                    {card.value}
                                 </div>
                              </dd>
                           </dl>
                        </div>
                     </div>
                  </div>
                  <div className={`${card.bgColor} px-5 py-3`}>
                     <div className='text-sm'>
                        <span className={`font-medium ${card.textColor}`}>
                           {card.name}
                        </span>
                     </div>
                  </div>
               </div>
            ))}
         </div>

         {/* Gráficas */}
         <div className='mt-8 grid gap-6 sm:grid-cols-2'>
            {/* Gráfico circular */}
            <div className='bg-white p-6 rounded-lg shadow'>
               <h2 className='text-lg font-medium text-gray-900 mb-4'>
                  Distribución de Alumnos
               </h2>
               <ResponsiveContainer width='100%' height={300}>
                  <PieChart>
                     <Pie
                        data={pieData}
                        cx='50%'
                        cy='50%'
                        labelLine={false}
                        label={({
                           cx,
                           cy,
                           midAngle,
                           innerRadius,
                           outerRadius,
                           percent,
                           name,
                        }) => {
                           const radius =
                              innerRadius + (outerRadius - innerRadius) * 0.5;
                           const x =
                              cx +
                              radius * Math.cos(-midAngle * (Math.PI / 180));
                           const y =
                              cy +
                              radius * Math.sin(-midAngle * (Math.PI / 180));
                           return (
                              <text
                                 x={x}
                                 y={y}
                                 fill='white'
                                 textAnchor='middle'
                                 dominantBaseline='central'
                              >
                                 {`${name} ${(percent * 100).toFixed(0)}%`}
                              </text>
                           );
                        }}
                        outerRadius={100}
                        fill='#8884d8'
                        dataKey='value'
                     >
                        {pieData.map((entry, index) => (
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

            {/* Gráfico de barras */}
            <div className='bg-white p-6 rounded-lg shadow'>
               <h2 className='text-lg font-medium text-gray-900 mb-4'>
                  Alumnos por País
               </h2>
               <ResponsiveContainer width='100%' height={300}>
                  <BarChart data={alumnosPorPais}>
                     <CartesianGrid strokeDasharray='3 3' />
                     <XAxis dataKey='pais' />
                     <YAxis />
                     <Tooltip />
                     <Legend />
                     <Bar dataKey='cantidad' fill='#6366f1' />
                  </BarChart>
               </ResponsiveContainer>
            </div>
         </div>
      </div>
   );
};

export default DashboardHome;
