
const express = require('express');
const app = express();
const cors = require('cors');
const session = require('express-session');

const rutasVuelos = require('./routes/rutasVuelos');
const rutasUsuarios = require('./routes/rutasUsuarios');
const rutasAeropuertos = require('./routes/rutasAeropuertos');
const rutasAerolineas = require('./routes/rutasAerolineas');

app.use(cors({
    origin: true,
    credentials: true,
}));
app.use(express.json());

app.use(session({
    secret: 'clave',
    resave: false,
    saveUninitialized: true,
    cookie: {maxAge: 3600000 }
}));


app.use('/vuelos', rutasVuelos);
app.use('/usuarios', rutasUsuarios);
app.use('/aeropuertos', rutasAeropuertos);
app.use('/aerolineas', rutasAerolineas);



const PUERTO = process.env.PORT || 3100;

app.listen(PUERTO, () => {
    console.log(`Servidor escuchando en el puerto ${PUERTO}`);
});
