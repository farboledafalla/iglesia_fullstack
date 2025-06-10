import React, { useState } from 'react';

const ForgotForm = () => {
   // Estado para mostrar u ocultar el formulario de recuperación de contraseña
   const [showForgot, setShowForgot] = useState(false);
   const [forgotEmail, setForgotEmail] = useState('');
   const [forgotMsg, setForgotMsg] = useState('');
   const [forgotError, setForgotError] = useState('');

   const handleForgotPassword = async (e) => {
      e.preventDefault();
      setForgotMsg('');
      setForgotError('');
      try {
         const response = await fetch(
            'http://localhost:3002/api/auth/forgot-password',
            {
               method: 'POST',
               headers: {
                  'Content-Type': 'application/json',
               },
               body: JSON.stringify({ email: forgotEmail }),
            }
         );
         // data contiene la respuesta del backend, en este caso (msg, resetToken)
         const data = await response.json();
         // Imprimir en consola la respuesta del backend
         console.log('data: ', data);

         //  Si la respuesta no es ok, lanzar un error
         if (!response.ok) {
            throw new Error(data.msg || 'Error al solicitar recuperación');
         }

         // Actualizar el estado con la respuesta del backend
         setForgotMsg(data.msg);
      } catch (err) {
         setForgotError(err.message);
      }
   };

   return (
      <div>

         <button type='button' onClick={() => setShowForgot(true)}>
            ¿Olvidaste tu contraseña?
         </button>

         {showForgot && (
            <div className='forgot-password-modal'>
               <form onSubmit={handleForgotPassword}>
                  <label>
                     Ingresa tu email:
                     <input
                        type='email'
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        required
                     />
                  </label>
                  <button type='submit'>Recuperar contraseña</button>
                  <button type='button' onClick={() => setShowForgot(false)}>
                     Cerrar
                  </button>
               </form>
               {forgotMsg && <div style={{ color: 'green' }}>{forgotMsg}</div>}
               {forgotError && (
                  <div style={{ color: 'red' }}>{forgotError}</div>
               )}
            </div>
         )}

      </div>
   );
};

export default ForgotForm;
