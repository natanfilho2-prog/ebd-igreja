const express = require('express');
const db = require('../db');
const router = express.Router();

// Ranking de participação (quem mais respondeu perguntas)
router.get('/participacao', async (req, res) => {
    try {
        const result = await db.query(
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
             HAVING COUNT(DISTINCT r.id) > 0
             ORDER BY total_respostas DESC, percentual_acerto DESC
             LIMIT 50`
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Erro ao buscar ranking de participação:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Ranking de presença
router.get('/presenca', async (req, res) => {
    try {
        const result = await db.query(
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
             HAVING COUNT(p.id) > 0
             ORDER BY total_presencas DESC, u.nome ASC
             LIMIT 50`
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Erro ao buscar ranking de presença:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Ranking por turma
router.get('/turma/:turma', async (req, res) => {
    try {
        const result = await db.query(
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
             WHERE u.turma = $1
             GROUP BY u.id, u.nome, u.email
             ORDER BY percentual_acerto DESC, total_respostas DESC
             LIMIT 50`,
            [req.params.turma]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Erro ao buscar ranking da turma:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Estatísticas gerais
router.get('/estatisticas', async (req, res) => {
    try {
        // Total de alunos
        const totalAlunosResult = await db.query('SELECT COUNT(*) as total FROM usuarios');
        const totalAlunos = parseInt(totalAlunosResult.rows[0].total);
        
        // Total de perguntas respondidas
        const totalRespostasResult = await db.query('SELECT COUNT(*) as total FROM respostas');
        const totalRespostas = parseInt(totalRespostasResult.rows[0].total);
        
        // Média de acertos
        const mediaAcertosResult = await db.query(
            `SELECT ROUND(AVG(CASE WHEN correta = true THEN 1 ELSE 0 END) * 100, 2) as media_percentual 
             FROM respostas`
        );
        const mediaAcertos = mediaAcertosResult.rows[0]?.media_percentual 
            ? parseFloat(mediaAcertosResult.rows[0].media_percentual) 
            : 0;
        
        // Presenças hoje
        const hoje = new Date().toISOString().split('T')[0];
        const presencasHojeResult = await db.query(
            'SELECT COUNT(*) as total FROM presenca WHERE data_aula = $1',
            [hoje]
        );
        const presencasHoje = parseInt(presencasHojeResult.rows[0].total);
        
        // Top 3 alunos
        const topAlunosResult = await db.query(
            `SELECT 
                u.nome,
                COUNT(r.id) as respostas,
                ROUND(AVG(CASE WHEN r.correta = true THEN 1 ELSE 0 END) * 100, 2) as percentual
             FROM usuarios u
             JOIN respostas r ON u.id = r.usuario_id
             GROUP BY u.id, u.nome
             ORDER BY percentual DESC, respostas DESC
             LIMIT 3`
        );

        res.json({
            total_alunos: totalAlunos,
            total_respostas: totalRespostas,
            media_acertos: mediaAcertos,
            presencas_hoje: presencasHoje,
            top_alunos: topAlunosResult.rows
        });
    } catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

module.exports = router;