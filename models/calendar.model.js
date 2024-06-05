const mongoose = require('mongoose');

const calendarSchema = mongoose.Schema({
    nombre: {
        type: String,
        required: true
    },
    descripcion:{
        type: String
    },
    fechaInicio:{
        type: Date
    },
    fechaFin:{
        type: Date
    },
    playlist: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'playlist'
    }],
    player: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'player',
        required: true
    },
}, {
    timestamps: true
});

const Calendar = mongoose.model('calendar', calendarSchema);
module.exports = Calendar;
