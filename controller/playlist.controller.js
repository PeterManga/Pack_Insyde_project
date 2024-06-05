//Importación de módulos necesarios
const playlistModel = require('../models/playlist.model')
const fileModel = require('../models/file.model');
const mongoose = require('mongoose');
const { json } = require('body-parser');


const getAllPlaylist = async (req, res) => {
    try {
        const result = await playlistModel.find();
        res.json(result)
    } catch (error) {
        console.error(error)
    }
}
const getPlaylist = async (req, res) => {
    try {
        let id = req.params.id;
        let result = await playlistModel.findOne({ _id: id }).populate()
        return res.send(result)
    } catch (error) {
        console.error(error)
        res.status(500).send(error)
    }

}

const deletePlaylist = async (req, res) => {
    try {
        const playlistId = req.params.id;

        // Buscar todos los archivos que tienen esta playlist
        const filesToUpdate = await fileModel.find({ 'playlist.playlistId': playlistId });
        // Eliminar la referencia a la playlist en cada archivo
        const updatePromises = filesToUpdate.map(async (file) => {
            file.playlist = file.playlist.filter(playlist => playlist.playlistId.toString() !== playlistId, console.log(file.playlist)
            );
            await file.save();
        });

        // Esperar a que todas las actualizaciones se completen
        await Promise.all(updatePromises);

        // Eliminar la playlist
        const result = await playlistModel.findOneAndDelete({ _id: playlistId });

        res.status(200).send(result);
    } catch (error) {
        console.error(error);
        res.status(500).send(error);
    }
};

//Esta función nos permite añadir un archivo a la playlist
//Corregir: que al añadir un archivo a la playlist, la playlist no se repita aun que el mismo archivo se encuentre repetido 
const addPlaylistFile = async (req, res) => {
    const playlistId = req.params.id;
    const fileID = req.body.fileID
    const filename = req.body.filename
    let duracion = req.body.duracion
    const playlistName = req.body.playlistname

    // Redondear la duración del archivo
    duracion = parseFloat(Math.round(duracion * 100) / 100);
    console.log(duracion)

    try {
        const file = await fileModel.findById(fileID);
        const playlistUpdate = {
            playlistId: playlistId,
            playlistName: playlistName
        };

        file.playlist.push(playlistUpdate);
        await file.save(); // Guardar los cambios en el archivo

        const playlist = await playlistModel.findById(playlistId);
        if (playlist) {

            // Redondear la duración después de realizar operaciones aritméticas
            playlist.duracion = parseFloat((playlist.duracion + duracion).toFixed(2));
            await playlist.save();

            const fileToAdd = {
                archivoId: fileID,
                fileName: filename
            };

            // Añadir el archivo a la playlist y guardar los cambios
            playlist.archivos.push(fileToAdd);
            await playlist.save();

            console.log("Playlist actualizada correctamente");
            res.status(200).send(playlist); // Devolver la playlist actualizada
        } else {
            console.log(`No se encontró la playlist con ID ${playlistId}`);
            res.status(404).send("No se encontró la playlist");
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("Error interno del servidor");
    }
}
//Esta función nos permite añadir un archivo a la playlist
const deletePlaylistFile = async (req, res) => {

    try {
        const playlistId = req.params.id;
        let archivos;
        // console.log(typeof(req.body.archivos))
        // console.log(req.body.archivos)
        if (typeof (req.body.archivos) == 'object') {
            archivos = req.body.archivos.map(JSON.parse)
        }
        else {
            archivos = JSON.parse(req.body.archivos)
            console.log(typeof (archivos))
        }
        // if(req.body.archivos.length>1 && typeof(req.body.archivos)==Object){
        //      archivos = req.body.archivos.map(JSON.parse)
        // }
        // else if(req.body.archivos==undefined){
        //     archivos = []
        // }
        // else{
        //     archivos= JSON.parse(req.body.archivos)
        // }
        // console.log(archivos)
        // console.log(typeof(archivos))


        const fileID = req.body.fileid
        console.log(archivos)

        const file = await fileModel.findById(fileID);
        console.log(file.playlist)
        const duracion = file.datos.duracion;
        // Eliminar solo una instancia específica de la playlist del archivo
        const playlistIndex = file.playlist.findIndex(pl => pl.playlistId.toString() === playlistId);
        if (playlistIndex !== -1) {
            file.playlist.splice(playlistIndex, 1);
            await file.save();
        }
        console.log(file.playlist)
        const playlist = await playlistModel.findById(playlistId);
        if (playlist) {
            // Actualizar la duración de la playlist y guardar los cambios
            // Redondear la duración después de realizar operaciones aritméticas
            playlist.duracion = parseFloat((playlist.duracion - duracion).toFixed(2));
            // Añadir el archivo a la playlist y guardar los cambios
            playlist.archivos = archivos;
            await playlist.save();

            console.log("Playlist actualizada correctamente");
            res.status(200).send(playlist); // Devolver la playlist actualizada
        } else {
            console.log(`No se encontró la playlist con ID ${playlistId}`);
            res.status(404).send("No se encontró la playlist");
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("Error interno del servidor");
    }
}

//Esta función nos permite añadir un archivo a la playlist
//Corregir: que al añadir un archivo a la playlist, la playlist no se repita aun que el mismo archivo se encuentre repetido 
const updatePlaylistFile = async (req, res) => {
    try {
        const playlistId = req.params.id;
        const playlistFiles = JSON.parse(req.body.files);
        const playlist = await playlistModel.findById(playlistId);

        if (playlist) {
            // Actualiza el valor de los archivos de la playlist con los nuevos archivos obtenidos
            playlist.archivos = playlistFiles;
            await playlist.save();
            console.log("Playlist actualizada correctamente");
            res.status(200).send(playlist); // Devolver la playlist actualizada
        } else {
            console.log(`No se encontró la playlist con ID ${playlistId}`);
            res.status(404).send("No se encontró la playlist");
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("Error interno del servidor");
    }
}

// Este método solo permitirá crear la playlist, 
// será vacia y luego crearemos otro método para añadir los archivos a la playlist
const createPlaylist = async (req, res) => {
    try {
        let nombre = req.body.nombre
        let duracion = req.body.duracion || 0;
        let descripcion = req.body.descripcion

        //Parseamos los valores
        nombre == nombre.trim() == 0 ? nombre = undefined : nombre = nombre.toLowerCase();
        descripcion == descripcion.trim() == 0 ? descripcion = undefined : descripcion = descripcion.toLowerCase();


        //asignamos a result los valore sobtenidos
        const result = new playlistModel({
            nombre: nombre,
            // archivos: arrayArchivos,
            descripcion: descripcion,
            duracion: duracion
        })
        //Esperamos a que se guarde la playlist y mostramos los resultados
        await result.save();
        return res.status(201).json(result);
    } catch (error) {
        console.error(error)
        res.status(500).send({ error })
    }

}

// método para actualizar los datos de una playlist
const updatePlaylist = async (req, res) => {
    let filter = { _id: req.params.id }
    let nombre = req.body.nombre
    let descripcion = req.body.descripcion
    let update

    update = {
        nombre: nombre,
        descripcion: descripcion,
    }

    try {
        const result = await playlistModel.findOneAndUpdate(filter, update, {
            new: true
        })
        res.status(200).send(result)

    } catch (error) {
        console.error(error)
        res.status(500).send(error)
    }
}


module.exports = { createPlaylist, getAllPlaylist, getPlaylist, deletePlaylist, updatePlaylist, addPlaylistFile, deletePlaylistFile, updatePlaylistFile }