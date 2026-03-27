const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const router = express.Router();

// Chave secreta para JWT (idealmente viria de variável de ambiente)
const JWT_SECRET = process.env.JWT_SECRET || 'chave_secreta_temporaria_mude_na_producao';

// Rota de login
router.post('/login', async (req, res) => {
    try {
        const { email, senha } = req.body;

        if (!email || !senha) {
            return res.status(400).json({ error: 'Email e senha são obrigatórios' });
        }

        // Buscar professor pelo email
        const result = await db.query(
            'SELECT id, nome, email, senha_hash FROM professores WHERE email = $1',
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Email ou senha inválidos' });
        }

        const professor = result.rows[0];

        // Comparar senha fornecida com hash armazenado
        const senhaValida = await bcrypt.compare(senha, professor.senha_hash);
        if (!senhaValida) {
            return res.status(401).json({ error: 'Email ou senha inválidos' });
        }

        // Gerar token JWT
        const token = jwt.sign(
            { id: professor.id, email: professor.email },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            token,
            user: {
                id: professor.id,
                nome: professor.nome,
                email: professor.email
            }
        });
    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Rota para verificar token (opcional)
router.get('/verify', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Token não fornecido' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        // Buscar dados atualizados do usuário
        const result = await db.query(
            'SELECT id, nome, email FROM professores WHERE id = $1',
            [decoded.id]
        );
        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Usuário não encontrado' });
        }
        res.json({ user: result.rows[0] });
    } catch (error) {
        console.error('Erro ao verificar token:', error);
        res.status(401).json({ error: 'Token inválido' });
    }
});

module.exports = router;