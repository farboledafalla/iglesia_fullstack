import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import {
   PieChart,
   Pie,
   Cell,
   ResponsiveContainer,
   Legend,
   Tooltip,
} from 'recharts';
import { Navigate } from 'react-router-dom';

// Definir la constante RADIAN
const RADIAN = Math.PI / 180;

const StudentDashboard = () => {
   const [progresoData, setProgresoData] = useState([]);
   const { token, user } = useAuth();
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);
   const COLORS = ['#10B981', '#6366F1', '#F59E0B'];

   useEffect(() => {
      const fetchData = async () => {
         if (!user?.id || !token) {
            setLoading(false);
            return;
         }

         try {
            const progresoResponse = await fetch(
               `http://localhost:3002/api/progreso-alumnos/${user.alumno_id}`,
               {
                  headers: {
                     Authorization: `Bearer ${token}`,
                  },
               }
            );

            if (!progresoResponse.ok) {
               const errorData = await progresoResponse.json();
               throw new Error(errorData.msg || 'Error al cargar el progreso');
            }

            const progresoData = await progresoResponse.json();

            const progressData = [
               {
                  name: 'Completados',
                  value: progresoData.modulos_completados || 2,
               },
               {
                  name: 'En Progreso',
                  value: progresoData.modulos_en_progreso || 1,
               },
               {
                  name: 'Pendientes',
                  value: progresoData.modulos_pendientes || 1,
               },
            ];

            setProgresoData(progressData);
         } catch (error) {
            console.error('Error al cargar datos:', error);
            setError(error.message || 'Error al cargar los datos');
         } finally {
            setLoading(false);
         }
      };

      fetchData();
   }, [user?.id, token]);

   if (!user) {
      return <Navigate to='/login' replace />;
   }

   if (loading) {
      return <div>Cargando dashboard...</div>;
   }

   if (error) {
      return <div>Error: {error}</div>;
   }

   return (
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
         {/* Progreso del Estudiante */}
         <div className='bg-white rounded-lg shadow p-6'>
            <h2 className='text-2xl font-bold text-gray-900 mb-4'>
               Mi Progreso
            </h2>
            <div className='h-80'>
               <ResponsiveContainer width='100%' height='100%'>
                  <PieChart>
                     <Pie
                        data={progresoData}
                        cx='50%'
                        cy='50%'
                        labelLine={false}
                        outerRadius={80}
                        fill='#8884d8'
                        dataKey='value'
                        label={({
                           cx,
                           cy,
                           midAngle,
                           innerRadius,
                           outerRadius,
                           percent,
                        }) => {
                           const radius =
                              innerRadius + (outerRadius - innerRadius) * 0.5;
                           const x = cx + radius * Math.cos(-midAngle * RADIAN);
                           const y = cy + radius * Math.sin(-midAngle * RADIAN);
                           return (
                              <text
                                 x={x}
                                 y={y}
                                 fill='white'
                                 textAnchor={x > cx ? 'start' : 'end'}
                                 dominantBaseline='central'
                              >
                                 {`${(percent * 100).toFixed(0)}%`}
                              </text>
                           );
                        }}
                     >
                        {progresoData.map((entry, index) => (
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
      </div>
   );
};

export default StudentDashboard;
