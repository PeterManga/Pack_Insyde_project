const calendarModel = require('../models/calendar.model.js')
const playlistModel = require('../models/playlist.model.js')
const mongoose = require('mongoose');


// Esta función nos permite crear un nuevo calendario
const createCalendar = async (req, res) => {
    try {
       console.log(req.body)

        let nombre = req.body.nombre;
        let playlist = req.body.playlist;
        let player = new mongoose.Types.ObjectId(req.body.player)
        let fechainicio = new Date(req.body.fechainicio)
        let fechafin = new Date(req.body.fechafin)
        let descripcion = req.body.descripcion

         // Convertir string de playlists a array de ObjectIds
         const playlistIds = playlist.split(',').map(id =>new  mongoose.Types.ObjectId(id.trim()));
         console.log(req.body)

        const result = new calendarModel({
            nombre: nombre,
            playlist: playlistIds,
            player: player,
            fechaInicio: fechainicio,
            fechaFin: fechafin,
            descripcion: descripcion
        })
        await result.save();
        console.log(result)
        res.status(200).send(result)

    } catch (error) {
        console.error(error)
        res.status(500).send(error)
    }
}

// Esta función devuelve todos los calendarios que se cuentran disponibles en la base de datos
const getAllCalendars = async (req, res) => {
    try {
        let result = await calendarModel.find();
        res.status(200).send(result)
    } catch (error) {
        console.error(error);
        res.status(500).send(error)
    }

}
//Esta función nos permite obtener todos los datos de un calendario con el id proporcionadao por el usuario
const getCalendar = async (req, res) => {
    try {
        const result = calendarModel.findOne({ _id: req.params.id });
        if (!result) {
            res.status(404).json({
                messsage: 'El calendario especificado no existe'
            })
        }
        else {
            res.status(200).send(result)
        }

    } catch (error) {
        console.error(error)
        res.status(500).send(error)
    }
}


//Esta funcion nos permite encontrar ecentos segun el el player
const findCalendarByPlayer = async (req, res) => {
    try {
        let playerId =  new mongoose.Types.ObjectId(req.query.player)
        // Filtrar los calendarios por el ID del player
        const result = await calendarModel.find({ 'player': playerId }).populate('player') // Poblar el campo 'player'
         
        console.log(result);
        res.status(200).send(result); 
    } catch (error) {
        console.error(error);
        res.status(500).send(error);
    }
}
// Esta función elimina el calendario con id proporcionada por el usuario
const deleteCalendar = async (req, res) => {
    try {
        let id = req.params.id
        const result = await calendarModel.findOneAndDelete({ _id: id })
        if (!result) {
            res.status(404).res('No se encuentra el calendario')
        }
        res.status(200).send(result)
    } catch (error) {
        console.error(error);
        res.status(500).send(error)
    }
}
// Función para actualizar el calendario y las playlist que componen este calendario
const updateCalendar = async (req, res) => {
    try {
        let nombre = req.body.nombre;
        let playlist = req.body.playlists;
        let fechainicio = req.body.fechainicio;
        let filter = { _id: req.params.id }
        let update

        if (playlist) {
            update = {
                nombre: nombre,
                fechainicio: fechainicio,
                playlist: playlist
            }
        }
        else {
            update = {
                nombre: nombre,
                fechainicio: fechainicio,
            }
        }
        const result = calendarModel.findOneAndUpdate(filter, update, {
            new: true
        })

        res.status(200).send(result)


    } catch (error) {

    }
}


// Función para obtener el evento activo en la fecha actual
const getActiveEvent = async (req, res) => {
    try {
        const playerId = new mongoose.Types.ObjectId(req.query.player);
        const currentDate = new Date();
        // Consultar el evento activo para el player con el id que indiquemos
        let activeEvent = await calendarModel.findOne({
            player: playerId,
            fechaInicio: { $lte: currentDate },
            fechaFin: { $gte: currentDate }
        }).populate({
            path: 'playlist',
            populate: {
                path: 'archivos.archivoId',
                model: 'file'
            }
        }).populate('player');
        console.log(activeEvent)

        // Si no hay un evento activo, buscar el evento más reciente
        if (!activeEvent) {
            activeEvent = await calendarModel.findOne({
                player: playerId,
                fechaFin: { $lt: currentDate }
            }).sort({ fechaFin: -1 }).populate({
                path: 'playlist',
                populate: {
                    path: 'archivos.archivoId',
                    model: 'file'
                }
            }).populate('player');
        }

        if (activeEvent) {
            console.log(activeEvent)
            res.status(200).json(activeEvent);
        } else {
            res.status(404).json({ message: 'No se han encontrado eventos activos o recientes en este player' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).send(error);
    }
}



//este método descarga todos los videos que pertenezcana la ubicación indicada
const downloadPlaylist = async (req, res) => {

    // try {
    //     //El parametro req.query devuelve los objetos que coinciden 
    //     //con los parametros solicitados por el usuario
    //     let player = req.query.player

    //     const file = await calendarModel.find({ 'player': player })
    //     .populate('playlist')
    //     console.log(file.length);
    //     res.status(200).send(file);
    //     if (file.length >= 1) {
    //         // Crear un objeto Archiver para el archivo ZIP
    //         const zip = archiver('zip', {
    //             zlib: { level: 9 } // Nivel de compresión
    //         });
    //         // Configurar la respuesta HTTP para que el navegador descargue el archivo ZIP
    //         res.attachment('playlist.zip');
    //         zip.pipe(res);
    //         for (const files of file) {
    //             const url = files.datos.url;
    //             const nombre = files.nombre;
    //             const extension = files.datos.format;
    //             //usamos axios para realizar peticiones a las urls
    //             const response = await axios.get(url, { responseType: 'stream' });
    //             const nombreArchivo = `${nombre}.${extension}`;
    //             zip.append(response.data, { name: nombreArchivo });
    //         }
    //         // Finalizar el archivo ZIP y enviarlo
    //         zip.finalize();

    //     } else {
    //         return res.status(300).send('No se han encontrado archivos')
    //     }

    // } catch (error) {
    //     console.log(error);
    //     res.status(500).send(error);
    // }
}

module.exports = { getAllCalendars, getCalendar, createCalendar, deleteCalendar, updateCalendar, findCalendarByPlayer, getActiveEvent, downloadPlaylist }