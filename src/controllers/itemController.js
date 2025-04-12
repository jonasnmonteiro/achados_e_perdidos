const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const crypto = require('crypto');

// Função auxiliar para gerar código único de 6 caracteres (hex)
function gerarCodigoUnico() {
  return crypto.randomBytes(3).toString('hex'); // 3 bytes = 6 caracteres hex
}

async function createItem(req, res) {
  try {
    // Extrai campos do corpo da requisição
    const { name, category, date, location, contact, status } = req.body;
    // O Multer fornece o arquivo em req.file
    const file = req.file;
    
    // Gera um código único para este item
    let code = gerarCodigoUnico();
    // (Opcional: poderíamos verificar se já existe algum Item com este code e gerar novamente se existir,
    // mas pela baixa colisão de 6 hex e por ser único no banco, provavelmente não será necessário.)
    
    // Prepara objeto de dados para salvar no banco
    const itemData = {
      name,
      category,
      date: new Date(date),        // converte data para Date
      location,
      contact,
      status,
      code
    };
    if (file) {
      itemData.imagePath = file.filename; // salva nome do arquivo no campo imagePath
    }
    
    // Salva no banco usando Prisma
    const newItem = await prisma.item.create({ data: itemData });
    
    // Retorna o item criado e o código único para o cliente guardar
    return res.status(201).json({
      message: "Item cadastrado com sucesso",
      item: newItem,
      codigoParaEditar: newItem.code
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao cadastrar item" });
  }
}

module.exports = { createItem /*, outras funções serão exportadas depois */ };

async function listItems(req, res) {
  try {
    const { category, status, location, q } = req.query;
    // Construir objeto de filtro condicionalmente
    let filter = {};
    if (category) {
      filter.category = category;
    }
    if (status) {
      filter.status = status;
    }
    if (location) {
      // Filtrar localização por contenção (contém) caso-insensitivo
      filter.location = { contains: location, mode: 'insensitive' };
    }
    if (q) {
      // Busca por palavra-chave 'q' no nome ou localização (pode ampliar para outros campos se desejado)
      filter.OR = [
        { name:      { contains: q, mode: 'insensitive' } },
        { location:  { contains: q, mode: 'insensitive' } }
      ];
    }
    const items = await prisma.item.findMany({
      where: filter,
      orderBy: { createdAt: 'desc' }
    });
    return res.json(items);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao buscar itens" });
  }
}
async function updateItem(req, res) {
  try {
    const { id } = req.params;
    const { name, category, date, location, contact, status, code } = req.body;
    const file = req.file;
    
    // Busca o item existente no banco
    const item = await prisma.item.findUnique({ where: { id: Number(id) } });
    if (!item) {
      return res.status(404).json({ error: "Item não encontrado" });
    }
    // Verifica o código
    if (item.code !== code) {
      return res.status(403).json({ error: "Código fornecido inválido" });
    }
    
    // Monta dados para atualizar (apenas campos enviados)
    let dataToUpdate = {};
    if (name) dataToUpdate.name = name;
    if (category) dataToUpdate.category = category;
    if (date) dataToUpdate.date = new Date(date);
    if (location) dataToUpdate.location = location;
    if (contact) dataToUpdate.contact = contact;
    if (status) dataToUpdate.status = status;
    if (file) {
      dataToUpdate.imagePath = file.filename;
      // (Opcional: remover arquivo antigo do disco, se existir:)
      if (item.imagePath) {
        const fs = require('fs').promises;
        try {
          await fs.unlink(`uploads/${item.imagePath}`);
        } catch (err) {
          console.error("Aviso: não foi possível remover imagem antiga:", err);
        }
      }
    }
    
    const updatedItem = await prisma.item.update({
      where: { id: Number(id) },
      data: dataToUpdate
    });
    return res.json({ message: "Item atualizado", item: updatedItem });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao atualizar item" });
  }
}
async function deleteItem(req, res) {
  try {
    const { id } = req.params;
    const { code } = req.body;
    
    const item = await prisma.item.findUnique({ where: { id: Number(id) } });
    if (!item) {
      return res.status(404).json({ error: "Item não encontrado" });
    }
    if (item.code !== code) {
      return res.status(403).json({ error: "Código fornecido inválido" });
    }
    // Se tiver imagem, remover arquivo
    if (item.imagePath) {
      const fs = require('fs').promises;
      try {
        await fs.unlink(`uploads/${item.imagePath}`);
      } catch (err) {
        console.error("Aviso: erro ao excluir imagem do item:", err);
      }
    }
    await prisma.item.delete({ where: { id: Number(id) } });
    return res.json({ message: "Item removido com sucesso" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao remover item" });
  }
}
