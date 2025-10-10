// database.js: es un script que contiene las funciones de conexión a la base de datos

//mysql es un paquete que nos permite conectarnos a una base de datos MySQL
const mysql = require('mysql');
//path es un paquete que nos permite manejar rutas de archivos
const path = require('path');
//Esta instrucción es para cargar las variables de entorno desde el archivo .env
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
// Importar función obtenerFechaHoraActual
const { obtenerFechaHoraActual } = require('../utils/funciones');

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
console.log('\n\n------------------------------------------------');
console.log(obtenerFechaHoraActual());
console.log('/config/database.js');
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
      console.log('\n\n------------------------------------------------');
      console.log(obtenerFechaHoraActual());
      console.log('/config/database.js');
      console.log('Conectado a la base de datos correctamente!');
      connection.release();
   }
   return;
});

// Promisify para usar async/await
// promisePool es un objeto que nos permite usar async/await con el pool de conexiones
const promisePool = {
   // query es una función que nos permite ejecutar una consulta a la base de datos
   query(sql, values) {
      return new Promise((resolve, reject) => {
         pool.query(sql, values, (error, results) => {
            if (error) {
               console.error('Error en el query:', error.message);
               return reject(error);
            }
            resolve([results]);
         });
      });
   },

   // getConnection devuelve una conexión del pool para usar transacciones
   getConnection() {
      return new Promise((resolve, reject) => {
         pool.getConnection((err, connection) => {
            if (err) return reject(err);
            resolve(connection);
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
