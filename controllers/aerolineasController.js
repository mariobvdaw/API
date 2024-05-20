const db = require("../database/db");

const getById = (req, res) => {
    db.getConnection((err, connection) => {
      if (err) {
        console.error("Error en la conexion", err);
      } else {
        const id = req.params.id;
  
        connection.query(
          "SELECT * FROM aerolineas WHERE id_aerolinea = ?",
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
                res.json(resultados[0]); // Devuelve el primer resultado encontrado (debería ser único)
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
};