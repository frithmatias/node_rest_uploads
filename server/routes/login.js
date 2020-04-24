const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);


const Usuario = require('../models/usuario');
const app = express();

app.post('/login', (req, res) => {
    // req.body -> { usuario: 'matias', password: '123456' }
    body = req.body;

    Usuario.findOne({ email: body.email }, (err, usuarioDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!usuarioDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: '<usuario> o contraseña incorrectos'
                }
            });
        }

        if( !bcrypt.compareSync( body.password, usuarioDB.password)){
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'usuario o <contraseña> incorrectos'
                }
            });
        }

        let token = jwt.sign({
            usuario: usuarioDB,
        }, process.env.TOKEN_SEED, {expiresIn: process.env.TOKEN_CADUCIDAD});

        return res.json({
            ok: true,
            usuario: usuarioDB,
            token
        });
    });

});



async function verify( token ) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    // If request specified a G Suite domain:
    //const domain = payload['hd'];
    // console.log(payload);

    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    };
}
// verify().catch(console.error);

app.post('/logingoogle', async (req, res) => {
    // viene del cliente en index.html por ajax -> xhr.send('idtoken=' + id_token); 
    // y es lo mismo que enviarlo en el body de POSTMAN.
    let token = req.body.idtoken;
    let googleUser = await verify(token).catch((err)=>{
        res.status(403).json({
            ok: false,
            err
        });
    });
    
    // Si el TOKEN esta OK entonces ya tengo el usuario de Google, lo BUSCO en la BD.
    Usuario.findOne({'email': googleUser.email}, (err, usuarioDB) => {
        
        if (err) {
            res.status(500).json({
                ok: false, 
                err
            });
        }

        if ( usuarioDB ) {
            if ( usuarioDB.google === false ) {
            
                // Usuario existe, pero se registro con usuario/clave
                res.status(400).json({
                    ok: false, 
                    message: 'El usuario esta registrado con usuario/clave, debe ingresar utilizando la autenticación normal'
                });               
            
            } else {
                
                // Usuario existe y se registro con Google, genero un token y lo envío al cliente.
                let token = jwt.sign({
                    usuario: usuarioDB,
                }, process.env.TOKEN_SEED, {expiresIn: process.env.TOKEN_CADUCIDAD});
                
                return res.json({
                    ok: true,
                    usuario: usuarioDB,
                    token
                });
            }
        } else {
            // El usuario NO existe en la DB, lo tengo que crear.
            let usuario = new Usuario();
            console.log('Creando un usuario a partir de googleUser:', googleUser);
            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;   
            usuario.google = true;
            usuario.password = ':)'; // el password es requerido por el modelo.

            usuario.save((err, usuarioGuardado) => {

                if (err) {
                    return res.status(500).json({
                        ok: false, 
                        err
                    });
                }

                // Si no hay error, creo un token y lo envío al cliente.
                let token = jwt.sign({
                    usuario: usuarioGuardado,
                }, process.env.TOKEN_SEED, {expiresIn: process.env.TOKEN_CADUCIDAD});
                
                return res.json({
                    ok: true,
                    usuario: usuarioGuardado,
                    token
                });         

            });
        }

    });
});
module.exports = app;

