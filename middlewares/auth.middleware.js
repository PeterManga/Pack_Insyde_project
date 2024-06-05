const jwt = require('jsonwebtoken')
require('dotenv').config();

const authRequired = (req, res, next) => {
    try {
        const { token } = req.cookies
        if (!token) {
            return res.status(401).json({ message: "No token, authorization denied" })
        }
        else {
            jwt.verify(token, process.env.token_secret, (err, user) => {
                if (err) {
                    return res.status(403).json({ message: "Invalid token" })
                }

                req.user = user
                console.log(user)
                next();
            })
        }

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}
module.exports = authRequired;
