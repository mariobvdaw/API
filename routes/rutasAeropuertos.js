const express = require('express');
const rutasAeropuertos = express.Router();

const aeropuertosController = require('../controllers/aeropuertosController');

rutasAeropuertos.get('/:id', aeropuertosController.getById);
rutasAeropuertos.post('/buscar', aeropuertosController.buscar);


module.exports = rutasAeropuertos;