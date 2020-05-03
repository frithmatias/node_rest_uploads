const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();


const fs = require('fs');
const path = require('path');


// Cargo el modelo de usuario para actualizar el nombre de la imagen del usuario en la BD al subir una nueva imagen.
const Usuario = require('../models/usuario');
const Producto = require('../models/producto');



app.use(fileUpload());

app.put('/upload/:tipo/:id', (req, res) => {
    // tipo: usuario | producto 
    let tipo = req.params.tipo;
    let id = req.params.id;


    if (!req.files) {
        return res.status(400).json({
            ok: false,
            err: {
                messeage: 'No se ha seleccionado ningún archivo.'
            }
        });
    }

    let tiposValidos = ['productos', 'usuarios'];
    if (!tiposValidos.includes(tipo)) {
        return res.status(400).json({
            ok: false,
            message: 'No es un tipo de archivo permitido. Los tipos validos son ' + tiposValidos.join(', ').toUpperCase()
        });
    }


    let archivo = req.files.archivo; // -> 

    // Capturo la extensión de la imagen
    let nombreSegmentos = archivo.name.split('.');
    let extension = nombreSegmentos[nombreSegmentos.length - 1];

    // Extensiones permitidas 
    let extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    if (!extensionesValidas.includes(extension)) {
        return res.status(400).json({
            ok: false,
            message: 'No es un tipo de archivo permitido. Las extensiones validas son ' + extensionesValidas.join(', ').toUpperCase()
        });
    }

    // Cambio el nombre del archivo a un nombre de archivo ÚNICO
    let nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extension}`;

    // Use the mv() method to place the file somewhere on your server
    archivo.mv(`uploads/${tipo}/${nombreArchivo}`, (err) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        // Guardó el archivo en la carpeta, ahora tiene que guardarlo en la BD.
        switch (tipo) {
            case 'productos':
                updateProductoDB(nombreArchivo);
                break;
            case 'usuarios':
                updateUsuarioDB(nombreArchivo);
                break;
            default:
                return res.status(400).json({
                    ok: false,
                    message: 'No se puedo obtener el tipo de imagen para actualizar en la base de datos'
                });
        }

        
        // return res.json({
        //     ok: true,
        //     message: 'Imagen subida correctamente'
        // });
    });


    function updateUsuarioDB(nombreImg) {
        Usuario.findById(id, (err, usuarioDB) => {
            if (err) {
                // Si sucede un error al buscar el usuario, tengo que borrar la imagen 
                // porque la imagen SI se subió.
                borraArchivo('usuarios', nombreImg);
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
            if (!usuarioDB) {
                borraArchivo('usuarios', nombreImg);
                return res.status(400).json({
                    ok: false,
                    message: 'No existe el usuario que desea actualizar.'
                });
            }


            borraArchivo('usuarios', usuarioDB.img);
            
            
            usuarioDB.img = nombreImg;

            usuarioDB.save((err, usuarioSave) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        err
                    });
                }
                res.status(200).json({
                    ok: true,
                    usuario: usuarioSave,
                    message: 'Imagen actualizada correctamente.'
                });
            });
        });

    }

    function updateProductoDB(nombreImg) {
        Producto.findById(id, (err, productoDB) => {
            if (err) {
                borraArchivo('productos', nombreImg);
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
            if (!productoDB) {
                borraArchivo('productos', nombreImg);
                return res.status(400).json({
                    ok: false,
                    message: 'No existe el producto que desea actualizar.'
                });
            }
            borraArchivo('productos', productoDB.img);

            productoDB.img = nombreImg;
             productoDB.save((err, productoSave) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        err
                    });
                }
                res.status(200).json({
                    ok: true,
                    producto: productoSave,
                    message: 'Imagen actualizada correctamente.'
                });
            });
        });
    }

});

function borraArchivo(tipo, nombreImagen){
    // BORRO EL ARCHIVO DE LA IMAGEN ANTERIOR
    let pathImagen = path.resolve(__dirname, `../../uploads/${ tipo }/${ nombreImagen }`);
    // Uso existsSync y no exist, porque exist funciona con callbacks, en cambio existSync es sincrona.
    console.log(pathImagen);
    if( fs. existsSync( pathImagen ) ) {
        fs.unlinkSync( pathImagen );
    }
}
module.exports = app;

