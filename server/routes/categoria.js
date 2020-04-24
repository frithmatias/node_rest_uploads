const express = require('express');

// hay varias maneras de importar una función del middleware, esta forma usa la detructuración.
const { verificaToken, canUpdate } = require('../middlewares/auth');

let app = express();

let Categoria = require('../models/categoria');


// =======================================
// Mostrar todas las categorias 
// =======================================

app.get('/categorias', (req, res) => {

    //Categoria.find({}, (err, categoriasDB) => {
    Categoria
    .find({})
    .sort('descripcion')
    .populate('usuario')
    .exec((err, categoriasDB) => {
    if (err) {
            res.status(500).json({
                ok: false,
                err
            });
        }
        res.status(200).json({
            ok: true,
            categorias: categoriasDB
        });

    });
});

// =======================================
// Mostrar una categoria por ID
// =======================================

app.get('/categoria/:id', [verificaToken], (req, res) => {
    let id = req.params.id;
    console.log(id);
    Categoria.findById(id, (err, categoriaDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err: 'No existe la categoría solicitada.'
            });
        }

        return res.status(200).json({
            ok: true,
            categoria: categoriaDB
        });
    });
});

// =======================================
// Crear nueva categoria
// =======================================

app.post('/categoria', [verificaToken, canUpdate], (req, res) => {
    // el usuario que lo creo esta en req.usuario._id 
    let body = req.body;
    console.log('body', body);
    let categoria = new Categoria({
        descripcion: body.descripcion,
        usuario: req.usuario
    });

    console.log('categoria', categoria);

    categoria.save((err, categoriaDB) => {
        if (err) {
            res.status(500).json({
                ok: false,
                err
            });
        }

        res.status(200).json({
            ok: true,
            categoria: categoriaDB
        });
    });
    
});

// =======================================
// Actualizar la descripción de una categoria
// =======================================

app.put('/categoria/:id', [verificaToken, canUpdate], (req, res) => {
    // el usuario que lo creo esta en req.usuario._id 
    let id = req.params.id;
    let body = req.body;

    Categoria.findById(id, (err, categoriaDB) => {
        if ( err ) {
            res.status(500).json({
                ok: false,
                err
            });
        }
        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err: 'No existe la categoría solicitada.'
            });
        }
        // return res.status(200).json({
        //     categoria: categoriaDB, -> { objeto con datos de la categoria }
        //     usuario: req.usuario, -> { objeto con data del usuario que solicita }
        //     body: body -> { objeto con la nueva data de la categoria }
        // });

        categoriaDB.descripcion = body.descripcion;
        categoriaDB.save((err, categoriaSave) => {
            if ( err ) {
                res.status(500).json({
                    ok: false,
                    err
                });
            }
            return res.status(200).json({
                ok: true,
                categoria: categoriaSave
            });
        });


    });
    
});

// =======================================
// Eliminar una categoria
// =======================================

app.delete('/categoria/:id', [verificaToken, canUpdate] , (req, res) => {
    let id = req.params.id;

    // Solo un admin puede borrar categorias 
    // categoria.findbyidandremove 
    
    Categoria.findByIdAndDelete(id, (err, categoriaDB) => {

        if ( err ) {
            res.status(500).json({
                ok: false,
                err
            });
        }

        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err: 'No existe la categoría solicitada.'
            });
        }

        return res.status(200).json({
            ok: true,
            err: 'Categoria eliminada.'
        });

    
    });
    
    
});

module.exports = app;