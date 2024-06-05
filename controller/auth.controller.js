const userModel = require('../models/user.model')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
require('dotenv').config();
const { createAccessToken } = require('../utils/jwt')


const login = async (req, res) => {
    try {
        //encriptar la contraseña
        const { email, password } = req.body;
        const userFound = await userModel.findOne({ email })
        if (userFound) {
            const isMatch = await bcrypt.compare(password, userFound.password)
            if (isMatch == true) {
                const token = await createAccessToken({ id: userFound._id })
                res.cookie("token", token,{
                    sameSite: 'None',
                    secure: process.env.NODE_ENV === 'production',
                    maxAge: 2 * 24 * 60 * 60 * 1000 // 2 días
                })
                

                res.json({
                    id: userFound._id,
                    username: userFound.username,
                    email: userFound.email
                });
            }
            else {
                return res.status(400).json({ message: "invalid password" })
            }
        } else {
            return res.status(400).json({ message: "User not found" })
        }


    } catch (error) {
        console.error(error);
        res.status(500).send(error);
    }
};
const register = async (req, res) => {
    try {
        //encriptar la contraseña
        const { email, password, username } = req.body;
        const passwordHash = await bcrypt.hash(password, 10,)
        const newUser = new userModel({
            username,
            email,
            password: passwordHash
        })

        //esperamos a que se guarden los datos
        await newUser.save()
        //createAcessToken nos devolverá una promesa con un token, este token lo gudaremos como una cookie
        const token = await createAccessToken({ id: newUser._id })
        res.cookie("token", token)
        const result = {
            id: newUser._id,
            username: newUser.username,
            email: newUser.email
        }
        res.send(result)

        //Creacion del token, al guardarse el usuario, devolvemos el un mensaje , y si hay un error, un mensaje con el error

    } catch (error) {
        console.error(error);
        res.status(500).send(error);
    }
};

const logout = async (req, res) =>{
    res.cookie('token', "",{
        expires: new Date (0)
    })
    return res.sendStatus(200)
}

const verifyToken = async (req, res) => {
    const { token } = req.cookies;
    if (!token) return res.send(false);
  
    jwt.verify(token, process.env.token_secret, async (error, user) => {
      if (error) return res.sendStatus(401).json({ message: "token invalido" });
  
      const userFound = await userModel.findById(user.id);
      if (!userFound) return res.sendStatus(401).json({ message: "usuario no existente" });
  
      return res.json({
        id: userFound._id,
        username: userFound.username,
        email: userFound.email,
      });
    });
  };


module.exports = {
    login, register,logout,verifyToken
};
