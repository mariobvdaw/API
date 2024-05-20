const db = require("../database/db");

const verificarUsuario = (req, res) => {
    const { email, contrasena } = req.body;
    db.getConnection((err, connection) => {
        if (err) {
            console.error("Error en la conexion", err);
        } else {
            connection.query('SELECT * FROM usuarios WHERE email = ? AND contrasena = ?', [email, contrasena], (err, resultados) => {
                if (err) {
                    console.error('Error al verificar el usuario', err);
                    res.status(500).json({ error: 'El usuario no existe' });
                } else {
                    if (resultados.length > 0) {
                        const usuario = resultados[0];
                        // Guardar el usuario en la sesión
                        req.session.usuario = usuario;
                        res.json(usuario);
                    } else {
                        res.status(400).json({ error: 'Registro no encontrado' });
                    }
                    connection.release();
                }
            });
        }
    });
};

const crearUsuario = (req, res) => {
    console.log("creando..");
    const { nombre, email, contrasena, prefijo_movil, telefono, direccion, cod_postal, pais, localidad } = req.body;
    console.log(req.body);
    db.getConnection((err, connection) => {
        if (err) {
            console.error("Error en la conexion", err);
            res.status(500).json({ error: 'Error en la conexión' });
        } else {
            connection.query('INSERT INTO usuarios (nombre, email, contrasena, prefijo_movil, telefono, direccion, cod_postal, pais, localidad) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', 
                [nombre, email, contrasena, prefijo_movil, telefono, direccion, cod_postal, pais, localidad], 
                (err, resultados) => {
                    if (err) {
                        console.error('Error al crear el usuario', err);
                        res.status(500).json({ error: 'Error al crear el usuario' });
                    } else {
                        const nuevoUsuarioId = resultados.insertId;
                        res.status(201).json({ mensaje: 'Usuario creado correctamente', id: nuevoUsuarioId });
                    }
                    connection.release();
                }
            );
        }
    });
};



const getUsuario = (req, res) => {
    if (req.session.usuario) {
        res.json({ usuario: req.session.usuario });
    } else {
        res.status(401).json({ error: 'No se ha iniciado sesión' });
    }
};

const cerrarSesion = (req, res) => {
    if (req.session.usuario) {
        req.session.destroy((err) => {
            if (err) {
                res.status(500).json({ error: 'Error al cerrar sesión' });
            } else {
                res.json({ mensaje: 'Sesión cerrada correctamente' });
            }
        });
    } else {
        res.status(401).json({ error: 'No se ha iniciado sesión' });
    }
};

module.exports =
{
    verificarUsuario,
    getUsuario,
    crearUsuario,
    cerrarSesion,
};