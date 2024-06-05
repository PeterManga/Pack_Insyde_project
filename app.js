// Importar módulos necesarios
const express = require('express');
const videoRoutes = require('./routes/file.routes');
const indexRoutes = require('./routes/index.routes');
const playerRoutes = require('./routes/player.routes');
const playlistRoutes = require('./routes/playlist.routes');
const calendarRoutes = require('./routes/calendar.routes');
const authRoutes = require('./routes/auth.routes');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload');
const cors = require('cors');
// Crear una instancia de Express
const app = express();
app.use(express.json());
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(cookieParser());
// Configurar CORS
app.use(cors({
    origin: ['https://crud-insyde.vercel.app','https://crud-insyde.vercel.app/login', '*'],
    credentials: true,
}));
// Middleware para habilitar CORS y permitir el uso de credenciales
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*','https://crud-insyde.vercel.app/login','https://crud-insyde.vercel.app');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method','*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE,*');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE,*');
    res.header("Access-Control-Allow-Credentials", "true",'*'); 
    next();
});
// Fileupload para subir archivos
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: './tmp/'
}));

// Usamos las rutas definidas en otros archivos
app.use(videoRoutes);
app.use(indexRoutes);
app.use(playerRoutes);
app.use(playlistRoutes);
app.use(calendarRoutes);
app.use(authRoutes);

module.exports = app;
