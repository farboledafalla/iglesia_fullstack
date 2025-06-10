import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
   <React.StrictMode>
      <BrowserRouter>
      {/* Este es el punto de entrada de toda la aplicación, por eso se carga <App /> */}
         <App />
      </BrowserRouter>
   </React.StrictMode>
);
