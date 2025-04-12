const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');
const upload = require('../middlewares/upload');

// Rota para cadastrar um novo item (com upload de imagem)
router.post('/itens', upload.single('imagem'), itemController.createItem);

router.get('/itens', itemController.listItems);

router.put('/itens/:id', upload.single('imagem'), itemController.updateItem);

router.delete('/itens/:id', itemController.deleteItem);

module.exports = router;