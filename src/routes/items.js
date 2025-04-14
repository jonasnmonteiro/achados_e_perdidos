const express = require('express');
const router = express.Router();
const pool = require('../db/pool');

// GET com filtros e busca
router.get('/', async (req, res) => {
    try {
      const { categoria, localizacao, status, busca } = req.query;
      const values = [];
      let query = 'SELECT * FROM items WHERE 1=1';
  
      // Filtros opcionais
      if (categoria) {
        values.push(categoria);
        query += ` AND categoria = $${values.length}`;
      }
  
      if (localizacao) {
        values.push(localizacao);
        query += ` AND localizacao ILIKE $${values.length}`;
      }
  
      if (status) {
        values.push(status);
        query += ` AND status = $${values.length}`;
      }
  
      if (busca) {
        values.push(`%${busca}%`);
        query += ` AND (nome ILIKE $${values.length} OR localizacao ILIKE $${values.length})`;
      }
  
      query += ' ORDER BY data DESC';
  
      const result = await pool.query(query, values);
      res.json(result.rows);
    } catch (err) {
      console.error('Erro ao buscar itens:', err);
      res.status(500).json({ error: 'Erro ao buscar itens' });
    }
  });

// POST - Cadastro de item perdido/encontrado
router.post('/', async (req, res) => {
    try {
      const {
        nome,
        categoria,
        data,
        localizacao,
        contato,
        foto,     // campo opcional (URL ou base64 por enquanto)
        status
      } = req.body;
  
      // Validação básica
      if (!nome || !categoria || !data || !localizacao || !contato || !status) {
        return res.status(400).json({ error: 'Preencha todos os campos obrigatórios.' });
      }
  
      // Geração de um código único para permitir edição/remoção futura
      const codigo = Math.random().toString(36).substring(2, 10).toUpperCase();
  
      const query = `
        INSERT INTO items (nome, categoria, data, localizacao, contato, foto, status, codigo)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *;
      `;
  
      const values = [nome, categoria, data, localizacao, contato, foto || null, status, codigo];
  
      const result = await pool.query(query, values);
  
      res.status(201).json({
        message: 'Item cadastrado com sucesso!',
        item: result.rows[0],
        codigo: codigo // Retorna o código único gerado
      });
    } catch (err) {
      console.error('Erro ao cadastrar item:', err);
      res.status(500).json({ error: 'Erro ao cadastrar item' });
    }
  });


  // PUT - Atualizar item usando o código único
router.put('/:codigo', async (req, res) => {
    try {
      const { codigo } = req.params;
      const {
        nome,
        categoria,
        data,
        localizacao,
        contato,
        foto,
        status
      } = req.body;
  
      // Busca o item existente pelo código
      const existingItem = await pool.query('SELECT * FROM items WHERE codigo = $1', [codigo]);
  
      if (existingItem.rows.length === 0) {
        return res.status(404).json({ error: 'Item não encontrado com o código informado.' });
      }
  
      // Atualiza apenas os campos fornecidos (patch-like)
      const updateQuery = `
        UPDATE items
        SET
          nome = COALESCE($1, nome),
          categoria = COALESCE($2, categoria),
          data = COALESCE($3, data),
          localizacao = COALESCE($4, localizacao),
          contato = COALESCE($5, contato),
          foto = COALESCE($6, foto),
          status = COALESCE($7, status)
        WHERE codigo = $8
        RETURNING *;
      `;
  
      const values = [
        nome || null,
        categoria || null,
        data || null,
        localizacao || null,
        contato || null,
        foto || null,
        status || null,
        codigo
      ];
  
      const updated = await pool.query(updateQuery, values);
  
      res.json({
        message: 'Item atualizado com sucesso.',
        item: updated.rows[0]
      });
    } catch (err) {
      console.error('Erro ao atualizar item:', err);
      res.status(500).json({ error: 'Erro ao atualizar item' });
    }
  });

  // DELETE - Remover item usando o código único
router.delete('/:codigo', async (req, res) => {
    try {
      const { codigo } = req.params;
  
      // Verifica se o item existe
      const existingItem = await pool.query('SELECT * FROM items WHERE codigo = $1', [codigo]);
  
      if (existingItem.rows.length === 0) {
        return res.status(404).json({ error: 'Item não encontrado com o código informado.' });
      }
  
      // Remove o item
      await pool.query('DELETE FROM items WHERE codigo = $1', [codigo]);
  
      res.json({ message: 'Item removido com sucesso.' });
    } catch (err) {
      console.error('Erro ao remover item:', err);
      res.status(500).json({ error: 'Erro ao remover item' });
    }
  });
  
  module.exports = router;
  