const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { checkRole } = require('../middleware/roleCheck');

// Controladores (los crearemos después)
const {
    getModulos,
    getModuloById,
    createModulo,
    updateModulo,
    deleteModulo,
    getLecciones,
    getLeccionById,
    createLeccion,
    updateLeccion,
    deleteLeccion
} = require('../controllers/courseController');

// Rutas para módulos
router.get('/modulos', auth, getModulos);
router.get('/modulos/:id', auth, getModuloById);
router.post('/modulos', [auth, checkRole(['instructor', 'admin'])], createModulo);
router.put('/modulos/:id', [auth, checkRole(['instructor', 'admin'])], updateModulo);
router.delete('/modulos/:id', [auth, checkRole(['admin'])], deleteModulo);

// Rutas para lecciones
router.get('/lecciones', auth, getLecciones);
router.get('/lecciones/:id', auth, getLeccionById);
router.post('/lecciones', [auth, checkRole(['instructor', 'admin'])], createLeccion);
router.put('/lecciones/:id', [auth, checkRole(['instructor', 'admin'])], updateLeccion);
router.delete('/lecciones/:id', [auth, checkRole(['admin'])], deleteLeccion);

module.exports = router; 