const express = require('express');
const serverless = require('serverless-http');

const app = express();

app.get('/', (req, res) => {
  res.send('Merhaba, Vercel Express serverless fonksiyonu çalışıyor!');
});

module.exports = serverless(app);
