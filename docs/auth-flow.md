# Flujo de Autenticación

## 1. Inicio de Sesión (Login)

### Frontend (LoginForm.jsx)

1. Usuario ingresa email y contraseña
2. Se envía petición POST a `/api/auth/login`
3. Si la respuesta es exitosa:
   -  Se guarda el token en localStorage
   -  Se guarda la información del usuario en localStorage
   -  Se actualiza el contexto de autenticación
   -  Se redirige al dashboard
4. Si hay error, se muestra mensaje al usuario

### Backend (authController.js)

1. Recibe credenciales (email, password)
2. Verifica si el usuario existe en la base de datos
3. Compara la contraseña usando bcrypt
4. Si las credenciales son válidas:
   -  Genera token JWT con información del usuario
   -  Envía token y datos del usuario
5. Si las credenciales son inválidas, envía error

## 2. Manejo del Estado de Autenticación

### Context (AuthContext.jsx)

1. Provee estado global de autenticación:
   -  user: información del usuario actual
   -  token: JWT para peticiones autenticadas
2. Al iniciar la aplicación:
   -  Verifica si hay token en localStorage
   -  Si existe, restaura la sesión
3. Proporciona funciones:
   -  login(): inicia sesión
   -  logout(): cierra sesión

## 3. Protección de Rutas

### Frontend (DashboardRoutes.jsx)

1. Verifica si existe usuario autenticado
2. Según el rol del usuario:
   -  admin: acceso a rutas administrativas
   -  estudiante: acceso a rutas de estudiante
3. Redirige a login si no hay autenticación

### Backend (middleware/auth.js)

1. Verifica token en header Authorization
2. Decodifica y valida el token JWT
3. Si el token es válido:
   -  Agrega información del usuario a req.user
   -  Permite continuar la petición
4. Si el token es inválido:
   -  Retorna error 401 (No autorizado)

## 4. Control de Acceso por Roles

### Backend (middleware/roleCheck.js)

1. Verifica el rol del usuario en el token
2. Permite o deniega acceso según los roles permitidos
3. Si el rol no tiene permiso:
   -  Retorna error 403 (Forbidden)

## 5. Cierre de Sesión

### Frontend

1. Elimina token de localStorage
2. Elimina datos de usuario de localStorage
3. Limpia el contexto de autenticación
4. Redirige a la página de login

## 6. Persistencia de Sesión

1. Token JWT almacenado en localStorage
2. Validez del token: 24 horas
3. Al recargar la página:
   -  Se restaura el estado de autenticación desde localStorage
   -  Se verifica la validez del token

## 7. Seguridad

1. Passwords hasheados con bcrypt
2. Tokens JWT firmados con clave secreta
3. Middleware de autenticación en todas las rutas protegidas
4. Validación de roles para acciones específicas
5. Headers CORS configurados apropiadamente




### Inicialización

# Flujo de Autenticación

## 1. Punto de Entrada (main.jsx)

### Estructura Inicial

1. (/main.jsx) La aplicación comienza en `main.jsx`

2. (/src/context/AuthContext.jsx) Se envuelve toda la aplicación con `AuthProvider` para proporcionar el contexto de autenticación
   
   ```jsx
      ReactDOM.createRoot(document.getElementById('root')).render(
      <React.StrictMode>
         <AuthProvider>
            <BrowserRouter>
               <App />
            </BrowserRouter>
         </AuthProvider>
      </React.StrictMode>
      )
   ```

3. (/App.jsx) El flujo continua en `App.jsx`
   
   ```jsx
      <AuthProvider>
         <Routes>
            <Route path='/login' element={<Login />} />
            <Route path='/register' element={<Register />} />

            {/* Rutas protegidas del dashboard */}
            <Route
               path='/dashboard/*'
               element={
                  <PrivateRoute>
                     <DashboardRoutes />
                  </PrivateRoute>
               }
            />

            {/* Redirigir a login si la ruta no existe */}
            <Route path='*' element={<Login />} />

            {/* Rutas adicionales del dashboard */}
            <Route path='/preguntas' element={<Preguntas />} />
         </Routes>
      </AuthProvider>
   ```


4. El `AuthProvider` realiza las siguientes acciones al montar para saber a que ruta va a redirigir:

   ```jsx
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

         //Esta parte aun no se ejecuta solo están definidos estos componentes
         /*const login = async (email, password) => {
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
         };*/

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
   ```


   -  Verifica localStorage por token existente
   -  Si existe token, intenta restaurar la sesión
   -  Establece el estado inicial de autenticación

      ```jsx
         useEffect(() => {
         const savedToken = localStorage.getItem('token');
         const savedUser = localStorage.getItem('user');

         if (savedToken && savedUser) {
            setToken(savedToken);
            setUser(JSON.parse(savedUser));
         }
         setLoading(false);
         }, []);
      ```

5. Estado Inicial:

   -  `user`: null
   -  `token`: null
   -  `loading`: true

   ```jsx
      const [user, setUser] = useState(null);
      const [token, setToken] = useState(null);
      const [loading, setLoading] = useState(true);
   ```

