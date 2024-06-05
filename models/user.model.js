
 //importación de módulos
 const mongoose = require('mongoose');

 userSchema = mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    password:{
        type: String,
        required: true
    }
    
 },{
     //Este campo añade la fecha de creación y la fecha de actualizacion
     timestamps: true
 })

 // Asociación con el modelo
let User = mongoose.model('user', userSchema);

//exportamos
module.exports = User
 

