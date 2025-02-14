require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dns = require('dns');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));

// Almacenar URLs en memoria
let urlDatabase = [];
let counter = 1;

// Página de inicio
app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// API Endpoint para acortar URLs
app.post('/api/shorturl', function (req, res) {
  let originalUrl = req.body.url;

  // Validar si la URL tiene un formato correcto
  const urlPattern = /^https?:\/\/(www\.)?[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  if (!urlPattern.test(originalUrl)) {
    return res.json({ error: 'invalid url' });
  }

  // Extraer el hostname para validarlo con DNS
  const urlObj = new URL(originalUrl);
  dns.lookup(urlObj.hostname, (err) => {
    if (err) {
      return res.json({ error: 'invalid url' });
    }

    // Guardar la URL con un ID único
    urlDatabase.push({ original_url: originalUrl, short_url: counter });

    res.json({ original_url: originalUrl, short_url: counter });

    counter++;
  });
});

// Redirigir a la URL original
app.get('/api/shorturl/:short_url', function (req, res) {
  const shortUrl = parseInt(req.params.short_url);
  const foundUrl = urlDatabase.find((entry) => entry.short_url === shortUrl);

  if (foundUrl) {
    return res.redirect(foundUrl.original_url);
  } else {
    return res.json({ error: 'No short URL found' });
  }
});

// Iniciar el servidor
app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
