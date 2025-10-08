//main.jsx: es un script que se ejecuta en el navegador. Es el punto de entrada de toda la aplicación.

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
   <React.StrictMode>
      <BrowserRouter>
         {/* Aqui cargamos el componente que tiene toda la aplicación, es decir, <App /> */}
         <App />
      </BrowserRouter>
   </React.StrictMode>
);
