const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
require('dotenv').config();

// Importar rotas
const perguntasRoutes = require('./routes/perguntas');
const respostasRoutes = require('./routes/respostas');
const presencaRoutes = require('./routes/presenca');
const rankingsRoutes = require('./routes/rankings');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(compression());
app.use(cors({ origin: process.env.FRONTEND_URL || '*', credentials: true }));
app.use(express.json());

// ✅ ROTA DE DIAGNÓSTICO (nova)
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
        console.error('❌ Erro no /db-test:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erro no banco', 
            error: error.message,
            stack: error.stack
        });
    }
});

// Rotas da aplicação
app.use('/perguntas', perguntasRoutes);
app.use('/respostas', respostasRoutes);
app.use('/presenca', presencaRoutes);
app.use('/rankings', rankingsRoutes);

// Rota de teste simples
app.get('/ping', (req, res) => {
    res.json({ 
        message: 'pong', 
        timestamp: new Date().toISOString(),
        status: 'API EBD funcionando!'
    });
});

// Rota raiz
app.get('/', (req, res) => {
    res.json({
        nome: 'API da Escola Bíblica Dominical',
        versao: '1.0.0',
        ambiente: process.env.NODE_ENV || 'desenvolvimento',
        rotas: {
            ping: '/ping',
            dbTest: '/db-test',
            perguntas: '/perguntas',
            respostas: '/respostas',
            presenca: '/presenca',
            rankings: '/rankings'
        }
    });
});

// Health check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK' });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log('=================================');
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'desenvolvimento'}`);
    console.log(`📝 Testes:`);
    console.log(`   - Ping: /ping`);
    console.log(`   - DB Test: /db-test`);
    console.log('=================================');
});