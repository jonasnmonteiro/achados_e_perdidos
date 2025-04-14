const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const itemsRoutes = require('./routes/items');

app.use(cors());
app.use(express.json());

// Servir o index.html que está no mesmo nível de server.js
app.use(express.static('.'));

app.use('/api/items', itemsRoutes);

module.exports = app;
