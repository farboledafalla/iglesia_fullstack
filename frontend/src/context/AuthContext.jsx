// AuthContext.jsx: este script se encarga de manejar el estado de autenticación de la aplicación.
import React, { createContext, useContext, useState, useEffect } from 'react';

// Crear el contexto
const AuthContext = createContext();

// Proveedor de autenticación
export const AuthProvider = ({ children }) => {
   // Estado para el usuario, el token y el loading
   const [user, setUser] = useState(null);
   const [token, setToken] = useState(null);
   // Estado para el loading y se establece en true al iniciar para indicador de carga
   const [loading, setLoading] = useState(true);

   // Cargar datos de autenticación al iniciar
   useEffect(() => {
      // Cargar datos de localStorage
      const savedToken = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');

      // Si hay datos en el localstorage, actualizar estados (user y token)
      if (savedToken && savedUser) {
         setToken(savedToken);
         setUser(JSON.parse(savedUser));
      }
      // Establecer loading a false para indicar que la carga ha terminado
      setLoading(false);
   }, []);

   // Función para manejar el login, recibe email y password desde el componente Login para luego enviar al backend
   const login = async (email, password) => {
      try {
         // Petición tipo POST a la API de autenticación enviando el email y password al backend puntualmente a la ruta (/api/auth/login)
         const response = await fetch('http://localhost:3002/api/auth/login', {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
         });

         // Si la respuesta no es ok, lanzar un error
         if (!response.ok) {
            throw new Error('Error en la autenticación');
         }

         // Obtener datos de respuesta desde el backend
         const data = await response.json();

         // Guardar en localStorage del navegador
         localStorage.setItem('token', data.token);
         localStorage.setItem('user', JSON.stringify(data.user));

         // Actualizar estado con los datos recibidos desde el backend
         setToken(data.token);
         setUser(data.user);

         // Devolver datos de respuesta, se retornan estos datos a (Login.jsx) que es desde donde se invoca (AuthContext.jsx) para mostrar un mensaje de éxito o error
         return data;
      } catch (error) {
         console.error('Error en login:', error);
         throw error;
      }
   };

   // Función para manejar el logout, esta función se encarga de eliminar los datos de autenticación del localstorage y del estado global de la aplicación
   const logout = () => {
      // Limpiar localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      // Limpiar estado
      setToken(null);
      setUser(null);
   };

   // Si el loading es true, mostrar un indicador de carga
   if (loading) {
      return <div>Cargando...</div>;
   }

   // Proporcionar el contexto, este contexto se proporciona al componente App.jsx que es desde donde se cargan los componentes de la aplicación
   return (
      // Todo lo que se envíe en la propiedad value se puede acceder desde cualquier componente que esté dentro del contexto
      // En este caso se envían los estados user, token y las funciones login y logout
      <AuthContext.Provider value={{ user, token, login, logout }}>
         {/* children es todo lo que se renderize desde App.jsx*/}
         {children}
      </AuthContext.Provider>
   );
};

// Hook personalizado para usar el contexto, este hook se encarga de obtener los datos del contexto y devolverlos al componente que lo invoque
export const useAuth = () => {
   // Obtener el contexto definido en AuthProvider
   const context = useContext(AuthContext);
   // Si no se encuentra el contexto, lanzar un error
   if (!context) {
      throw new Error('useAuth debe ser usado dentro de un AuthProvider');
   }
   // Devolver el contexto para ser usado en el componente que lo invoque
   return context;
};
