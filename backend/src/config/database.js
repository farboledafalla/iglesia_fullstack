// database.js: es un script que contiene las funciones de conexión a la base de datos

//mysql es un paquete que nos permite conectarnos a una base de datos MySQL
const mysql = require('mysql');
//path es un paquete que nos permite manejar rutas de archivos
const path = require('path');
//Esta instrucción es para cargar las variables de entorno desde el archivo .env
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

//Se muestra en consola las variables de entorno para verificar si están correctas, con esto hacemos un debug
console.log('Process ENV:', {
   DB_HOST: process.env.DB_HOST,
   DB_USER: process.env.DB_USER,
   //DB_PASSWORD: process.env.DB_PASSWORD,
   DB_NAME: process.env.DB_NAME,
});

// Configuración de la base de datos, esto es para que el código sea más legible
const dbConfig = {
   host: process.env.DB_HOST || 'localhost',
   user: process.env.DB_USER || 'root',
   password: process.env.DB_PASSWORD || '123456',
   database: process.env.DB_NAME || 'iglesia',
   waitForConnections: true,
   connectionLimit: 10,
   queueLimit: 0,
   insecureAuth: true,
   multipleStatements: true,
};

// Mostrar en consola la configuración de la base de datos
console.log('DB Config:', {
   ...dbConfig,
   //Esta línea es para ocultar la contraseña en la consola
   password: dbConfig.password ? 'YES' : 'NO',
});

// Crear el pool de conexiones
const pool = mysql.createPool(dbConfig);

// Verificar la conexión
pool.getConnection((err, connection) => {
   // Si hay un error, mostrarlo en consola
   if (err) {
      console.error('Error completo:', err);
      if (err.code === 'PROTOCOL_CONNECTION_LOST') {
         console.error('Conexión a la base de datos fue cerrada.');
      }
      if (err.code === 'ER_CON_COUNT_ERROR') {
         console.error('La base de datos tiene muchas conexiones.');
      }
      if (err.code === 'ECONNREFUSED') {
         console.error('La conexión a la base de datos fue rechazada.');
      }
      if (err.code === 'ER_ACCESS_DENIED_ERROR') {
         console.error('Acceso denegado al usuario. Revisar las credenciales.');
      }
   }

   // Si hay una conexión, mostrar un mensaje en consola
   if (connection) {
      console.log('Conectado a la base de datos correctamente!');
      connection.release();
   }
   return;
});

// Promisify para usar async/await
//promisePool es un objeto que nos permite usar async/await con el pool de conexiones
const promisePool = {
   //query es una función que nos permite ejecutar una consulta a la base de datos
   query(sql, values) {
      // Si todo sale bien aquí retornaría una promesa, por ejemplo si está consultando un usuario, retornaría una promesa con el usuario
      return new Promise((resolve, reject) => {
         pool.query(sql, values, (error, results) => {
            // Si hay un error, mostrarlo en consola y rechazar la promesa
            if (error) {
               console.error('Error en el query:', error.message);
               reject(error);
            }

            // Resolver la promesa con los resultados
            resolve([results]);
         });
      });
   },
};

//pool.on es una función que nos permite manejar errores en el pool de conexiones
pool.on('error', (err) => {
   console.error(
      'Error inesperado en conexión de base de datos inactiva:',
      err
   );
   process.exit(-1);
});

//Exportar el pool de conexiones
module.exports = promisePool;
