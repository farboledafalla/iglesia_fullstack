import { Route } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';
import RoleRoute from './RoleRoute';

const renderRoutes = (routes) => {
   const buildRoutes = (routesArray, isRoot = false) => {
      return routesArray.map((route, index) => {
         const Element = route.element;

         const elementNode = isRoot ? (
            <PrivateRoute>
               <Element />
            </PrivateRoute>
         ) : route.roles ? (
            <RoleRoute roles={route.roles}>
               <Element />
            </RoleRoute>
         ) : (
            <Element />
         );

         return (
            <Route
               key={index}
               path={route.path}
               index={route.index}
               element={elementNode}
            >
               {route.children && buildRoutes(route.children)}
            </Route>
         );
      });
   };

   return buildRoutes(routes, true);
};

export default renderRoutes;

/*
✅ rutas infinitamente anidadas
✅ layouts múltiples
✅ guards por nivel
✅ cero cambios en dashboard.routes.js
✅ cero cambios en AppRoutes
✅ cero cambios en Layout
*/
