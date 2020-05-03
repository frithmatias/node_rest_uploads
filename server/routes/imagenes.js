const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

const { verificaTokenImg } = require('../middlewares/auth');
app.get('/imagen/:tipo/:img', verificaTokenImg, (req, res) => {
    let tipo = req.params.tipo;
    let img = req.params.img;

   
    // Si yo en lugar de enviar un JSON le quiero enviar el archivo al usuario uso sendFIle()
    // que lee el content-type del archivo, y eso es lo que regresa. Si es una imagen regresa una 
    // imagen, si es un JSON regresa un JSON, etc.
    let ImagePath = path.resolve(__dirname, `../../uploads/${ tipo }/${ img }`);

    if ( fs.existsSync( ImagePath)) {
        res.sendFile(ImagePath);
    } else {
        let noImagePath = path.resolve(__dirname, '../assets/no-image.jpg');
        res.sendFile(noImagePath);
    }

    // Para probarlo en POSTMAN:
    // {{url}}/imagen/usuarios/5ea1fa73be1b8005304bc011-670.png

});

module.exports = app;
