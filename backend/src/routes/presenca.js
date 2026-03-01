const express = require('express');
const db = require('../db');
const router = express.Router();

// Registrar presença
router.post('/', async (req, res) => {
    try {
        const { nome_aluno, email_aluno, turma, data_aula } = req.body;

        if (!nome_aluno || !email_aluno) {
            return res.status(400).json({ error: 'Nome e email são obrigatórios' });
        }

        // Data da aula (se não fornecida, usa a data atual)
        const data = data_aula || new Date().toISOString().split('T')[0];

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
                // Atualizar nome e turma
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

            // 2. Registrar presença (ignora se já existir)
            await db.query(
                'INSERT IGNORE INTO presenca (usuario_id, data_aula) VALUES (?, ?)',
                [usuarioId, data]
            );

            await db.query('COMMIT');

            res.json({ 
                message: 'Presença registrada com sucesso',
                data: data
            });

        } catch (error) {
            await db.query('ROLLBACK');
            throw error;
        }

    } catch (error) {
        console.error('Erro ao registrar presença:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Verificar se aluno já tem presença em determinada data
router.get('/verificar/:email/:data?', async (req, res) => {
    try {
        const data = req.params.data || new Date().toISOString().split('T')[0];
        
        const [rows] = await db.query(
            `SELECT p.* FROM presenca p
             JOIN usuarios u ON p.usuario_id = u.id
             WHERE u.email = ? AND p.data_aula = ?`,
            [req.params.email, data]
        );

        res.json({
            presente: rows.length > 0,
            data: data
        });
    } catch (error) {
        console.error('Erro ao verificar presença:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Listar presenças de uma data específica
router.get('/data/:data?', async (req, res) => {
    try {
        const data = req.params.data || new Date().toISOString().split('T')[0];
        
        const [rows] = await db.query(
            `SELECT u.id, u.nome, u.email, u.turma, p.data_aula
             FROM presenca p
             JOIN usuarios u ON p.usuario_id = u.id
             WHERE p.data_aula = ?
             ORDER BY u.nome`,
            [data]
        );

        res.json({
            data: data,
            total: rows.length,
            presentes: rows
        });
    } catch (error) {
        console.error('Erro ao listar presenças:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

module.exports = router;