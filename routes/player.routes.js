//importamos los módulos necesarios.
const express = require('express');
const router = express.Router();
const playerController = require('../controller/player.controller')
const authRequired = require('../middlewares/auth.middleware')

//definimos las rutas

//rutas get
router.get('/players',authRequired, playerController.getAllPlayers)
router.get('/player/:id', authRequired, playerController.getPlayer)

//rutas post (crear)
router.post('/player', authRequired, playerController.CreatePlayer);

//rutas delete (eliminar)
router.delete('/player/:id',authRequired, playerController.deletePlayer)

//rutas put (update)
router.put('/player/:id',authRequired,playerController.updatePlayer)
//exportamos
module.exports = router