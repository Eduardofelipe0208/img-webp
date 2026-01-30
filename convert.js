const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Configuración de carpetas
const inputFolder = './input';
const outputFolder = './output';

// Crear carpeta output si no existe
if (!fs.existsSync(outputFolder)){
    fs.mkdirSync(outputFolder);
}

// Leer el directorio input
fs.readdir(inputFolder, (err, files) => {
    if (err) {
        console.error("Error: No se pudo leer la carpeta 'input'. Asegúrate de que exista.", err);
        return;
    }

    files.forEach(file => {
        const inputPath = path.join(inputFolder, file);
        // Obtener extensión y nombre
        const ext = path.extname(file).toLowerCase();
        const fileName = path.parse(file).name;

        // AHORA INCLUIMOS .avif EN ESTA LISTA
        if (['.jpg', '.jpeg', '.png', '.avif'].includes(ext)) {
            const outputPath = path.join(outputFolder, `${fileName}.webp`);

            sharp(inputPath)
                .webp({ quality: 80 }) 
                .toFile(outputPath)
                .then(info => {
                    console.log(`✅ Convertido: ${file} -> ${fileName}.webp`);
                })
                .catch(err => {
                    console.error(`❌ Error al convertir ${file}:`, err);
                });
        } else {
            // Ignorar archivos que no sean imágenes
            if (ext) console.log(`⚠️ Saltado (formato no soportado): ${file}`);
        }
    });
});