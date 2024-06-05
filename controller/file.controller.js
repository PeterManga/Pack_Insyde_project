//modulos necesarios
const fileModel = require('../models/file.model.js');
const cloudinary = require('../utils/cloudinary.js');
const playlistModel = require('../models/playlist.model.js')
const Calendar = require('../models/calendar.model.js');
const fsExtra = require('fs-extra')
const archiver = require('archiver')
const axios = require('axios');
const mongoose = require('mongoose');

//Este método nos devuelve todos los vides alojados en nuetra base de datos.
const getAllFiles = async (req, res) => {

    try {
        //El parametro req.query devuelve los objetos que coinciden 
        //con los parametros solicitados por el usuario
        const file = await fileModel.find();
        res.json(file);
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
}


//Este método devuelve un video según el id indicado
const getFile = async (req, res) => {

    try {
        //recogemos el id proporcionado por el usuario
        const findFile = await fileModel.findOne({ _id: req.params.id });
        //si no encontramos datos relacionados con el id mostramos el siguiente mensaje
        if (!findFile) {
            res.status(404).json({
                message: 'El video no existe'
            })
        }
        //Si todo sale bien mostramos los datos en la respuesta
        res.send(findFile)
    } catch (error) {
        console.error(error);
        res.status(500).send(error);
    }
}

//metodo para obtener los metadatos de un archivo y así obtener la duración y otros datos
const getMetadatos = async (req, res) => {
    try {
        const metadatosVideo = await cloudinary.getMetadata(req.params.id)
        res.send(metadatosVideo)
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener los metadatos' });
    }
}

// Este método nos permite crear de un nuevo  objeto del modelo y añadirlo a la base de datos

const createFile = async (req, res) => {

    try {
        //comprobamos que se ha subido un archivo
        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).send('No se ha encontrado ningún archivo.');
        }
        else {
            console.log(req.body)
            //recogemos los datos y los asignamos al modelo
            //Corregir: El toLowerCase en caso que el usuario no ponga alguno de los campos
            let nombre = req.body.nombre
            let descripcion = req.body.descripcion
            let ubicacion = req.body.ubicacion
            let playlists = req.body.playlists
            let ImagenDuracion = req.body.duracion
            let arrayPlaylist = []

            //parseamos los datos recogidos
            nombre == undefined ? nombre = null : nombre = nombre.toLowerCase();
            descripcion == undefined ? descripcion = null : nombre = nombre.toLowerCase();
            ubicacion == undefined ? descripcion = null : descripcion = descripcion.toLowerCase();

            const nuevoFile = new fileModel({
                nombre: nombre,
                descripcion: descripcion,
                ubicacion: ubicacion
            });

            //Comprobamos que el usuario ingresa el archivo en el campo "archivo" 
            if (req.files?.archivo) {
                let type;

                //detectamos si el usuario esta intentando ingresar una imagen o un video
                //dependiendo del archivo el tipo será un 'video' o 'imagen'
                if (req.files.archivo.mimetype.includes("video")) {
                    type = "video"
                }
                else if (req.files.archivo.mimetype.includes("image")) {
                    type = "image"
                }
                else {
                    //borramos el archivo localmente
                    await fsExtra.unlink(req.files.archivo.tempFilePath)
                    return res.status(404).json({
                        message: 'Archivo no soportado  '
                    })
                }
                /*El video introducido es detectado en los archivos temporales
                y esperamos a que sea subido a cloudinary*/
                const result = await cloudinary.uploadData(req.files.archivo.tempFilePath, type)

                //borramos el archivo localmente
                await fsExtra.unlink(req.files.archivo.tempFilePath)

                //Guardamos el assetID que será usado para obtener la duracion del video en sus metadatos
                const assetID = result.asset_id;

                //Obtenemos los metadatos
                const metadatosVideo = await cloudinary.getMetadata(assetID)
                let duracion;
                //Determinamos el tipo de archivo e indicamos la duración
                if (type === 'video') {
                    duracion = metadatosVideo.video_metadata.format_duration
                } else {
                    duracion = ImagenDuracion
                }
                //recogemos los datos del video subido y se los añadimos al modelo
                nuevoFile.datos = {
                    //Añadimos los siguientes campos, sus valores son obtenidos gracias a los metadatos
                    public_id: result.public_id,
                    url: result.secure_url,
                    format: result.format,
                    width: result.width,
                    height: result.height,
                    asset_id: result.asset_id,
                    resource_type: result.resource_type,
                    duracion: duracion
                }

            }
            else {
                //si el archivo introducido no se encuentra en el campo 'archivo' o no se introduce ninguno
                return res.status(400).send("Ingrese el archivo en el parámetro 'archivo'")
            }

            //asignamos los datos recogidos al nuevo video y esperamos a que se guarden los datos

            await nuevoFile.save();
            //si todo está bien, nos devuelve los datos subidos
            return res.status(201).json(nuevoFile);
        }

    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Error al crear el video' });
    }

}