6. Proceso de Verificación:

   -  Busca token en localStorage
   -  Si existe:
      -  Restaura datos del usuario
      -  Establece el token
   -  Si no existe:
      -  Mantiene estado no autenticado


   ```jsx
         const savedToken = localStorage.getItem('token');
         const savedUser = localStorage.getItem('user');

         if (savedToken && savedUser) {
            setToken(savedToken);
            setUser(JSON.parse(savedUser));
         }
         setLoading(false);
   ```
    ```jsx
   
   ```

7. Estados Posibles:
   -  No autenticado: `user === null`
   -  Autenticado: `user !== null`
   -  Cargando: `loading === true`


--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
## NOTA: Se debe eliminar el token cuando cierre el navegador sin hacer Logout.
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------



## 2. Protección de Rutas

### Frontend (App.jsx)

8. (/App.jsx) parte de las rutas que se precargan se encuentra '/dashborad/' la cuan tiene varias rutas desde (/src/pages/routes/DashboardRoues.jsx) y este a su vez se encuentra contenido en (/src/components/auth/PrivatRoute.jsx)

```jsx
      {/* Rutas protegidas del dashboard */}
      <Route
         path='/dashboard/*'
         element={
            <PrivateRoute>
               <DashboardRoutes />
            </PrivateRoute>
         }
      />
```


9. (/src/components/auth/PrivatRoute.jsx) Desde aquí se hace uso de (AuthContext.jsx) y se trae (useAuth) para revisar el {token} si se obtubo el token desde localStorage

   - Si no existe token, redirige al /login

```jsx
   import { Navigate, useLocation } from 'react-router-dom';
   import { useAuth } from '../../context/AuthContext';

   const PrivateRoute = ({ children }) => {
      const { token } = useAuth();
      const location = useLocation();

      // Si no hay token, redirige a login
      if (!token) {
         // Redirigir a /login, pero guardar la ubicación intentada
         return <Navigate to="/login" state={{ from: location }} replace />;
      }

      // Si hay token, renderiza los componentes hijos (rutas del dashboard)
      return children;
   };
```

   - Si existe el token, carga el {children}

   ```jsx
      // Si hay token, renderiza los componentes hijos (rutas del dashboard)
      return children;
   ```

   - que existe en (App.jsx)...<DashboardRoutes />

   ```jsx
      <Route
         path='/dashboard/*'
         element={
            <PrivateRoute>
               <DashboardRoutes />
            </PrivateRoute>
         }
      />
   ```



### Flujo de Decisiones:

1. Usuario no autenticado:

   -  Accede a `/login`: Muestra LoginForm
   -  Intenta acceder a `/dashboard/*`: Redirige a login
   -  Cualquier otra ruta: Redirige a login

2. Usuario autenticado:
   -  Accede a `/login`: Redirige a dashboard
   -  Accede a `/dashboard/*`:
      -  Verifica rol del usuario
      -  Carga rutas según permisos
   -  Cualquier otra ruta: Redirige a dashboard

### Backend (middleware/auth.js)

1. Verifica token en header Authorization
2. Decodifica y valida el token JWT
3. Si el token es válido:
   -  Agrega información del usuario a req.user
   -  Permite continuar la petición
4. Si el token es inválido:
   -  Retorna error 401 (No autorizado)

## 4. Control de Acceso por Roles

### Frontend (DashboardRoutes.jsx)

```jsx
const DashboardRoutes = () => {
   const { user } = useAuth();
   const isAdmin = user?.rol === 'admin';

   return (
      <Routes>
      <Route path="/" element={<DashboardLayout />}>
      {isAdmin ? (
      // Rutas administrativas
      ) : (
      // Rutas de estudiante
      )}
      </Route>
      </Routes>
   );
};
```

### Backend (middleware/roleCheck.js)

1. Verifica el rol del usuario en el token
2. Permite o deniega acceso según los roles permitidos
3. Si el rol no tiene permiso:
   -  Retorna error 403 (Forbidden)

## 5. Interceptores de Peticiones

### Manejo de Token:

```javascript
   fetch(url, {
      headers: {
         Authorization: Bearer ${token},
         'Content-Type': 'application/json'
      }
   })
``

1. Cada petición HTTP incluye el token
2. Manejo de errores de autenticación:
   -  Error 401: Token inválido o expirado
   -  Error 403: Permisos insuficientes
   -  En ambos casos: Redirige a login

## 6. Persistencia de Sesión

1. Token JWT almacenado en localStorage
2. Validez del token: 24 horas
3. Al recargar la página:
   -  Se restaura el estado de autenticación desde localStorage
   -  Se verifica la validez del token

## 7. Ciclo de Vida del Token

1. Creación:

   -  Al hacer login exitoso
   -  Se guarda en localStorage

2. Uso:

   -  Se incluye en cada petición
   -  Se verifica en cada ruta protegida

3. Invalidación:

   -  Al cerrar sesión
   -  Al expirar (24 horas)
   -  Al detectar token inválido

4. Limpieza:
   -  Se elimina de localStorage
   -  Se limpia el contexto
   -  Se redirige a login

## 8. Seguridad

1. Passwords hasheados con bcrypt
2. Tokens JWT firmados con clave secreta
3. Middleware de autenticación en todas las rutas protegidas
4. Validación de roles para acciones específicas
5. Headers CORS configurados apropiadamente

















