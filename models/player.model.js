//importacion de módulos
const mongoose = require('mongoose');

const playerSchema = mongoose.Schema({
    nombre: {
        type: String,
        required: true
    },
    descripcion:{
        type:  String
    },
    altura: {
        type:Number,
        required: true
    },
    anchura: {
        type: Number,
        required: true
    },
    relacion: {
        type: String,
        require
    }
}, {
    //Este campo añade la fecha de creación y la fecha de actualizacion
    timestamps: true
})

let Player = mongoose.model('player', playerSchema);
//exportamos
module.exports = Player