import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
   const [user, setUser] = useState(null);
   const [token, setToken] = useState(null);
   const [loading, setLoading] = useState(true);

   // Cargar datos de autenticación al iniciar
   useEffect(() => {
      const savedToken = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');

      if (savedToken && savedUser) {
         setToken(savedToken);
         setUser(JSON.parse(savedUser));
      }
      setLoading(false);
   }, []);

   const login = async (email, password) => {
      try {
         const response = await fetch('http://localhost:3002/api/auth/login', {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
         });

         if (!response.ok) {
            throw new Error('Error en la autenticación');
         }

         const data = await response.json();

         // Guardar en localStorage
         localStorage.setItem('token', data.token);
         localStorage.setItem('user', JSON.stringify(data.user));

         // Actualizar estado
         setToken(data.token);
         setUser(data.user);

         return data;
      } catch (error) {
         console.error('Error en login:', error);
         throw error;
      }
   };

   const logout = () => {
      // Limpiar localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      // Limpiar estado
      setToken(null);
      setUser(null);
   };

   if (loading) {
      return <div>Cargando...</div>;
   }

   return (
      <AuthContext.Provider value={{ user, token, login, logout }}>
         {children}
      </AuthContext.Provider>
   );
};

export const useAuth = () => {
   const context = useContext(AuthContext);
   if (!context) {
      throw new Error('useAuth debe ser usado dentro de un AuthProvider');
   }
   return context;
};
