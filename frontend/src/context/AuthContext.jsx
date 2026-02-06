// AuthContext.jsx: este script se encarga de manejar el estado de autenticación de la aplicación.
import React, { createContext, useContext, useState, useEffect } from 'react';
//
import { API_URL } from './../config/env';

// Crear el contexto
const AuthContext = createContext();

// Proveedor de autenticación, children es todo lo que se renderize desde App.jsx
export const AuthProvider = ({ children }) => {
   // Estado para el usuario, el token y el loading
   const [user, setUser] = useState(null);
   const [token, setToken] = useState(null);
   // Estado para el loading y se establece en true al iniciar como indicador de carga
   const [loading, setLoading] = useState(true);
   // Para que cada componente NO tendría que validar
   const isAuthenticated = !!token;

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
         // Petición tipo POST a la API de autenticación: esto se debe cambiar por variables de entorno (url)
         // const response = await fetch('http://localhost:3002/api/auth/login', {
         const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
         });

         // Parsear la respuesta una sola vez
         const data = await response.json();

         // Si la respuesta NO es ok, devolver la data al llamador para que muestre el mensaje. Esto evita: try/catch innecesario en formularios - lógica repetida - errores silenciosos
         if (!response.ok) {
            // Retornamos un objeto con campo ok=false para facilitar el manejo en LoginForm
            return { ok: false, ...data };
         }

         // Respuesta ok: guardar token/usuario y actualizar estado
         console.log('Data retornada desde el backend: ', data);
         // Guardar en localStorage y actualizar estado
         localStorage.setItem('token', data.token);
         localStorage.setItem('user', JSON.stringify(data.user));
         setToken(data.token);
         setUser(data.user);

         // Retornar la data incluyendo ok=true
         return { ok: true, ...data };
      } catch (error) {
         console.error('Error en el login:', error);
         // Lanzar para que el componente que llamó pueda capturar errores de red u otros
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

   // El Context NO debería renderizar UI. Mejor se expone el estado en el Provider: El loader se maneja mejor en (App.jsx, PrivateRoute.jsx o Layout principal)
   // if (loading) {
   //    return <div>Cargando...</div>;
   // }

   // Proporcionar el contexto, este contexto se proporciona al componente App.jsx que es desde donde se cargan los componentes de la aplicación
   return (
      // Todo lo que se envíe en la propiedad value se puede acceder desde cualquier componente que esté dentro del contexto
      // En este caso se envían los estados user, token y las funciones login y logout
      <AuthContext.Provider
         value={{ user, token, isAuthenticated, loading, login, logout }}
      >
         {/* children es todo lo que se renderize desde App.jsx*/}
         {children}
      </AuthContext.Provider>
   );
};

// Hook personalizado para usar el contexto, este hook se encarga de obtener los datos del contexto y devolverlos al componente que lo invoque: Esto evita bugs invisibles.
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

/* Pendientes

3. Tu login no maneja errores HTTP reales (caso backend caído)

ahora:
const data = await response.json();

Si el backend responde:
500 sin body

revienta aquí. Mejor:
let data = {};
try {
   data = await response.json();
} catch {
   data = {};
}


4. URL hardcodeada del backend

'http://localhost:3002/api/auth/login'

Esto te va a romper:
staging
producción
docker
deploy

usar:
import.meta.env.VITE_API_URL


5. Seguridad (muy importante)

Guardar JWT en localStorage:
localStorage.setItem('token', data.token);

Es vulnerable a XSS.

ideal → httpOnly cookies
aceptable → localStorage + CSP fuerte

*/
