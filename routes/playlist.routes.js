//importamos los módulos necesarios.
const express = require('express');
const router = express.Router();
const playListController = require('../controller/playlist.controller')
const authRequired = require('../middlewares/auth.middleware')

//rutas get
router.get('/playlists',authRequired, playListController.getAllPlaylist)
router.get('/playlist/:id',authRequired, playListController.getPlaylist)

//rutas post
router.post('/playlist',authRequired, playListController.createPlaylist )

//rutas delete
router.delete('/playlist/:id',authRequired, playListController.deletePlaylist)

//rutas put (update)
router.put('/playlist/:id',authRequired, playListController.updatePlaylist)
router.put('/playlistdetails/:id/addFile',authRequired, playListController.addPlaylistFile)
router.put('/playlistdetails/:id/deleteFile',authRequired, playListController.deletePlaylistFile)
router.put('/playlistdetails/:id/updateplaylist',authRequired, playListController.updatePlaylistFile)

//exportamos
module.exports = router