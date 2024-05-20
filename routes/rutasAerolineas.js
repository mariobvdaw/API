const express = require('express');
const rutasAerolineas = express.Router();

const aerolineasController = require('../controllers/aerolineasController');

rutasAerolineas.get('/:id', aerolineasController.getById);


module.exports = rutasAerolineas;