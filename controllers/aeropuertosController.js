const db = require("../database/db");

const getById = (req, res) => {
    db.getConnection((err, connection) => {
      if (err) {
        console.error("Error en la conexion", err);
      } else {
        const id = req.params.id;
  
        connection.query(
          "SELECT * FROM aeropuertos WHERE id_aeropuerto = ?",
          [id],
          (err, resultados) => {
            if (err) {
              console.error(
                "Error al obtener el registro desde la base de datos:",
                err
              );
              res.status(500).json({ error: "Error interno del servidor" });
            } else {
              // Verifica si se encontró un registro
              if (resultados.length > 0) {
                res.json(resultados[0]);
              } else {
                res.status(404).json({ error: "Registro no encontrado" });
              }
            }
            connection.release();
          }
        );
      }
    });
  };

  const buscar = (req, res) => {
    db.getConnection((err, connection) => {
      if (err) {
        console.error("Error en la conexion", err);
      } else {
        const nombre = req.body.nombre+"%";

        connection.query(
          "SELECT * FROM aeropuertos WHERE ciudad LIKE ? OR id_aeropuerto LIKE ? OR nombre LIKE ? ",
          [nombre, nombre, nombre],
          (err, resultados) => {
            if (err) {
              console.error(
                "Error al obtener el registro desde la base de datos:",
                err
              );
              res.status(500).json({ error: "Error interno del servidor" });
            } else {
              // Verifica si se encontró un registro
              if (resultados.length > 0) {
                res.json(resultados);
              } else {
                res.status(404).json({ error: "Registro no encontrado" });
              }
            }
            connection.release();
          }
        );
      }
    });
  };

  module.exports =
{
    getById,
    buscar,
};