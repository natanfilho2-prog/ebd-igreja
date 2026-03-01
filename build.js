const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Iniciando build do projeto EBD...\n');

// Cores para o terminal
const colors = {
    green: '\x1b[32m',
    blue: '\x1b[34m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    reset: '\x1b[0m'
};

function runCommand(command, description) {
    console.log(`${colors.blue}▶ ${description}...${colors.reset}`);
    try {
        execSync(command, { stdio: 'inherit' });
        console.log(`${colors.green}✅ ${description} concluído!${colors.reset}\n`);
    } catch (error) {
        console.error(`${colors.red}❌ Erro em: ${description}${colors.reset}`);
        console.error(error);
        process.exit(1);
    }
}

// Build do backend
console.log(`${colors.yellow}📦 Buildando BACKEND...${colors.reset}`);
process.chdir(path.join(__dirname, 'backend'));
runCommand('npm install', 'Instalando dependências do backend');

// Build do frontend
console.log(`${colors.yellow}📦 Buildando FRONTEND...${colors.reset}`);
process.chdir(path.join(__dirname, 'frontend'));
runCommand('npm install', 'Instalando dependências do frontend');
runCommand('npm run build', 'Criando build de produção');

console.log(`${colors.green}🎉 Build concluído com sucesso!${colors.reset}`);
console.log(`
📁 Arquivos gerados:
- Backend: ${path.join(__dirname, 'backend')}
- Frontend: ${path.join(__dirname, 'frontend', 'build')}

🌍 Próximos passos:
1. Crie uma conta no Render (https://render.com)
2. Crie uma conta no Vercel (https://vercel.com)
3. Faça deploy do backend no Render
4. Faça deploy do frontend no Vercel
5. Configure as variáveis de ambiente
`);