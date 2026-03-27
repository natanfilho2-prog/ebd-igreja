const express = require('express');
const db = require('../db');
const router = express.Router();

// ============================================
// Ranking filtrado por ano e trimestre
// ============================================
router.get('/filtered', async (req, res) => {
    const { ano, trimestre } = req.query;
    if (!ano || !trimestre) {
        return res.status(400).json({ error: 'Parâmetros ano e trimestre são obrigatórios' });
    }

    const year = parseInt(ano);
    const quarter = parseInt(trimestre);
    let startMonth, endMonth;
    if (quarter === 1) { startMonth = 1; endMonth = 3; }
    else if (quarter === 2) { startMonth = 4; endMonth = 6; }
    else if (quarter === 3) { startMonth = 7; endMonth = 9; }
    else if (quarter === 4) { startMonth = 10; endMonth = 12; }
    else { return res.status(400).json({ error: 'Trimestre inválido' }); }

    const startDate = new Date(year, startMonth - 1, 1);
    const endDate = new Date(year, endMonth, 0);
    const start = startDate.toISOString().split('T')[0];
    const end = endDate.toISOString().split('T')[0];

    // Lições do trimestre (todas, sem filtro de data)
    const lessons = await db.query(`
        SELECT id 
        FROM licoes 
        WHERE data_limite BETWEEN $1 AND $2
        ORDER BY data_limite ASC
    `, [start, end]);
    const lessonIds = lessons.rows.map(row => row.id);
    const totalLessons = lessonIds.length;

    if (totalLessons === 0) {
        return res.json({
            total_alunos: 0,
            total_envios: 0,
            total_lessons_available: 0,
            top_alunos: []
        });
    }

    const users = await db.query(`
        SELECT DISTINCT u.id, u.nome
        FROM usuarios u
        JOIN respostas_licao rl ON u.id = rl.usuario_id
        WHERE rl.licao_id = ANY($1::int[])
    `, [lessonIds]);

    const stats = [];

    for (const user of users.rows) {
        const quizzes = await db.query(`
            SELECT COUNT(DISTINCT rl.licao_id) as total
            FROM respostas_licao rl
            WHERE rl.usuario_id = $1 AND rl.licao_id = ANY($2::int[])
        `, [user.id, lessonIds]);
        const totalQuizzes = parseInt(quizzes.rows[0].total);

        const score = await db.query(`
            SELECT 
                COUNT(*) as total_questions,
                SUM(CASE WHEN r.correta THEN 1 ELSE 0 END) as total_correct
            FROM respostas r
            WHERE r.usuario_id = $1 AND r.licao_id = ANY($2::int[])
        `, [user.id, lessonIds]);
        const totalQuestions = parseInt(score.rows[0].total_questions);
        const totalCorrect = parseInt(score.rows[0].total_correct);
        const mediaQuiz = totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0;

        let attended = 0;
        try {
            const pres = await db.query(`
                SELECT COUNT(*) as attended
                FROM presencas p
                WHERE p.nome = $1 AND p.licao_id = ANY($2::int[])
            `, [user.nome, lessonIds]);
            attended = parseInt(pres.rows[0].attended);
        } catch (e) {
            const pres = await db.query(`
                SELECT COUNT(*) as attended
                FROM presenca p
                WHERE p.nome = $1 AND p.licao_id = ANY($2::int[])
            `, [user.nome, lessonIds]);
            attended = parseInt(pres.rows[0].attended);
        }
        const mediaPresenca = (attended / totalLessons) * 100;
        const quizzesPercent = (totalQuizzes / totalLessons) * 100;
        const pontuacao = (mediaQuiz * 0.5) + (mediaPresenca * 0.3) + (quizzesPercent * 0.2);

        stats.push({
            nome: user.nome,
            media_quiz: parseFloat(mediaQuiz.toFixed(2)),
            media_presenca: parseFloat(mediaPresenca.toFixed(2)),
            total_quizzes: totalQuizzes,
            pontuacao_rank: parseFloat(pontuacao.toFixed(2))
        });
    }

    stats.sort((a, b) => b.pontuacao_rank - a.pontuacao_rank);
    const topAlunos = stats.slice(0, 5);

    const envios = await db.query(`
        SELECT COUNT(*) as total
        FROM respostas_licao
        WHERE licao_id = ANY($1::int[])
    `, [lessonIds]);
    const totalEnvios = parseInt(envios.rows[0].total);

    res.json({
        total_alunos: users.rows.length,
        total_envios: totalEnvios,
        total_lessons_available: totalLessons,
        top_alunos: topAlunos
    });
});

// ============================================
// Estatísticas gerais (sem filtro) – mantida para compatibilidade
// ============================================
router.get('/estatisticas', async (req, res) => {
    const resultados = {
        total_alunos: 0,
        total_respostas: 0,
        media_acertos: 0,
        presencas_hoje: 0,
        top_alunos: []
    };
    try {
        const rAlunos = await db.query('SELECT COUNT(*) as total FROM usuarios');
        resultados.total_alunos = parseInt(rAlunos.rows[0].total);
        const rRespostas = await db.query('SELECT COUNT(*) as total FROM respostas');
        resultados.total_respostas = parseInt(rRespostas.rows[0].total);
        const rMedia = await db.query(`
            SELECT ROUND(AVG(CASE WHEN correta = true THEN 1 ELSE 0 END) * 100, 2) as media
            FROM respostas
        `);
        resultados.media_acertos = rMedia.rows[0]?.media || 0;
        const hoje = new Date().toISOString().split('T')[0];
        let rPresencas;
        try {
            rPresencas = await db.query('SELECT COUNT(*) as total FROM presencas WHERE DATE(data_presenca) = $1', [hoje]);
        } catch {
            rPresencas = await db.query('SELECT COUNT(*) as total FROM presenca WHERE DATE(data_presenca) = $1', [hoje]);
        }
        resultados.presencas_hoje = parseInt(rPresencas.rows[0].total);
        const rTop = await db.query(`
            SELECT u.nome, COUNT(r.id) as respostas,
                   ROUND(AVG(CASE WHEN r.correta = true THEN 1 ELSE 0 END) * 100, 2) as percentual
            FROM usuarios u
            JOIN respostas r ON u.id = r.usuario_id
            GROUP BY u.id
            ORDER BY percentual DESC, respostas DESC
            LIMIT 3
        `);
        resultados.top_alunos = rTop.rows;
        res.json(resultados);
    } catch (error) {
        console.error('Erro em /estatisticas:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

module.exports = router;