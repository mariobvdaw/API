const express = require('express');
const rutasVuelos = express.Router();

const vuelosController = require('../controllers/vuelosController');

rutasVuelos.get('/:id', vuelosController.getById);
rutasVuelos.post('/buscar', vuelosController.getVuelos);
rutasVuelos.post('/comprar', vuelosController.finalizarCompra);

module.exports = rutasVuelos;