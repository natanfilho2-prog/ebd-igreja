const { Pool } = require('pg');
require('dotenv').config();

// Verificar se temos a URL de conexão
if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL não definida no arquivo .env');
    process.exit(1);
}

console.log('📡 Conectando ao banco do Render...');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false // Obrigatório para conexão externa com o Render
    },
    // Timeouts maiores para o plano gratuito
    connectionTimeoutMillis: 30000,
    idleTimeoutMillis: 30000,
    max: 5 // Reduzir conexões simultâneas para não sobrecarregar
});

// Testar conexão
(async () => {
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT 1 + 1 AS solution');
        console.log('✅ Conectado ao banco do Render! Resultado:', result.rows[0].solution);
        console.log('🌍 Ambiente:', process.env.NODE_ENV || 'desenvolvimento');
        client.release();
    } catch (error) {
        console.error('❌ Erro ao conectar ao banco do Render:', error.message);
        console.error('Detalhes:', error);
    }
})();

// Evento de erro no pool
pool.on('error', (err) => {
    console.error('Erro inesperado no pool:', err);
});

module.exports = pool;