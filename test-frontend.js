const testFrontendBehavior = async () => {
  console.log(" Iniciando teste E2E do frontend...");
  
  try {
    // Simular a chamada que o frontend faz
    const response = await fetch("http://localhost:3000/api/opcoes/blocos-cargos", {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    });
    
    console.log(" Status da resposta:", response.status);
    console.log(" Headers da resposta:", Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(" Dados recebidos:", data);
    
    // Simular o processamento que o frontend faz
    if (data && data.dados) {
      console.log(" Estrutura de dados válida encontrada");
      console.log(" Todos os cargos:", data.dados.todos_cargos);
      console.log(" Quantidade de cargos:", data.dados.todos_cargos?.length || 0);
      console.log(" Todos os blocos:", data.dados.todos_blocos);
      console.log(" Quantidade de blocos:", data.dados.todos_blocos?.length || 0);
      
      return { success: true, data: data.dados };
    } else {
      console.error(" Estrutura de dados inválida:", data);
      return { success: false, error: "Dados não encontrados na resposta" };
    }
  } catch (error) {
    console.error(" Erro durante o teste:", error);
    return { success: false, error: error.message };
  }
};

// Executar o teste
testFrontendBehavior().then(result => {
  console.log(" Resultado final do teste:", result);
}).catch(error => {
  console.error(" Erro fatal:", error);
});
