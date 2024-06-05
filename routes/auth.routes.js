//importamos los módulos necesarios.
const express = require('express');
const router = express.Router();
const { login, register,logout, verifyToken } = require('../controller/auth.controller');
const validateSchema = require('../middlewares/validator.middleware');
const { loginSchema } = require('../schemas/auth.schema');

//rutas post (crear)
router.post('/login',validateSchema(loginSchema), login);
router.post('/register', register);
router.post('/logout', logout);
router.get("/verify", verifyToken);
router.post("/logout", verifyToken, logout);


module.exports = router