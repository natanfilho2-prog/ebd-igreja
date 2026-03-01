// Forçar flush do buffer
console.log = function(msg) {
    process.stdout.write(msg + '\n');
};

console.log("TESTE COM FLUSH FORÇADO");
process.stdout.write("SAÍDA DIRETA\n");