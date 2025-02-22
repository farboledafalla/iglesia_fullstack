const mysql = require('mysql');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

// Para debug
console.log('Process ENV:', {
   DB_HOST: process.env.DB_HOST,
   DB_USER: process.env.DB_USER,
   DB_PASSWORD: process.env.DB_PASSWORD,
   DB_NAME: process.env.DB_NAME,
});

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

console.log('DB Config:', {
   ...dbConfig,
   password: dbConfig.password ? 'YES' : 'NO',
});

const pool = mysql.createPool(dbConfig);

// Verificar la conexión
pool.getConnection((err, connection) => {
   if (err) {
      console.error('Error completo:', err);
      if (err.code === 'PROTOCOL_CONNECTION_LOST') {
         console.error('Database connection was closed.');
      }
      if (err.code === 'ER_CON_COUNT_ERROR') {
         console.error('Database has too many connections.');
      }
      if (err.code === 'ECONNREFUSED') {
         console.error('Database connection was refused.');
      }
      if (err.code === 'ER_ACCESS_DENIED_ERROR') {
         console.error('Access denied for user. Check credentials.');
      }
   }
   if (connection) {
      console.log('Database connected successfully!');
      connection.release();
   }
   return;
});

// Promisify para usar async/await
const promisePool = {
   query(sql, values) {
      return new Promise((resolve, reject) => {
         pool.query(sql, values, (error, results) => {
            if (error) {
               console.error('Query error:', error.message);
               reject(error);
            }
            resolve([results]);
         });
      });
   },
};

// Manejo de errores en el pool
pool.on('error', (err) => {
   console.error('Unexpected error on idle database connection:', err);
   process.exit(-1);
});

module.exports = promisePool;
