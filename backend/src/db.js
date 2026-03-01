// db.js - Configuração da conexão com MySQL
const mysql = require('mysql2');
require('dotenv').config();

// Criar pool de conexões (mais eficiente que uma conexão única)
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Converter para Promise (para usar async/await)
const promisePool = pool.promise();

// Testar conexão
(async () => {
    try {
        const [rows] = await promisePool.query('SELECT 1 + 1 AS solution');
        console.log('✅ Banco de dados conectado! Resultado do teste:', rows[0].solution);
    } catch (error) {
        console.error('❌ Erro ao conectar no banco:', error.message);
    }
})();

module.exports = promisePool;