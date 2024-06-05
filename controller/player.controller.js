const playlistModel = require('../models/playlist.model')

//Importamos los módulos necesarios
const playerModel = require('../models/player.model')

//añadir el campo player para poder almacenar en un array llamado players, los diferentes players
const CreatePlayer = async (req, res) => {
    try {
        //recogemos los datos y los parseamos a minúsculas
        //Con esto evitamos problemas futuros relacionados con
        let nombre = req.body.nombre,
            descripcion = req.body.descripcion,
            altura = req.body.altura,
            anchura = req.body.anchura,
            relacion = req.body.relacion
            
            
            

        //corregir parseo de valores
        //parseamos los valores
        nombre == undefined ? nombre = null : nombre = nombre.toLowerCase()
        descripcion == undefined ? descripcion = null : descripcion = descripcion.toLowerCase()
        altura == undefined ? altura = null : altura 
        anchura == undefined ? anchura = null : anchura
        relacion == undefined ? relacion = null : relacion = relacion.toLowerCase()

        const result = new playerModel({
            nombre: nombre,
            descripcion: descripcion,
            altura: altura,
            anchura: anchura,
            relacion: relacion,
            evento: []

        })
        console.log(result)
        //guardamos los datos y los subimos a mongodb
        await result.save();
        //si todo está bien, nos devuelve los datos subidos
        return res.status(201).json(result);
    } catch (error) {
        console.error(error)
        res.status(500).send({ message: 'No se creado el player correctamente' })
    }
}

//Esta funcion nos devuelve el player con solicitado
const getPlayer = async (req, res) => {
    try {
        //recogemos el id proporcionado con el usuario
        const result = await playerModel.finOne({ _id: req.params.id });
        //Si no encontramos los datos relacionados con el id mostramos el siguiente mensaje
        res.status(400).send("No se encuentra el player solicitado")
    } catch (error) {
        console.error(error)
        res.status(500).send(error)
    }
}

//Esta función devuelve todos los player
const getAllPlayers = async (req, res) => {
    try {
        const result = await playerModel.find();
        res.send(result)
    } catch (error) {
        console.error(error)
        res.status(500).send(error)
    }
}

//Esta función nos sirve para borrrar un player
const deletePlayer = async (req, res) => {
    try {
        //Busca el player con el id proporcionado
        const result = await playerModel.findOneAndDelete({ _id: req.params.id })
        if (!result) {
            res.status(404).send("No se encuentra el player solicitado")
        } else {
            // mostramos los datos del player eliminado     
            return res.send(result)
        }
    } catch (error) {
        console.error(error);
        res.status(500).send(error)
    }
}

const addEvent = async (req, res) => {

    try {
        const playlistID = req.body.playlist
        const inicio = req.body.inicio
        const fin = req.body.fin
        const nombreEvento = req.body.name
        const descripcion = req.body.descripcion
        const playlist = await playerModel.findById(playlistID);
        const nombre = playlist.nombre
        //Parseamos los nuevos valores
        descripcion == undefined ? descripcion = null : descripcion = descripcion.toLowerCase();
        const filter = { _id: req.params.id }
        const evento = {
            playlistID: playlistID,
            playlistName: nombre,
            fechaInicio: inicio,
            fechaFin: fin,



        }
        const result = await playerModel.findById(filter);

        return res.send(result)
    } catch (error) {
        console.error(error)
        res.status(500).send(error)
    }
}
//corregir: que update player actulice correctamente la lista de players
//Esta funcion nos permite actualizar los valores de un player
const updatePlayer = async (req, res) => {
    let nombre, descripcion, etiquetas
    nombre = req.body.nombre;
    descripcion = req.body.descripcion

    //Parseamos los nuevos valores
    nombre == undefined ? nombre = null : nombre = nombre.toLowerCase();
    descripcion == undefined ? descripcion = null : descripcion = descripcion.toLowerCase();
    const filter = { _id: req.params.id }
    const update = {
        nombre: nombre,
        descripcion: descripcion

    }
    try {
        const result = await playerModel.findOneAndUpdate(filter, update, {
            new: true
        })
        return res.send(result)
    } catch (error) {
        console.error(error)
        res.status(500).send(error)
    }
}
module.exports = { CreatePlayer, getPlayer, deletePlayer, updatePlayer, getAllPlayers }