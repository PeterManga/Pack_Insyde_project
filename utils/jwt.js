require('dotenv').config();
const jwt = require('jsonwebtoken')

//Esta funcion nos sirve para crear el token de acceso, recibirá como payload el id del nuevo usuario creado
function createAccessToken(payload) {
    return new Promise((resolve, reject) => {
        jwt.sign({
            payload

        }, process.env.token_secret,
            { expiresIn: '2h' },
            (err, token) => {
                if (err) reject(err);
                resolve(token)
            }
        );
    })
}

module.exports = {
    createAccessToken
};