const express = require('express');
const db = require('../db');
const router = express.Router();

// Ranking de participação (quem mais respondeu perguntas)
router.get('/participacao', async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT 
                u.id,
                u.nome,
                u.email,
                u.turma,
                COUNT(DISTINCT r.id) as total_respostas,
                COUNT(DISTINCT DATE(r.data_resposta)) as dias_participacao,
                SUM(CASE WHEN r.correta = true THEN 1 ELSE 0 END) as acertos,
                ROUND(AVG(CASE WHEN r.correta = true THEN 1 ELSE 0 END) * 100, 2) as percentual_acerto
             FROM usuarios u
             LEFT JOIN respostas r ON u.id = r.usuario_id
             GROUP BY u.id, u.nome, u.email, u.turma
             HAVING total_respostas > 0
             ORDER BY total_respostas DESC, percentual_acerto DESC
             LIMIT 50`
        );
        res.json(rows);
    } catch (error) {
        console.error('Erro ao buscar ranking de participação:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Ranking de presença
router.get('/presenca', async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT 
                u.id,
                u.nome,
                u.email,
                u.turma,
                COUNT(p.id) as total_presencas,
                MIN(p.data_aula) as primeira_presenca,
                MAX(p.data_aula) as ultima_presenca
             FROM usuarios u
             LEFT JOIN presenca p ON u.id = p.usuario_id
             GROUP BY u.id, u.nome, u.email, u.turma
             HAVING total_presencas > 0
             ORDER BY total_presencas DESC, u.nome ASC
             LIMIT 50`
        );
        res.json(rows);
    } catch (error) {
        console.error('Erro ao buscar ranking de presença:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Ranking por turma
router.get('/turma/:turma', async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT 
                u.id,
                u.nome,
                u.email,
                COUNT(DISTINCT r.id) as total_respostas,
                SUM(CASE WHEN r.correta = true THEN 1 ELSE 0 END) as acertos,
                ROUND(AVG(CASE WHEN r.correta = true THEN 1 ELSE 0 END) * 100, 2) as percentual_acerto,
                COUNT(DISTINCT p.id) as presencas
             FROM usuarios u
             LEFT JOIN respostas r ON u.id = r.usuario_id
             LEFT JOIN presenca p ON u.id = p.usuario_id
             WHERE u.turma = ?
             GROUP BY u.id, u.nome, u.email
             ORDER BY percentual_acerto DESC, total_respostas DESC
             LIMIT 50`,
            [req.params.turma]
        );
        res.json(rows);
    } catch (error) {
        console.error('Erro ao buscar ranking da turma:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Estatísticas gerais
router.get('/estatisticas', async (req, res) => {
    try {
        // Total de alunos
        const [totalAlunos] = await db.query('SELECT COUNT(*) as total FROM usuarios');
        
        // Total de perguntas respondidas
        const [totalRespostas] = await db.query('SELECT COUNT(*) as total FROM respostas');
        
        // Média de acertos
        const [mediaAcertos] = await db.query(
            `SELECT ROUND(AVG(correta) * 100, 2) as media_percentual 
             FROM respostas`
        );
        
        // Presenças hoje
        const hoje = new Date().toISOString().split('T')[0];
        const [presencasHoje] = await db.query(
            'SELECT COUNT(*) as total FROM presenca WHERE data_aula = ?',
            [hoje]
        );
        
        // Top 3 alunos
        const [topAlunos] = await db.query(
            `SELECT 
                u.nome,
                COUNT(r.id) as respostas,
                ROUND(AVG(r.correta) * 100, 2) as percentual
             FROM usuarios u
             JOIN respostas r ON u.id = r.usuario_id
             GROUP BY u.id, u.nome
             ORDER BY percentual DESC, respostas DESC
             LIMIT 3`
        );

        res.json({
            total_alunos: totalAlunos[0].total,
            total_respostas: totalRespostas[0].total,
            media_acertos: mediaAcertos[0]?.media_percentual || 0,
            presencas_hoje: presencasHoje[0].total,
            top_alunos: topAlunos
        });
    } catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

module.exports = router;