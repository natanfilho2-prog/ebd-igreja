const express = require('express');
const db = require('../db');
const router = express.Router();

// ============================================
// Rotas existentes (podem ser mantidas ou removidas)
// ============================================

// Listar todas as perguntas ativas
router.get('/', async (req, res) => {
    try {
        const result = await db.query(
            'SELECT id, enunciado, opcao_a, opcao_b, opcao_c, data_criacao FROM perguntas WHERE ativa = true ORDER BY data_criacao DESC'
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Erro ao buscar perguntas:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Listar perguntas por lição
router.get('/licao/:licaoId', async (req, res) => {
    try {
        const result = await db.query(
            'SELECT id, enunciado, opcao_a, opcao_b, opcao_c FROM perguntas WHERE licao_id = $1 AND ativa = true ORDER BY id ASC',
            [req.params.licaoId]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Erro ao buscar perguntas da lição:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// ============================================
// NOVA ROTA: Salvar todas as perguntas de uma lição (substitui as existentes)
// ============================================
router.put('/licao/:licaoId', async (req, res) => {
    const { licaoId } = req.params;
    const { perguntas } = req.body; // array com 6 objetos

    if (!Array.isArray(perguntas) || perguntas.length !== 6) {
        return res.status(400).json({ error: 'É necessário enviar exatamente 6 perguntas' });
    }

    try {
        await db.query('BEGIN');

        // 1. Remover todas as perguntas existentes para esta lição
        await db.query('DELETE FROM perguntas WHERE licao_id = $1', [licaoId]);

        // 2. Inserir as novas perguntas
        for (const p of perguntas) {
            const { enunciado, opcao_a, opcao_b, opcao_c, resposta_correta } = p;
            if (!enunciado || !opcao_a || !opcao_b || !opcao_c || !resposta_correta) {
                throw new Error('Todos os campos da pergunta são obrigatórios');
            }
            await db.query(
                `INSERT INTO perguntas (enunciado, opcao_a, opcao_b, opcao_c, resposta_correta, licao_id)
                 VALUES ($1, $2, $3, $4, $5, $6)`,
                [enunciado, opcao_a, opcao_b, opcao_c, resposta_correta, licaoId]
            );
        }

        await db.query('COMMIT');
        res.json({ message: 'Perguntas salvas com sucesso' });
    } catch (error) {
        await db.query('ROLLBACK');
        console.error('Erro ao salvar perguntas em lote:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// ============================================
// Rotas individuais (opcionais – podem ser removidas se não forem mais usadas)
// ============================================

// Buscar uma pergunta específica (ainda pode ser útil para pré-visualização)
router.get('/:id', async (req, res) => {
    try {
        const result = await db.query(
            'SELECT id, enunciado, opcao_a, opcao_b, opcao_c FROM perguntas WHERE id = $1 AND ativa = true',
            [req.params.id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Pergunta não encontrada' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Erro ao buscar pergunta:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Criar pergunta individual (se quiser manter)
router.post('/', async (req, res) => {
    try {
        const { enunciado, opcao_a, opcao_b, opcao_c, resposta_correta, licao_id } = req.body;
        if (!licao_id) {
            return res.status(400).json({ error: 'É necessário vincular a pergunta a uma lição' });
        }
        const result = await db.query(
            'INSERT INTO perguntas (enunciado, opcao_a, opcao_b, opcao_c, resposta_correta, licao_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
            [enunciado, opcao_a, opcao_b, opcao_c, resposta_correta, licao_id]
        );
        res.status(201).json({ id: result.rows[0].id, message: 'Pergunta criada com sucesso' });
    } catch (error) {
        console.error('Erro ao criar pergunta:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Atualizar pergunta individual
router.put('/:id', async (req, res) => {
    try {
        const { enunciado, opcao_a, opcao_b, opcao_c, resposta_correta } = req.body;
        const result = await db.query(
            'UPDATE perguntas SET enunciado = $1, opcao_a = $2, opcao_b = $3, opcao_c = $4, resposta_correta = $5 WHERE id = $6',
            [enunciado, opcao_a, opcao_b, opcao_c, resposta_correta, req.params.id]
        );
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Pergunta não encontrada' });
        }
        res.json({ message: 'Pergunta atualizada com sucesso' });
    } catch (error) {
        console.error('Erro ao atualizar pergunta:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// "Deletar" pergunta (desativar)
router.delete('/:id', async (req, res) => {
    try {
        const result = await db.query(
            'UPDATE perguntas SET ativa = false WHERE id = $1',
            [req.params.id]
        );
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Pergunta não encontrada' });
        }
        res.json({ message: 'Pergunta removida com sucesso' });
    } catch (error) {
        console.error('Erro ao remover pergunta:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

module.exports = router;