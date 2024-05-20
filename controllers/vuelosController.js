const db = require("../database/db");
// envío de emails
const { Resend } = require('resend');
const resend = new Resend('re_MZnoBwPT_PiSP6uqPujsPitbwV4YZRyFG');
// pdf
const pdfMake = require('pdfmake/build/pdfmake');
const vfsFonts = require('pdfmake/build/vfs_fonts');
pdfMake.vfs = vfsFonts.pdfMake.vfs;

const agruparVuelos = (vuelos, aeropuertoIda, aeropuertoVuelta) => {
  const vuelosAgrupados = [];
  const vuelosIda = vuelos.filter(vuelo => vuelo.id_aeropuerto_salida === aeropuertoIda);
  const vuelosVuelta = vuelos.filter(vuelo => vuelo.id_aeropuerto_salida === aeropuertoVuelta);

  vuelosIda.forEach(vueloIda => {
    vuelosVuelta.forEach(vueloVuelta => {
      vuelosAgrupados.push({
        vueloIda,
        vueloVuelta
      });
    });
   
  });

  return vuelosAgrupados;
};

const crearPDFVuelo = (datosVuelo) => {
  return new Promise((resolve, reject) => {
    
    const documentoPDF = {
      content: [
        { text: 'Detalles del vuelo', style: 'header' },
        { text: `Número de vuelo: ${datosVuelo.numeroVuelo}` },
        { text: `Origen: ${datosVuelo.origen}` },
        { text: `Destino: ${datosVuelo.destino}` },
        { text: `Fecha de salida: ${datosVuelo.fechaSalida}` },
        { text: `Hora de salida: ${datosVuelo.horaSalida}` },
      ],
      styles: {
        header: {
          fontSize: 18,
          bold: true,
          margin: [0, 0, 0, 10],

        },
      },
    };

    const pdfDoc = pdfMake.createPdf(documentoPDF);
    pdfDoc.getBuffer((buffer) => {
      const pdfBase64 = buffer.toString('base64');
      resolve(pdfBase64);
    });
  });
};

const enviarCorreoVuelo = async (datosVuelo, correoDestino) => {
  try {
    const pdfBase64 = await crearPDFVuelo(datosVuelo);

    const confEmail = {
      from: 'onboarding@resend.dev',
      to: correoDestino,
      subject: 'Vuelo comprado',
      html: '<p>Nos complace informarle que su compra de billetes de vuelo ha sido confirmada con éxito.<br> A continuación, encontrará los detalles de su reserva:</p>',
      attachments: [
        {
          filename: 'detalles_vuelo.pdf',
          content: pdfBase64,
          encoding: 'base64',
        },
      ],
    };

    await resend.emails.send(confEmail);
    console.log('Correo electrónico enviado con éxito');
  } catch (error) {
    console.error('Error al enviar el correo electrónico:', error);
  }
};

const getById = (req, res) => {
  db.getConnection((err, connection) => {
    if (err) {
      console.error("Error en la conexion", err);
    } else {
      const id = req.params.id;

      connection.query(
        "SELECT * FROM vuelos WHERE id_vuelo = ?",
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

const getVuelos = (req, res) => {
  db.getConnection((err, connection) => {
    if (err) {
      console.error("Error en la conexión", err);
      res.status(500).json({ error: "Error interno del servidor" });
      return;
    }

    const { ciudad_origen, ciudad_destino, fecha_ida, fecha_vuelta } = req.body;


    connection.query(
      `SELECT id_aeropuerto FROM aeropuertos 
      WHERE ciudad = ?`,
      [ciudad_origen],
      (err, aeropuertoIda) => {
        if (err) {
          console.error("Error al obtener los vuelos de ida desde la base de datos:", err);
          res.status(500).json({ error: "Error interno del servidor" });
          return;
        }
        connection.query(
          `SELECT id_aeropuerto FROM aeropuertos 
          WHERE ciudad = ?`,
          [ciudad_destino],
          (err, aeropuertoVuelta) => {
            if (err) {
              console.error("Error al obtener los vuelos de ida desde la base de datos:", err);
              res.status(500).json({ error: "Error interno del servidor" });
              return;
            }

            // consulta para vuelos de ida
            connection.query(
              `SELECT * FROM vuelos 
      WHERE id_aeropuerto_salida IN (SELECT id_aeropuerto FROM aeropuertos WHERE ciudad = ?)
      AND id_aeropuerto_destino IN (SELECT id_aeropuerto FROM aeropuertos WHERE ciudad = ?)
      AND fecha_ida = ?`,
              [ciudad_origen, ciudad_destino, fecha_ida],
              (err, resultadosIda) => {
                if (err) {
                  console.error("Error al obtener los vuelos de ida desde la base de datos:", err);
                  res.status(500).json({ error: "Error interno del servidor" });
                  return;
                }

                // consulta para vuelos de vuelta
                connection.query(
                  `SELECT * FROM vuelos 
          WHERE id_aeropuerto_salida IN (SELECT id_aeropuerto FROM aeropuertos WHERE ciudad = ?)
          AND id_aeropuerto_destino IN (SELECT id_aeropuerto FROM aeropuertos WHERE ciudad = ?)
          AND fecha_ida = ?`,
                  [ciudad_destino, ciudad_origen, fecha_vuelta],
                  (err, resultadosVuelta) => {
                    if (err) {
                      console.error("Error al obtener los vuelos de vuelta desde la base de datos:", err);
                      res.status(500).json({ error: "Error interno del servidor" });
                      return;
                    }

                    // juntar y agrupar los vuelos de ida y vuelta
                    const vuelos = [...resultadosIda, ...resultadosVuelta];

                    const vuelosAgrupados = agruparVuelos(vuelos, aeropuertoIda[0].id_aeropuerto, aeropuertoVuelta[0].id_aeropuerto)
                    if (vuelos.length > 0) {
                      res.json(vuelosAgrupados);
                    } else {
                      res.status(404).json({ error: "No se encontraron vuelos para las opciones proporcionadas" });
                    }
                  }
                );
              }
            );
          });
      });
  });
};



const finalizarCompra = async (req, res) => {

  const datosVuelo = {
    numeroVuelo: 'AB123',
    origen: 'Madrid',
    destino: 'Barcelona',
    fechaSalida: '2024-05-22',
    horaSalida: '10:00 AM',
  };

  try {
    await enviarCorreoVuelo(datosVuelo, 'mariobartulos@gmail.com');
    res.status(200).json({ mensaje: "Email enviado" });
  } catch (error) {
    res.status(500).json({ error: "Error al enviar el correo electrónico" });
  }
}


module.exports =
{
  getById,
  getVuelos,
  finalizarCompra,
};