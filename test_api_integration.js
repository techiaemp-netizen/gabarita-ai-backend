// Teste de Integração Frontend-Backend
// Execute este script no console do navegador em http://localhost:3000

console.log('=== TESTE DE INTEGRAÇÃO API - GABARITA AI ===');
console.log('Testando comunicação Frontend -> Backend');

// Função para testar endpoints
async function testEndpoint(url, method = 'GET', body = null) {
    try {
        const options = {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            }
        };
        
        if (body) {
            options.body = JSON.stringify(body);
        }
        
        const response = await fetch(url, options);
        const data = await response.json();
        
        console.log(`✅ ${method} ${url}:`, {
            status: response.status,
            ok: response.ok,
            data: data
        });
        
        return { success: true, status: response.status, data };
    } catch (error) {
        console.error(`❌ ${method} ${url}:`, error.message);
        return { success: false, error: error.message };
    }
}

// Lista de testes
const tests = [
    { url: 'http://127.0.0.1:5000/health', method: 'GET', description: 'Health Check' },
    { url: 'http://127.0.0.1:5000/api/planos', method: 'GET', description: 'Listar Planos' },
    { url: 'http://127.0.0.1:5000/api/auth/login', method: 'POST', body: {}, description: 'Login (sem dados)' },
    { url: 'http://127.0.0.1:5000/api/questoes/gerar', method: 'POST', body: { materia: 'matematica', nivel: 'medio', quantidade: 1 }, description: 'Gerar Questões' }
];

// Executar todos os testes
async function runAllTests() {
    console.log('\n🚀 Iniciando testes de integração...');
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const test of tests) {
        console.log(`\n📋 Testando: ${test.description}`);
        const result = await testEndpoint(test.url, test.method, test.body);
        
        if (result.success) {
            successCount++;
        } else {
            errorCount++;
        }
        
        // Aguardar um pouco entre os testes
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log('\n📊 RESUMO DOS TESTES:');
    console.log(`✅ Sucessos: ${successCount}`);
    console.log(`❌ Erros: ${errorCount}`);
    console.log(`📈 Total: ${successCount + errorCount}`);
    
    if (errorCount === 0) {
        console.log('🎉 TODOS OS TESTES PASSARAM!');
    } else {
        console.log('⚠️ ALGUNS TESTES FALHARAM - Verifique os logs acima');
    }
    
    // Testar CORS
    console.log('\n🌐 Testando CORS...');
    try {
        const corsTest = await fetch('http://127.0.0.1:5000/health', {
            method: 'GET',
            mode: 'cors'
        });
        console.log('✅ CORS: Funcionando corretamente');
    } catch (error) {
        console.error('❌ CORS: Erro -', error.message);
    }
}

// Executar os testes
runAllTests();

// Instruções para o usuário
console.log('\n📝 INSTRUÇÕES:');
console.log('1. Abra http://localhost:3000 no navegador');
console.log('2. Abra o Console do Desenvolvedor (F12)');
console.log('3. Cole e execute este código');
console.log('4. Analise os resultados dos testes');

// Função adicional para testar autenticação
window.testAuth = async function(email, password) {
    console.log('\n🔐 Testando autenticação...');
    return await testEndpoint('http://127.0.0.1:5000/api/auth/login', 'POST', {
        email: email,
        password: password
    });
};

console.log('\n💡 Para testar login: testAuth("seu@email.com", "suasenha")');