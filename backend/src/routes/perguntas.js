const express = require('express');
const db = require('../db');
const router = express.Router();

// Listar todas as perguntas ativas
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT id, enunciado, opcao_a, opcao_b, opcao_c, data_criacao FROM perguntas WHERE ativa = true ORDER BY data_criacao DESC'
        );
        res.json(rows);
    } catch (error) {
        console.error('Erro ao buscar perguntas:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Buscar uma pergunta específica
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT id, enunciado, opcao_a, opcao_b, opcao_c FROM perguntas WHERE id = ? AND ativa = true',
            [req.params.id]
        );
        
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Pergunta não encontrada' });
        }
        
        res.json(rows[0]);
    } catch (error) {
        console.error('Erro ao buscar pergunta:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Criar nova pergunta (para professores)
router.post('/', async (req, res) => {
    try {
        const { enunciado, opcao_a, opcao_b, opcao_c, resposta_correta } = req.body;
        
        // Validação básica
        if (!enunciado || !opcao_a || !opcao_b || !opcao_c || !resposta_correta) {
            return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
        }
        
        if (!['A', 'B', 'C'].includes(resposta_correta)) {
            return res.status(400).json({ error: 'Resposta correta deve ser A, B ou C' });
        }
        
        const [result] = await db.query(
            'INSERT INTO perguntas (enunciado, opcao_a, opcao_b, opcao_c, resposta_correta) VALUES (?, ?, ?, ?, ?)',
            [enunciado, opcao_a, opcao_b, opcao_c, resposta_correta]
        );
        
        res.status(201).json({ 
            id: result.insertId, 
            message: 'Pergunta criada com sucesso' 
        });
    } catch (error) {
        console.error('Erro ao criar pergunta:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Atualizar pergunta
router.put('/:id', async (req, res) => {
    try {
        const { enunciado, opcao_a, opcao_b, opcao_c, resposta_correta } = req.body;
        
        const [result] = await db.query(
            'UPDATE perguntas SET enunciado = ?, opcao_a = ?, opcao_b = ?, opcao_c = ?, resposta_correta = ? WHERE id = ?',
            [enunciado, opcao_a, opcao_b, opcao_c, resposta_correta, req.params.id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Pergunta não encontrada' });
        }
        
        res.json({ message: 'Pergunta atualizada com sucesso' });
    } catch (error) {
        console.error('Erro ao atualizar pergunta:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// "Deletar" pergunta (na verdade, desativar)
router.delete('/:id', async (req, res) => {
    try {
        const [result] = await db.query(
            'UPDATE perguntas SET ativa = false WHERE id = ?',
            [req.params.id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Pergunta não encontrada' });
        }
        
        res.json({ message: 'Pergunta removida com sucesso' });
    } catch (error) {
        console.error('Erro ao remover pergunta:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

module.exports = router;