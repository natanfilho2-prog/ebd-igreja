const express = require('express');
const db = require('../db');
const router = express.Router();

// ============================================
// GET /quiz/:licaoId - Exibe o quiz ou resultado se já respondido
// ============================================
router.get('/:licaoId', async (req, res) => {
    const { licaoId } = req.params;
    const { telefone } = req.query; // opcional, para já exibir resultado

    try {
        // 1. Verificar se a lição existe e está disponível
        const licao = await db.query(
            `SELECT id, titulo, numero_licao, data_limite, descricao 
             FROM licoes 
             WHERE id = $1 AND data_limite >= CURRENT_DATE AND ativa = true`,
            [licaoId]
        );
        if (licao.rows.length === 0) {
            return res.status(404).json({ error: 'Lição não encontrada ou expirada' });
        }

        // 2. Buscar perguntas da lição
        const perguntas = await db.query(
            `SELECT id, enunciado, opcao_a, opcao_b, opcao_c 
             FROM perguntas 
             WHERE licao_id = $1 AND ativa = true 
             ORDER BY id`,
            [licaoId]
        );

        // 3. Se telefone foi passado, verificar se já respondeu
        let resultado = null;
        if (telefone) {
            const usuario = await db.query(
                'SELECT id FROM usuarios WHERE telefone = $1',
                [telefone]
            );
            if (usuario.rows.length > 0) {
                // Verificar se já respondeu esta lição
                const respondeu = await db.query(
                    'SELECT 1 FROM respostas_licao WHERE usuario_id = $1 AND licao_id = $2',
                    [usuario.rows[0].id, licaoId]
                );
                if (respondeu.rows.length > 0) {
                    // Buscar respostas detalhadas
                    const respostas = await db.query(
                        `SELECT p.id as pergunta_id, p.enunciado, p.opcao_a, p.opcao_b, p.opcao_c, 
                                r.resposta_aluno, r.correta, p.resposta_correta
                         FROM respostas r
                         JOIN perguntas p ON r.pergunta_id = p.id
                         WHERE r.usuario_id = $1 AND r.licao_id = $2
                         ORDER BY p.id`,
                        [usuario.rows[0].id, licaoId]
                    );
                    const total = respostas.rows.length;
                    const acertos = respostas.rows.filter(r => r.correta).length;
                    const percentual = total ? (acertos / total * 100).toFixed(0) : 0;
                    resultado = {
                        usuario: { nome: usuario.rows[0].nome, telefone },
                        licao: licao.rows[0],
                        pontuacao: acertos,
                        total_perguntas: total,
                        percentual,
                        respostas: respostas.rows
                    };
                }
            }
        }

        res.json({
            licao: licao.rows[0],
            perguntas: perguntas.rows,
            jaRespondeu: resultado !== null,
            resultado: resultado
        });
    } catch (error) {
        console.error('Erro ao carregar quiz:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// ============================================
// POST /quiz/:licaoId - Submeter respostas
// ============================================
router.post('/:licaoId', async (req, res) => {
    const { licaoId } = req.params;
    const { nome, telefone, respostas } = req.body;

    // Validações básicas
    if (!nome || !telefone || !respostas || !Array.isArray(respostas) || respostas.length === 0) {
        return res.status(400).json({ error: 'Nome, telefone e respostas são obrigatórios' });
    }

    // Validar formato do telefone (simples)
    const telefoneRegex = /^\d{10,11}$/;
    if (!telefoneRegex.test(telefone.replace(/\D/g, ''))) {
        return res.status(400).json({ error: 'Telefone inválido. Use apenas números (DDD + número)' });
    }

    try {
        // 1. Iniciar transação
        await db.query('BEGIN');

        // 2. Verificar se o usuário já existe, senão criar
        let usuario = await db.query(
            'SELECT id FROM usuarios WHERE telefone = $1',
            [telefone]
        );
        let usuarioId;
        if (usuario.rows.length === 0) {
            const novo = await db.query(
                'INSERT INTO usuarios (nome, telefone) VALUES ($1, $2) RETURNING id',
                [nome, telefone]
            );
            usuarioId = novo.rows[0].id;
        } else {
            usuarioId = usuario.rows[0].id;
            // Atualizar nome se for diferente
            await db.query(
                'UPDATE usuarios SET nome = $1 WHERE id = $2',
                [nome, usuarioId]
            );
        }

        // 3. Verificar se já respondeu esta lição
        const jaRespondeu = await db.query(
            'SELECT 1 FROM respostas_licao WHERE usuario_id = $1 AND licao_id = $2',
            [usuarioId, licaoId]
        );
        if (jaRespondeu.rows.length > 0) {
            await db.query('ROLLBACK');
            return res.status(409).json({ error: 'Você já respondeu este quiz. Veja seu resultado.' });
        }

        // 4. Buscar todas as perguntas da lição
        const perguntasDb = await db.query(
            'SELECT id, resposta_correta FROM perguntas WHERE licao_id = $1 AND ativa = true',
            [licaoId]
        );
        if (perguntasDb.rows.length === 0) {
            await db.query('ROLLBACK');
            return res.status(404).json({ error: 'Nenhuma pergunta encontrada para esta lição' });
        }

        // 5. Processar respostas
        const mapaPerguntas = new Map(perguntasDb.rows.map(p => [p.id, p.resposta_correta]));
        const respostasParaInserir = [];
        let pontuacao = 0;

        for (const resp of respostas) {
            const perguntaId = resp.pergunta_id;
            const respostaAluno = resp.alternativa;
            const correta = mapaPerguntas.get(perguntaId) === respostaAluno;
            if (correta) pontuacao++;
            respostasParaInserir.push({
                usuario_id: usuarioId,
                pergunta_id: perguntaId,
                resposta_aluno: respostaAluno,
                correta,
                licao_id: licaoId
            });
        }

        // 6. Inserir respostas
        for (const r of respostasParaInserir) {
            await db.query(
                `INSERT INTO respostas (usuario_id, pergunta_id, resposta_aluno, correta, licao_id) 
                 VALUES ($1, $2, $3, $4, $5)`,
                [r.usuario_id, r.pergunta_id, r.resposta_aluno, r.correta, r.licao_id]
            );
        }

        // 7. Registrar que respondeu a lição
        await db.query(
            'INSERT INTO respostas_licao (usuario_id, licao_id) VALUES ($1, $2)',
            [usuarioId, licaoId]
        );

        await db.query('COMMIT');

        // 8. Montar resultado detalhado
        const detalhes = [];
        for (const r of respostasParaInserir) {
            const pergunta = await db.query(
                'SELECT enunciado, opcao_a, opcao_b, opcao_c FROM perguntas WHERE id = $1',
                [r.pergunta_id]
            );
            detalhes.push({
                pergunta_id: r.pergunta_id,
                enunciado: pergunta.rows[0].enunciado,
                opcoes: {
                    A: pergunta.rows[0].opcao_a,
                    B: pergunta.rows[0].opcao_b,
                    C: pergunta.rows[0].opcao_c
                },
                resposta_aluno: r.resposta_aluno,
                correta: r.correta,
                resposta_correta: mapaPerguntas.get(r.pergunta_id)
            });
        }

        res.status(201).json({
            usuario: { nome, telefone },
            pontuacao,
            total_perguntas: perguntasDb.rows.length,
            percentual: (pontuacao / perguntasDb.rows.length * 100).toFixed(0),
            aprovado: pontuacao >= perguntasDb.rows.length * 0.7,
            detalhes
        });
    } catch (error) {
        await db.query('ROLLBACK');
        console.error('Erro ao submeter quiz:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// ============================================
// GET /quiz/:licaoId/resultado - Consultar resultado já respondido
// ============================================
router.get('/:licaoId/resultado', async (req, res) => {
    const { licaoId } = req.params;
    const { telefone } = req.query;

    if (!telefone) {
        return res.status(400).json({ error: 'Telefone é obrigatório' });
    }

    try {
        const usuario = await db.query(
            'SELECT id, nome FROM usuarios WHERE telefone = $1',
            [telefone]
        );
        if (usuario.rows.length === 0) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        // Verificar se respondeu a lição
        const respondeu = await db.query(
            'SELECT 1 FROM respostas_licao WHERE usuario_id = $1 AND licao_id = $2',
            [usuario.rows[0].id, licaoId]
        );
        if (respondeu.rows.length === 0) {
            return res.status(404).json({ error: 'Você ainda não respondeu este quiz' });
        }

        // Buscar respostas detalhadas
        const respostas = await db.query(
            `SELECT p.id as pergunta_id, p.enunciado, p.opcao_a, p.opcao_b, p.opcao_c, 
                    r.resposta_aluno, r.correta, p.resposta_correta
             FROM respostas r
             JOIN perguntas p ON r.pergunta_id = p.id
             WHERE r.usuario_id = $1 AND r.licao_id = $2
             ORDER BY p.id`,
            [usuario.rows[0].id, licaoId]
        );

        const total = respostas.rows.length;
        const acertos = respostas.rows.filter(r => r.correta).length;

        res.json({
            usuario: { nome: usuario.rows[0].nome, telefone },
            pontuacao: acertos,
            total_perguntas: total,
            percentual: total ? (acertos / total * 100).toFixed(0) : 0,
            respostas: respostas.rows
        });
    } catch (error) {
        console.error('Erro ao buscar resultado:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

module.exports = router;