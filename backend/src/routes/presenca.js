const express = require('express');
const db = require('../db');
const router = express.Router();

// ============================================
// POST /presenca/:licaoId
// Marcar presença em uma lição específica
// ============================================
router.post('/:licaoId', async (req, res) => {
    const { licaoId } = req.params;
    const { nome, palavra_chave } = req.body;

    // Validações básicas
    if (!nome || !palavra_chave) {
        return res.status(400).json({ error: 'Nome e palavra-chave são obrigatórios' });
    }

    try {
        // 1. Buscar a lição e sua palavra-chave
        const licao = await db.query(
            'SELECT id, titulo, palavra_chave FROM licoes WHERE id = $1 AND ativa = true',
            [licaoId]
        );
        if (licao.rows.length === 0) {
            return res.status(404).json({ error: 'Lição não encontrada' });
        }

        const licaoData = licao.rows[0];
        const keywordDB = licaoData.palavra_chave || '';

        // 2. Validar palavra-chave (case‑insensitive)
        if (keywordDB.toLowerCase() !== palavra_chave.toLowerCase()) {
            return res.status(403).json({ error: 'Palavra-chave incorreta' });
        }

        // 3. Verificar se este nome já marcou presença nesta lição
        const existe = await db.query(
            'SELECT id FROM presencas WHERE nome = $1 AND licao_id = $2',
            [nome, licaoId]
        );
        if (existe.rows.length > 0) {
            return res.status(409).json({ error: 'Você já marcou presença para esta lição' });
        }

        // 4. Inserir presença
        await db.query(
            'INSERT INTO presencas (nome, licao_id) VALUES ($1, $2)',
            [nome, licaoId]
        );

        res.status(201).json({ message: 'Presença registrada com sucesso!' });
    } catch (error) {
        console.error('Erro ao registrar presença:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// ============================================
// GET /presenca/por-licao/:licaoId
// Listar presenças de uma lição (para o professor)
// ============================================
router.get('/por-licao/:licaoId', async (req, res) => {
    const { licaoId } = req.params;
    try {
        const presencas = await db.query(
            `SELECT nome, data_presenca 
             FROM presencas 
             WHERE licao_id = $1 
             ORDER BY data_presenca DESC`,
            [licaoId]
        );
        res.json({
            licao_id: licaoId,
            total: presencas.rows.length,
            presencas: presencas.rows
        });
    } catch (error) {
        console.error('Erro ao listar presenças:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// ============================================
// GET /presenca/verificar/:licaoId
// Verificar se um nome já marcou presença
// ============================================
router.get('/verificar/:licaoId', async (req, res) => {
    const { licaoId } = req.params;
    const { nome } = req.query;
    if (!nome) {
        return res.status(400).json({ error: 'Nome é obrigatório' });
    }
    try {
        const existe = await db.query(
            'SELECT id FROM presencas WHERE nome = $1 AND licao_id = $2',
            [nome, licaoId]
        );
        res.json({ presente: existe.rows.length > 0 });
    } catch (error) {
        console.error('Erro ao verificar presença:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

module.exports = router;