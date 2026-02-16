import { useNavigate } from 'react-router-dom';

const Unauthorized = () => {
   const navigate = useNavigate();

   return (
      <div style={styles.container}>
         <h1 style={styles.title}>403</h1>
         <h2>No tienes permisos para acceder a esta página</h2>

         <p style={styles.text}>
            Si crees que esto es un error, contacta al administrador del
            sistema.
         </p>

         <button style={styles.button} onClick={() => navigate('/dashboard')}>
            Volver al Dashboard
         </button>
      </div>
   );
};

const styles = {
   container: {
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      textAlign: 'center',
      fontFamily: 'sans-serif',
   },
   title: {
      fontSize: '80px',
      marginBottom: '10px',
   },
   text: {
      marginTop: '10px',
      marginBottom: '20px',
   },
   button: {
      padding: '10px 20px',
      cursor: 'pointer',
   },
};

export default Unauthorized;
