// Teste direto da API do frontend
const axios = require('axios');

// Configuração similar ao frontend
const baseURL = 'http://localhost:5000';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

async function testGenerateQuestions() {
  console.log('🧪 Testando geração de questões...');
  console.log('🌐 URL base:', baseURL);
  
  try {
    // Dados de teste similares ao que o frontend envia
    const requestData = {
      subject: 'Enfermagem',
      difficulty: 'medio',
      count: 3,
      bloco: 'Saúde',
      cargo: 'Enfermeiro',
      usuario_id: 'test-user-123'
    };
    
    console.log('📤 Enviando requisição POST para /api/questoes/gerar');
    console.log('📋 Dados da requisição:', JSON.stringify(requestData, null, 2));
    
    const response = await api.post('/api/questoes/gerar', requestData);
    
    console.log('✅ Resposta recebida!');
    console.log('📊 Status:', response.status);
    console.log('📋 Headers:', response.headers);
    console.log('📄 Dados:', JSON.stringify(response.data, null, 2));
    
    if (response.data && response.data.length > 0) {
      console.log('🎯 Sucesso! Questões geradas:', response.data.length);
    } else {
      console.log('⚠️ Resposta vazia ou sem questões');
    }
    
  } catch (error) {
    console.error('❌ Erro na requisição:');
    console.error('🔍 Tipo do erro:', error.constructor.name);
    console.error('📝 Mensagem:', error.message);
    
    if (error.response) {
      console.error('📊 Status da resposta:', error.response.status);
      console.error('📋 Headers da resposta:', error.response.headers);
      console.error('📄 Dados da resposta:', error.response.data);
    } else if (error.request) {
      console.error('📡 Requisição enviada mas sem resposta:');
      console.error('🔍 Request:', error.request);
    } else {
      console.error('⚙️ Erro na configuração:', error.message);
    }
    
    console.error('🔧 Config da requisição:', error.config);
  }
}

async function testHealthCheck() {
  console.log('\n🏥 Testando health check...');
  
  try {
    const response = await api.get('/health');
    console.log('✅ Health check OK:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Health check falhou:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Iniciando testes da API frontend-backend...');
  console.log('=' .repeat(50));
  
  // Primeiro testar se o backend está rodando
  const healthOk = await testHealthCheck();
  
  if (!healthOk) {
    console.log('\n❌ Backend não está respondendo. Verifique se está rodando em localhost:5000');
    return;
  }
  
  console.log('\n' + '=' .repeat(50));
  
  // Testar geração de questões
  await testGenerateQuestions();
  
  console.log('\n' + '=' .repeat(50));
  console.log('🏁 Testes concluídos!');
}

// Executar os testes
runTests().catch(console.error);