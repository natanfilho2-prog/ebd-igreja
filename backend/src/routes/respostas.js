const express = require('express');
const db = require('../db');
const router = express.Router();

// Registrar respostas de um aluno
router.post('/', async (req, res) => {
    try {
        const { nome_aluno, email_aluno, turma, respostas } = req.body;
        
        // Validações básicas
        if (!nome_aluno || !email_aluno || !respostas || !Array.isArray(respostas) || respostas.length === 0) {
            return res.status(400).json({ error: 'Dados incompletos' });
        }

        // Iniciar transação
        await db.query('START TRANSACTION');

        try {
            // 1. Inserir ou buscar usuário
            let usuarioId;
            const [usuarioExistente] = await db.query(
                'SELECT id FROM usuarios WHERE email = ?',
                [email_aluno]
            );

            if (usuarioExistente.length > 0) {
                usuarioId = usuarioExistente[0].id;
                // Atualizar nome e turma (caso tenha mudado)
                await db.query(
                    'UPDATE usuarios SET nome = ?, turma = ? WHERE id = ?',
                    [nome_aluno, turma || null, usuarioId]
                );
            } else {
                const [novoUsuario] = await db.query(
                    'INSERT INTO usuarios (nome, email, turma) VALUES (?, ?, ?)',
                    [nome_aluno, email_aluno, turma || null]
                );
                usuarioId = novoUsuario.insertId;
            }

            // 2. Buscar todas as perguntas ativas com suas respostas corretas
            const [perguntas] = await db.query(
                'SELECT id, resposta_correta FROM perguntas WHERE ativa = true'
            );

            // 3. Processar cada resposta
            let pontuacao = 0;
            const respostasParaInserir = [];

            for (const resposta of respostas) {
                const pergunta = perguntas.find(p => p.id === resposta.pergunta_id);
                if (!pergunta) continue;

                const correta = pergunta.resposta_correta === resposta.alternativa;
                if (correta) pontuacao++;

                respostasParaInserir.push([
                    usuarioId,
                    resposta.pergunta_id,
                    resposta.alternativa,
                    correta
                ]);
            }

            // 4. Inserir todas as respostas
            if (respostasParaInserir.length > 0) {
                await db.query(
                    'INSERT INTO respostas (usuario_id, pergunta_id, resposta_aluno, correta) VALUES ?',
                    [respostasParaInserir]
                );
            }

            // Commit da transação
            await db.query('COMMIT');

            // 5. Retornar resultado com as respostas corretas
            const perguntasComRespostas = perguntas.map(p => ({
                pergunta_id: p.id,
                resposta_correta: p.resposta_correta
            }));

            res.json({
                pontuacao,
                total_perguntas: perguntas.length,
                aprovado: pontuacao >= perguntas.length * 0.7, // 70% de acerto
                respostas_corretas: perguntasComRespostas
            });

        } catch (error) {
            // Rollback em caso de erro
            await db.query('ROLLBACK');
            throw error;
        }

    } catch (error) {
        console.error('Erro ao registrar respostas:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Buscar respostas de um aluno específico
router.get('/aluno/:email', async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT r.*, p.enunciado, p.opcao_a, p.opcao_b, p.opcao_c 
             FROM respostas r
             JOIN perguntas p ON r.pergunta_id = p.id
             JOIN usuarios u ON r.usuario_id = u.id
             WHERE u.email = ?
             ORDER BY r.data_resposta DESC`,
            [req.params.email]
        );
        res.json(rows);
    } catch (error) {
        console.error('Erro ao buscar respostas do aluno:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

module.exports = router;