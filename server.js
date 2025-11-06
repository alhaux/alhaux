const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

// Servir archivos estáticos
app.use(express.static('.'));

// Ruta para el test de catálogo
app.get('/test', (req, res) => {
    res.sendFile(path.join(__dirname, 'test-catalog-load.html'));
});

// Ruta principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'templates', 'Index.html'));
});

app.listen(port, () => {
    console.log(`Servidor ejecutándose en http://localhost:${port}`);
    console.log(`Test de catálogo: http://localhost:${port}/test`);
});