//Este método nos permite actualizar la información de un objeto de mongo db y al mismo tiempo,
//actualizar el fichero al que se encuntra vinculado en cloudinary
//corregir, eliminar que pueda sustituir el archivo por otro, es mejor que crée un archivo nuevo a modificar uno que ya esté subido

const updateFile = async (req, res) => {
    try {
        //usamos el id proporcionado en la url 
        const filter = { _id: req.params.id }
        let nombre = req.body.nombre
        let descripcion = req.body.descripcion
        let ubicacion = req.body.ubicacion
        let duracion = req.body.duracion
        let operacion = req.body.operacion
        let playlists = req.body.playlist

        console.log(operacion)
        //parseamos los datos recogidos
        nombre == undefined ? nombre = null : nombre = nombre.toLowerCase();
        descripcion == undefined ? descripcion = '' : nombre = nombre.toLowerCase();
        ubicacion == undefined ? descripcion = '' : descripcion = descripcion.toLowerCase();

        let update = {
            nombre: nombre,
            descripcion: descripcion,
            ubicacion: ubicacion

        }
        if (duracion) {

            update.datos = {
                duracion: duracion
            }
        }
        //vinculado a los datos proporcionados por otro nuevo
        //corregir: que el campo duracion sume o reste el valor en las respectivas playlists

        const actualizarFile = await fileModel.findOneAndUpdate(filter, update, {
            new: true
        });

        if (!actualizarFile) {
            return res.status(404).json({
                message: 'Los datos no son correctos'
            })
        }

        // mostramos los datos actualizados al finalizar todas las operaciones
        return res.send(actualizarFile)
    } catch (error) {
        res.status(500).send(error);
    }
}

const deleteFilePlaylist = async (req, res) => {
    try {
        // Obtener la ID de la playlist de la solicitud
        const playlistId = req.body.playlistid;
        // Obtenemos la id del arachivo 
        const id = req.params.id
        // Obtener el archivo por su ID
        const file = await fileModel.findById(req.params.id);

        // Estableceremos la duracion que eliminaremos
        let duracion = file.datos.duracion;
        duracion = parseInt(Math.round(duracion * 100) / 100);
        // filtramos la playlis que eliminaremos
        const filePlaylistUpdated = file.playlist.filter(playlist => !playlist.playlistId.toString().includes(playlistId));
        console.log(filePlaylistUpdated)
        // Obtener la playlist por su ID
        const playlist = await playlistModel.findById(playlistId);

        // Verificar si se encontró la playlist
        if (playlist) {
            // Actualizar la duración de la playlist
            playlist.duracion = parseFloat((playlist.duracion - duracion).toFixed(2));

            // //Actualizar el array de arachivos de la playlist
            playlist.archivos = playlist.archivos.filter((archivo) => !archivo.playlistId.toString().includes(id))
            console.log(playlist.archivos)
            // Guardar los cambios en la playlist
            await playlist.save();

            console.log("Playlist actualizada correctamente");
        } else {
            console.log(`No se encontró la playlist con ID ${playlistId}`);
        }

        // Mostrar los datos actualizados del archivo
        file.playlist = filePlaylistUpdated
        await file.save();
        res.json(file);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error interno del servidor");
    }
};




