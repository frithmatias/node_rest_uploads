// ============================
//  Puerto
// ============================
process.env.PORT = process.env.PORT || 3000;


// ============================
//  Entorno
// ============================
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

// ============================
//  TOKEN
// ============================
//process.env.TOKEN_CADUCIDAD = 60 * 60 * 24 * 30;
process.env.TOKEN_CADUCIDAD = '48h';

process.env.TOKEN_SEED = process.env.TOKEN_SEED || 'EstE-es-EL-SeeD-DesArrOLLo';

// ============================
//  Google Client ID
// ============================

process.env.GOOGLE_CLIENT_ID = '717554163420-i0cu4iesrmm0jd3bgtgn8ggj4avielc2.apps.googleusercontent.com';

// ============================
//  Base de datos
// ============================
let urlDB;

if (process.env.NODE_ENV === 'dev') {
    urlDB = 'mongodb://localhost:27017/udemy_node_rest';
} else {
    urlDB = process.env.MONGO_URI;
}
process.env.URLDB = urlDB;