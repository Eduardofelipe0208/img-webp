const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const archiver = require('archiver'); // Nuevo: Para crear ZIPs

const app = express();
const port = 3000;

// Aumentamos el límite de tamaño y cantidad (hasta 100 archivos)
const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB por archivo
});

app.use(express.static('public'));

app.post('/convert', upload.array('images', 100), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).send('No se subieron imágenes.');
        }

        // CASO A: Solo 1 imagen (Comportamiento original)
        if (req.files.length === 1) {
            const file = req.files[0];
            const webpBuffer = await sharp(file.buffer)
                .webp({ quality: 80 })
                .toBuffer();

            const originalName = path.parse(file.originalname).name;
            res.set('Content-Type', 'image/webp');
            res.set('Content-Disposition', `attachment; filename="${originalName}.webp"`);
            return res.send(webpBuffer);
        }

        // CASO B: Múltiples imágenes (Crear ZIP)
        const archive = archiver('zip', { zlib: { level: 9 } });

        res.set('Content-Type', 'application/zip');
        res.set('Content-Disposition', 'attachment; filename="imagenes_optimizadas.zip"');

        // Conectar el ZIP a la respuesta (stream)
        archive.pipe(res);

        // Procesar cada imagen y agregarla al ZIP
        for (const file of req.files) {
            const webpBuffer = await sharp(file.buffer)
                .webp({ quality: 80 })
                .toBuffer();
            
            const name = path.parse(file.originalname).name;
            archive.append(webpBuffer, { name: `${name}.webp` });
        }

        // Finalizar el ZIP
        await archive.finalize();

    } catch (error) {
        console.error('Error:', error);
        if (!res.headersSent) res.status(500).send('Error en la conversión.');
    }
});

app.listen(port, () => {
    console.log(`Servidor Batch listo en http://localhost:${port}`);
});