const deleteFile = async (req, res) => {

    try {
        //Busca el archivo con id proporcionado en la base de datos y este es borrado
        const File = await fileModel.findOneAndDelete({ _id: req.params.id });
        let filePlaylists = File.playlist.map(playlist => playlist.playlistId);
        //Si el archivo, no existe, se mostrará el siguiente error
        if (!File) return res.status(404).json({
            message: 'No se ha encontrado el video'
        })

        //Detectamos si el tipo de achivo
        let type = File.datos.resource_type

        //Se elimina de cloudinary el archivo asociado al objeto eliminado de mongo
        await cloudinary.deleteFile(File.datos.public_id, type)

        for (const playlistId of filePlaylists) {
            try {
                const playlist = await playlistModel.findById(playlistId);
                if (playlist) {
                    const index = playlist.archivos.indexOf(File._id);
                    console.log(index)
                    if (index !== -1) {
                        // El archivo está presente en la lista de archivos de la playlist
                        playlist.archivos.splice(index, 1); // Eliminar el archivo de la lista
                        playlist.duracion -= File.datos.duracion; // Restar la duración del archivo
                        await playlist.save(); // Guardar la playlist actualizada
                    } else {
                        console.log(`El archivo ${File._id} no está en la lista de archivos de la playlist ${playlistId}`);
                    }
                } else {
                    console.log(`No se encontró la playlist con ID ${playlistId}`);
                }
            } catch (error) {
                console.error(`Error al actualizar la playlist ${playlistId}:`, error);
                res.status(500).send(error);
            }
        }
        // mostramos los datos eliminados al finalizar todas las operaciones      
        return res.send(File)

    } catch (error) {
        console.error(error);
        res.status(500).send(error);
    }
}

//este método descarga todos los videos que pertenezcana la ubicación indicada
const downloadPlaylist = async (req, res) => {

    try {
        const playerId = new mongoose.Types.ObjectId(req.query.player);
        console.log(playerId)
        // Obtener todos los calendarios asociados al player
        const calendars = await Calendar.find({ player: playerId }).populate({
            path: 'playlist',
            populate: {
                path: 'archivos.archivoId',
                model: 'file'
            }
        });

        // Extraer todas las playlists de los calendarios
        const allPlaylists = calendars.reduce((acc, calendar) => acc.concat(calendar.playlist), []);

        // Extraer todos los archivos de las playlists
        const allFiles = allPlaylists.reduce((acc, playlist) => acc.concat(playlist.archivos.map(archivo => archivo.archivoId)), []);

        // Eliminar duplicados
        const uniqueFiles = Array.from(new Set(allFiles.map(file => file._id.toString())))
            .map(id => allFiles.find(file => file._id.toString() === id));
        console.log(uniqueFiles.length)
        if (uniqueFiles.length >= 1) {
            // Crear un objeto Archiver para el archivo ZIP
            const zip = archiver('zip', {
                zlib: { level: 9 } // Nivel de compresión
            });
            // Configurar la respuesta HTTP para que el navegador descargue el archivo ZIP
            res.attachment('playlist.zip');
            zip.pipe(res);
            for (const files of uniqueFiles) {
                const url = files.datos.url;
                const nombre = files.nombre;
                const extension = files.datos.format;
                //usamos axios para realizar peticiones a las urls
                const response = await axios.get(url, { responseType: 'stream' });
                const nombreArchivo = `${nombre}.${extension}`;
                zip.append(response.data, { name: nombreArchivo });
            }
            // Finalizar el archivo ZIP y enviarlo
            zip.finalize();

        } else {
            return res.status(300).send('No se han encontrado archivos')
        }
        // res.status(200).json(uniqueFiles);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error interno del servidor");
    }
}


const getFilesByPlayer = async (req, res) => {
    try {
        const playerId = new mongoose.Types.ObjectId(req.query.player);
        console.log(playerId)
        // Obtener todos los calendarios asociados al player
        const calendars = await Calendar.find({ player: playerId }).populate({
            path: 'playlist',
            populate: {
                path: 'archivos.archivoId',
                model: 'file'
            }
        });

        // Extraer todas las playlists de los calendarios
        const allPlaylists = calendars.reduce((acc, calendar) => acc.concat(calendar.playlist), []);

        // Extraer todos los archivos de las playlists
        const allFiles = allPlaylists.reduce((acc, playlist) => acc.concat(playlist.archivos.map(archivo => archivo.archivoId)), []);

        return res.send(allFiles)
        //  res.status(200).json(allFiles);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error interno del servidor");
    }
};



module.exports = { getFile, updateFile, deleteFile, createFile, getAllFiles, getMetadatos, downloadPlaylist, deleteFilePlaylist, getFilesByPlayer }