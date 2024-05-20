const express = require('express');
const rutasUsuarios = express.Router();

const usuariosController = require('../controllers/usuariosController');


rutasUsuarios.post('/login', usuariosController.verificarUsuario);

rutasUsuarios.get('/getUsuario', usuariosController.getUsuario);

rutasUsuarios.post('/crear', usuariosController.crearUsuario);

rutasUsuarios.get('/cerrarSesion', usuariosController.cerrarSesion);

module.exports = rutasUsuarios;