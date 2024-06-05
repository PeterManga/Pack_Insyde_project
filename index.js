// Importar módulos necesarios
const mongoose = require('mongoose');
const app = require('./app');
require('dotenv').config();
mongoose.Promise = global.Promise;

// Obtener la URL de la conexión desde el archivo .env
const url = process.env.URL;

// Realizar la conexión con mongoose
mongoose.connect(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Definir el puerto donde escuchará la aplicación
const PORT = process.env.PORT || 3000;

// Iniciar el servidor en el puerto especificado
app.listen(PORT, () => {
    console.log(`Servidor Express en ejecución: Puerto ${PORT}`);
});

// Exportar la aplicación de Express para ser utilizada por Vercel
module.exports = app;
