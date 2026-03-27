const express = require('express');
const db = require('../db');
const router = express.Router();

// Função auxiliar para extrair ano e trimestre de uma data
function getYearAndTrimester(dateStr) {
    const date = new Date(dateStr + 'T12:00:00Z'); // força meio-dia UTC
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth() + 1;
    const trimester = Math.ceil(month / 3);
    return { ano: year, trimestre: trimester };
}

// Listar lições (com opção de filtro por ano/trimestre)
router.get('/', async (req, res) => {
    try {
        const { ano, trimestre } = req.query;
        let whereClause = '';
        let params = [];

        if (ano && trimestre) {
            const year = parseInt(ano);
            const quarter = parseInt(trimestre);
            let startMonth, endMonth;
            if (quarter === 1) { startMonth = 1; endMonth = 3; }
            else if (quarter === 2) { startMonth = 4; endMonth = 6; }
            else if (quarter === 3) { startMonth = 7; endMonth = 9; }
            else if (quarter === 4) { startMonth = 10; endMonth = 12; }
            if (startMonth) {
                const startDate = new Date(year, startMonth - 1, 1);
                const endDate = new Date(year, endMonth, 0);
                const start = startDate.toISOString().split('T')[0];
                const end = endDate.toISOString().split('T')[0];
                whereClause = `WHERE l.data_limite BETWEEN $1 AND $2`;
                params = [start, end];
            }
        }

        let sql = `
            SELECT l.*, 
                   COUNT(p.id) as total_perguntas,
                   CASE 
                       WHEN l.data_limite < CURRENT_DATE THEN 'expirada'
                       ELSE 'ativa'
                   END as status
            FROM licoes l
            LEFT JOIN perguntas p ON l.id = p.licao_id AND p.ativa = true
        `;
        if (whereClause) sql += whereClause;
        sql += ` GROUP BY l.id ORDER BY l.numero_licao ASC`;

        const result = await db.query(sql, params);
        res.json(result.rows);
    } catch (error) {
        console.error('Erro ao buscar lições:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Buscar uma lição específica
router.get('/:id', async (req, res) => {
    try {
        const result = await db.query(
            'SELECT * FROM licoes WHERE id = $1',
            [req.params.id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Liçao não encontrada' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Erro ao buscar lição:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Criar nova lição
router.post('/', async (req, res) => {
    try {
        console.log('📥 Dados recebidos:', req.body);
        const { titulo, numero_licao, data_limite, descricao, palavra_chave } = req.body;
        if (!titulo || !numero_licao || !data_limite) {
            return res.status(400).json({ error: 'Título, número e data limite são obrigatórios' });
        }

        const { ano, trimestre } = getYearAndTrimester(data_limite);

        const result = await db.query(
            `INSERT INTO licoes (titulo, numero_licao, data_limite, descricao, palavra_chave, ano, trimestre)
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
            [titulo, numero_licao, data_limite, descricao, palavra_chave || null, ano, trimestre]
        );

        res.status(201).json({ id: result.rows[0].id, message: 'Liçao criada com sucesso' });
    } catch (error) {
        console.error('Erro ao criar lição:', error);
        if (error.code === '23505') { // unique violation
            return res.status(400).json({ error: 'Já existe uma lição com este número neste trimestre' });
        }
        res.status(500).json({ error: 'Erro interno do servidor: ' + error.message });
    }
});

// Atualizar lição
router.put('/:id', async (req, res) => {
    try {
        const { titulo, numero_licao, data_limite, descricao, palavra_chave } = req.body;
        const { ano, trimestre } = getYearAndTrimester(data_limite);

        const result = await db.query(
            `UPDATE licoes 
             SET titulo = $1, numero_licao = $2, data_limite = $3, descricao = $4, palavra_chave = $5, ano = $6, trimestre = $7
             WHERE id = $8`,
            [titulo, numero_licao, data_limite, descricao, palavra_chave || null, ano, trimestre, req.params.id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Liçao não encontrada' });
        }
        res.json({ message: 'Liçao atualizada com sucesso' });
    } catch (error) {
        console.error('Erro ao atualizar lição:', error);
        if (error.code === '23505') {
            return res.status(400).json({ error: 'Já existe uma lição com este número neste trimestre' });
        }
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Deletar lição
router.delete('/:id', async (req, res) => {
    try {
        const perguntas = await db.query(
            'SELECT COUNT(*) as total FROM perguntas WHERE licao_id = $1',
            [req.params.id]
        );
        if (parseInt(perguntas.rows[0].total) > 0) {
            return res.status(400).json({ error: 'Não é possível excluir esta lição pois existem perguntas vinculadas a ela' });
        }

        const result = await db.query('DELETE FROM licoes WHERE id = $1', [req.params.id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Liçao não encontrada' });
        }
        res.json({ message: 'Liçao removida com sucesso' });
    } catch (error) {
        console.error('Erro ao remover lição:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Buscar lição atual (a mais recente não expirada) – mantida
router.get('/atual/disponivel', async (req, res) => {
    try {
        const result = await db.query(`
            SELECT l.*, COUNT(p.id) as total_perguntas
            FROM licoes l
            LEFT JOIN perguntas p ON l.id = p.licao_id AND p.ativa = true
            WHERE l.data_limite >= CURRENT_DATE AND l.ativa = true
            GROUP BY l.id
            ORDER BY l.numero_licao ASC
            LIMIT 1
        `);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Nenhuma lição disponível no momento' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Erro ao buscar lição atual:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Buscar perguntas de uma lição para o quiz
router.get('/:id/quiz', async (req, res) => {
    try {
        const licao = await db.query(
            'SELECT * FROM licoes WHERE id = $1 AND data_limite >= CURRENT_DATE AND ativa = true',
            [req.params.id]
        );
        if (licao.rows.length === 0) {
            return res.status(403).json({ error: 'Esta lição não está mais disponível para respostas' });
        }

        const perguntas = await db.query(
            'SELECT id, enunciado, opcao_a, opcao_b, opcao_c FROM perguntas WHERE licao_id = $1 AND ativa = true ORDER BY id ASC',
            [req.params.id]
        );
        res.json({ licao: licao.rows[0], perguntas: perguntas.rows });
    } catch (error) {
        console.error('Erro ao buscar quiz:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

module.exports = router;