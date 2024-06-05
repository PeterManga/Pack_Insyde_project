//importacion de módulos
const mongoose = require('mongoose');
// Definición del esquema
const fileSchema = mongoose.Schema({
    nombre: {
        type: String,
        required: true
    },
    descripcion: {
        type: String,
    },
    ubicacion: {
        type: String
    },
    datos: {
        //Estos datos los obtendremos de los metadatos
        public_id: String,
        url: String,
        resource_type: String,  //tipo de recurso video/imagen/etc
        format: String,
        asset_id: String,
        width: String,
        height: String,
        duracion: Number
    },
    playlist: [{
        playlistId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'playlist.model'
        },
        playlistName: String
    }]
}, {
    //Este campo añade la fecha de creación y la fecha de actualizacion
    timestamps: true
})
// Asociación con el modelo
let File = mongoose.model('file', fileSchema);
//exportamos
module.exports = File