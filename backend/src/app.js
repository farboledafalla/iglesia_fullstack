//app.js: es el archivo principal de la aplicación, es el que se ejecuta para iniciar el servidor y escuchar las peticiones que se hacen a la aplicación.

//dotenv es un paquete que te permite cargar variables de entorno desde un archivo .env y el .config() carga las variables de entorno desde el archivo.env
require('dotenv').config();
//express es un framework para crear aplicaciones web en Node.js
const express = require('express');
//cors es un paquete que te permite habilitar CORS en tu aplicación para conectar tu aplicación con otros dominios
const cors = require('cors');

//Incluir las rutas desde donde se llaman los diferentes controladores
//Ruta para la conexión a la bd, desde aquí se conecta la bd
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const alumnosRoutes = require('./routes/alumnos');
const paisesRoutes = require('./routes/paises');
const continentesRoutes = require('./routes/continentes');
const rolesRoutes = require('./routes/roles');

const courseRoutes = require('./routes/courses');
const modulosRoutes = require('./routes/modulos');
const leccionesRoutes = require('./routes/lecciones');
const preguntasRouter = require('./routes/preguntas');
const progresoAlumnosRouter = require('./routes/progreso-alumnos');
//const instructoresRoutes = require('./routes/instructores');

// Importar función obtenerFechaHoraActual
const { obtenerFechaHoraActual } = require('./utils/funciones');

// Inicializar Express
const app = express();

// Middlewares
app.use(cors());
//Para que el servidor pueda recibir datos en formato JSON
app.use(express.json());

//Se le pasa la ruta y el controlador que se va a ejecutar
//Ruta para la conexión a la bd, desde aquí se conecta la bd
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/alumnos', alumnosRoutes);
app.use('/api/paises', paisesRoutes);
app.use('/api/continentes', continentesRoutes);
app.use('/api/roles', rolesRoutes);

app.use('/api/courses', courseRoutes);
app.use('/api/modulos', modulosRoutes);
app.use('/api/lecciones', leccionesRoutes);
app.use('/api/preguntas', preguntasRouter);
app.use('/api/progreso-alumnos', progresoAlumnosRouter);
//app.use('/api/instructores', instructoresRoutes);

// Puerto
const PORT = process.env.PORT || 3001;

// Iniciar el servidor y escuchar peticiones por el puerto especificado
app.listen(PORT, () => {
   console.log('\n\n------------------------------------------------');
   console.log(obtenerFechaHoraActual());
   console.log('/app.js');
   console.log(`Servidor corriendo en puerto ${PORT}`);
});
