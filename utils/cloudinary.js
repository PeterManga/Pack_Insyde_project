const app = require('../app')
require('dotenv').config();
const cloudinary = require('cloudinary').v2
// Datos necesarios para el correcto funcionamiento de la api cloudinary
// Los datos están protegidos en el archivo ".env"
cloudinary.config({ 
    cloud_name: process.env.cloud_name, 
    api_key: process.env.api_key, 
    api_secret: process.env.api_secret
  });
// Función para subir archivos a cloudinary
async function uploadData(filePath,type){
    return await cloudinary.uploader.upload(filePath,{
        folder: "Archivos",
        resource_type: type
    })
}
//Función para borrar los archivos de cloudinary
async function deleteFile(public_id, type){
    return await cloudinary.uploader.destroy(public_id,{
        resource_type: type
    })   
}
// Funcion para obtener los metadatos de un archivo
async function getMetadata(asset_id){
    return await cloudinary.api.resource_by_asset_id(asset_id,{
        media_metadata: true
    })   
}
//funcion experimental para añadir la duracion a un video que acabamos de crear
async function addDuration(asset_id){
    var longitud_video;
    const duration = await getMetadata(result.asset_id)
    longitud_video=duration.video_metadata.format_duration
    return longitud_video
}
//exportamos las funciones
module.exports = {
    uploadData, getMetadata, deleteFile, addDuration
};