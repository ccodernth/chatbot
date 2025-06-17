// server.js
require('dotenv').config();
const http = require('http');
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

// Veritabanına bağlan
connectDB();

const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda çalışıyor...`);
});
