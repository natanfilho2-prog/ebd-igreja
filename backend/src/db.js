const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: 5432,
    ssl: {
        rejectUnauthorized: false // Obrigatório para Render [citation:7]
    },
    // AUMENTAR TIMEOUTS (importante para plano gratuito)
    connectionTimeoutMillis: 60000, // 60 segundos (antes era 10s)
    idleTimeoutMillis: 30000,        // 30 segundos
    max: 10,                         // Máximo de conexões simultâneas
    allowExitOnIdle: false
});

// Evento de erro no pool
pool.on('error', (err) => {
    console.error('Erro inesperado no pool do banco:', err);
});

// Testar conexão com timeout maior
pool.connect((err, client, release) => {
    if (err) {
        console.error('❌ Erro ao conectar no banco:', err.message);
        console.error('Detalhes:', err);
    } else {
        console.log('✅ Banco de dados conectado!');
        release();
    }
});

module.exports = pool;