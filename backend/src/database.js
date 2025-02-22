const mysql = require('mysql');

const pool = mysql.createPool({
   host: process.env.DB_HOST || 'localhost',
   user: process.env.DB_USER || 'root',
   password: process.env.DB_PASSWORD || '',
   database: process.env.DB_NAME || 'iglesia',
   connectionLimit: 10,
});

// Promisify para usar async/await
const query = (sql, values) => {
   return new Promise((resolve, reject) => {
      pool.query(sql, values, (error, results) => {
         if (error) {
            reject(error);
            return;
         }
         resolve(results);
      });
   });
};

module.exports = {
   query,
};
