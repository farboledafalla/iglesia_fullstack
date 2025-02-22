require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const courseRoutes = require('./routes/courses');
const userRoutes = require('./routes/users');
const paisesRoutes = require('./routes/paises');
const continentesRoutes = require('./routes/continentes');
const alumnosRoutes = require('./routes/alumnos');
const modulosRoutes = require('./routes/modulos');
const instructoresRoutes = require('./routes/instructores');
const leccionesRoutes = require('./routes/lecciones');
const preguntasRouter = require('./routes/preguntas');
const progresoAlumnosRouter = require('./routes/progreso-alumnos');
const rolesRoutes = require('./routes/roles');

const app = express();

app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/users', userRoutes);
app.use('/api/paises', paisesRoutes);
app.use('/api/continentes', continentesRoutes);
app.use('/api/alumnos', alumnosRoutes);
app.use('/api/modulos', modulosRoutes);
app.use('/api/instructores', instructoresRoutes);
app.use('/api/lecciones', leccionesRoutes);
app.use('/api/preguntas', preguntasRouter);
app.use('/api/progreso-alumnos', progresoAlumnosRouter);
app.use('/api/roles', rolesRoutes);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
   console.log(`Servidor corriendo en puerto ${PORT}`);
});
