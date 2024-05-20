const mysql=require('mysql2');

const db= mysql.createPool({
    host: '0.0.0.0',
    port: 3306,
    user: 'midestino',
    password: '1111',
    database: 'midestino'
});


module.exports=db;