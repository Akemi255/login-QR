const express = require('express');
const bodyParser = require('body-parser');
const QRCode = require('qrcode');
const fs = require('fs');

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.post('/generarPerfil', async (req, res) => {
    const { nombre, email } = req.body;

    // Crear el perfil con los datos proporcionados
    const perfil = { nombre, email };

    // Almacenar el perfil en el archivo
    guardarPerfil(perfil, res); // Pasa res como parámetro
});

function guardarPerfil(perfil, res) {
    // Leer los perfiles existentes desde el archivo
    let perfiles = [];
    try {
        const data = fs.readFileSync('perfiles.json', 'utf8');
        perfiles = JSON.parse(data);
    } catch (err) {
        // Si el archivo no existe, no hay perfiles aún
    }

    // Generar la contraseña aleatoria
    const contrasena = generarContrasena();

    // Agregar la contraseña al perfil
    perfil.contrasena = contrasena;

    // Agregar el nuevo perfil
    perfiles.push(perfil);

    // Escribir los perfiles de nuevo al archivo
    fs.writeFileSync('perfiles.json', JSON.stringify(perfiles, null, 2));

    // Generar el código QR
    generarCodigoQR(perfil, res); // Pasa res como parámetro
}


async function generarCodigoQR(perfil, res) {
    try {
        // Generar el código QR
        const qrCode = await QRCode.toDataURL(JSON.stringify(perfil));

        // Leer el contenido del archivo HTML
        const htmlPath = 'respuesta.html';
        let htmlContent = fs.readFileSync(htmlPath, 'utf8');

        // Modificar el contenido del HTML con el código QR
        htmlContent = htmlContent.replace('${qrCode}', qrCode);

        // Enviar el archivo HTML modificado como respuesta
        res.send(htmlContent);

    } catch (error) {
        console.error('Error generando código QR:', error);
        res.status(500).send('Error generando código QR');
    }
}
function generarContrasena() {
    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let contrasena = '';

    for (let i = 0; i < 8; i++) {
        const indice = Math.floor(Math.random() * caracteres.length);
        contrasena += caracteres.charAt(indice);
    }

    return contrasena;
}


app.listen(port, () => {
    console.log(`La aplicación está corriendo en http://localhost:${port}`);
});
