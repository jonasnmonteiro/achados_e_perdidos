const express = require('express');
const app = express();

app.use(express.json()); // middleware para interpretar JSON no corpo das requisições

app.get('/', (req, res) => {
  res.send('API de Achados e Perdidos - funcionando!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
/*
app.use('/uploads', express.static('uploads'));

const itemRoutes = require('./src/routes/itemRoutes');
app.use(itemRoutes);
*/