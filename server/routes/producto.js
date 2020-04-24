const express = require('express');

// hay varias maneras de importar una función del middleware, esta forma usa la detructuración.
const { verificaToken, canUpdate } = require('../middlewares/auth');

let app = express();

let Producto = require('../models/producto');


// ========================================================
// Obtener productos
// ========================================================

app.get('/productos', verificaToken, (req, res) => {
    // trae todos los productos
    // populate: usuario categoria
    // paginado
    
    let desde = req.query.desde || 0;
    desde = Number(desde);

    let limite = req.query.limite || 5;
    limite = Number(limite);


    Producto
        .find({
            'categoria': req.body.categoria,
            'disponible': true
        })
        .skip(desde)
        .limit(limite)
        .populate(['usuario', 'categoria'])
        .exec((err, productoDB) => {
            if (err){
                return res.status(500).json({
                    ok: false, 
                    err
                });
            }
            if(productoDB.length === 0){
                return res.status(400).json({
                    ok: false, 
                    err: 'No existen productos para la categoría solicitada'
                });                
            }

            return res.status(200).json({
                ok: true,
                productos: productoDB
            });
        });


});


// ========================================================
// Obtener un producto por ID 
// ========================================================

app.get('/producto/:id', verificaToken, (req, res)=> {
    let id = req.params.id;

    Producto.findById(id, (err, productoDB) => {
        if (err){
            return res.status(500).json({
                ok: false, 
                err
            });
        }
        if(!productoDB){
            return res.status(400).json({
                ok: false, 
                err: 'No existe el producto solicitado'
            });                
        }

        return res.status(200).json({
            ok: true,
            producto: productoDB
        });
    });
});

// ========================================================
// Crear un nuevo producto
// ========================================================

app.post('/producto', verificaToken, (req, res) => {
    // grabar el usuario 
    // grabar una categoria del listado 

    let body = req.body;

    let producto = new Producto({
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        disponible: body.disponible,
        categoria: body.categoria,
        usuario: req.usuario
    });

    producto.save((err, productoDB) => {
        
        if ( err ) {
            return res.status(500).json({
                ok: false, 
                err
            });
        }

        return res.status(201).json({
            ok: true,
            producto: productoDB
        });
    });


});

// ========================================================
// Actualizar el producto 
// ========================================================

app.put('/producto/:id', verificaToken, (req, res) => {
    // grabar el usuario 
    // grabar una categoria del listado 

    let id = req.params.id;
    let body = req.body;

    Producto.findById(id, (err, productoDB) => {
        
        if ( err ) {
            return res.status(500).json({
                ok: false, 
                err
            });
        }

        if (!productoDB) {
            return res.status(400).json({
                ok: false, 
                err: 'No existe el producto que quiere actualizar'
            });
        }

        productoDB.nombre = body.nombre;
        productoDB.precioUni = body.precioUni;
        productoDB.descripcion = body.descripcion;
        productoDB.disponible = body.disponible;
        productoDB.categoria = body.categoria;
        
        productoDB.save((err, productoSave) => {
            if ( err ) {
                res.status(500).json({
                    ok: false,
                    err
                });
            }
            return res.status(200).json({
                ok: true,
                producto: productoSave
            });
        });

    });


});

// ========================================================
// Borrar un producto (cambia estado -> disponible: false)
// ========================================================

app.delete('/producto/:id', verificaToken, (req, res) => {
    let id = req.params.id;

    Producto.findById(id, (err, productoDelete) => {
        if (err){
            return res.status(500).json({
                ok: false, 
                err
            });
        }
        if(!productoDelete){
            return res.status(400).json({
                ok: false, 
                err: 'No existe el producto solicitado'
            });                
        }
        productoDelete.disponible = false;
        productoDelete.save((err, productoSave) => {
            if (err) {
                return res.status(500).json({
                    ok: false, 
                    err
                });
            }
            return res.status(200).json({
                ok: true,
                producto: productoSave
            });
        });
    });

});


// ========================================================
// Buscar productos 
// ========================================================

app.get('/productos/buscar/:termino', verificaToken, (req, res) => {

    let termino = req.params.termino;
    let regex = new RegExp(termino, 'i'); // insensible mayusculas y minúsculas

    Producto
        .find({nombre: regex})
        .populate(['usuario', 'categoria'])
        .exec((err, productos) => {
            if (err) {
                return res.status(500).json({
                    ok: false, 
                    err
                });
            }
            return res.status(200).json({
                ok: true,
                productos
            });
        });
});

module.exports = app;