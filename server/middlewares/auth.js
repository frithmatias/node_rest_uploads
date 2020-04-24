jwt = require('jsonwebtoken');

// =======================================
// Verificar TOKEN
// =======================================

let verificaToken = (req, res, next) => {
    //console.log(req.route.stack);

    // tengo aca que LEER el header 
    let token = req.get('token');
    jwt.verify(token, process.env.TOKEN_SEED, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                ok: false,
                err
            });
        }
        req.usuario = decoded.usuario;
        next();
    });




    // res.json({
    //     token: token
    // });

};


// =======================================
// Verificar role ADMIN
// =======================================

let canUpdate = (req, res, next) => {
    const role = req.usuario.role;
    if(role==='ADMIN_ROLE'){
        next();
    } else {
        return res.status(401).json({
            ok: false, 
            message: 'El usuario no tiene rol de administrador'
        });
    }

};

module.exports = {
    verificaToken,
    canUpdate
};
