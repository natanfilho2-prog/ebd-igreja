const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
require('dotenv').config();

// Import rotas
const licoesRoutes = require('./routes/licoes');
const perguntasRoutes = require('./routes/perguntas');
const respostasRoutes = require('./routes/respostas');
const presencaRoutes = require('./routes/presenca');
const rankingsRoutes = require('./routes/rankings');
const quizRoutes = require('./routes/quiz');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// Middlewares (CORS must come first)
// ============================================
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(compression());

// CORS configuration
const allowedOrigins = process.env.NODE_ENV === 'production'
    ? [process.env.FRONTEND_URL]  // e.g., https://meusite.vercel.app
    : ['http://localhost:3001'];    // development

app.use(cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// ============================================
// Rotas
// ============================================
app.use('/quiz', quizRoutes);
app.use('/auth', authRoutes);
app.use('/licoes', licoesRoutes);
app.use('/perguntas', perguntasRoutes);
app.use('/respostas', respostasRoutes);
app.use('/presenca', presencaRoutes);
app.use('/rankings', rankingsRoutes);

// ============================================
// Test routes & health check
// ============================================
app.get('/db-test', async (req, res) => {
    try {
        const db = require('./db');
        const result = await db.query('SELECT 1 + 1 AS solution');
        res.json({ 
            success: true, 
            message: 'Banco conectado!', 
            result: result.rows[0].solution,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/ping', (req, res) => {
    res.json({ message: 'pong', timestamp: new Date().toISOString(), status: 'API EBD funcionando!' });
});

app.get('/', (req, res) => {
    res.json({
        nome: 'API da Escola Bíblica Dominical',
        versao: '1.0.0',
        ambiente: process.env.NODE_ENV || 'desenvolvimento',
        rotas: { ping: '/ping', dbTest: '/db-test', perguntas: '/perguntas', respostas: '/respostas', presenca: '/presenca', rankings: '/rankings' }
    });
});

app.get('/health', (req, res) => res.status(200).json({ status: 'OK' }));

app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'desenvolvimento'}`);
    console.log(`📝 Testes: /ping, /db-test`);
});