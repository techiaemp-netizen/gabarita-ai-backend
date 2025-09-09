export default function TestStyles() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-blue-600 mb-8">
          Teste de Estilos Tailwind
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Card 1
            </h2>
            <p className="text-gray-600">
              Este é um teste básico do Tailwind CSS.
            </p>
            <button className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              Botão Teste
            </button>
          </div>
          
          <div className="bg-green-100 p-6 rounded-lg border-2 border-green-300">
            <h2 className="text-xl font-semibold text-green-800 mb-4">
              Card 2
            </h2>
            <p className="text-green-700">
              Testando cores e bordas.
            </p>
            <div className="mt-4 w-full bg-green-200 rounded-full h-2.5">
              <div className="bg-green-600 h-2.5 rounded-full w-3/4"></div>
            </div>
          </div>
          
          <div className="bg-red-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-red-800 mb-4">
              Card 3
            </h2>
            <p className="text-red-600">
              Testando responsividade e layout.
            </p>
            <div className="flex space-x-2 mt-4">
              <span className="bg-red-200 text-red-800 px-2 py-1 rounded text-sm">
                Tag 1
              </span>
              <span className="bg-red-200 text-red-800 px-2 py-1 rounded text-sm">
                Tag 2
              </span>
            </div>
          </div>
        </div>
        
        <div className="mt-8 p-6 bg-yellow-50 border-l-4 border-yellow-400">
          <h3 className="text-lg font-medium text-yellow-800">
            Status do Tailwind
          </h3>
          <p className="text-yellow-700 mt-2">
            Se você está vendo cores, espaçamentos e layouts corretos, o Tailwind está funcionando!
          </p>
        </div>
        
        <div className="mt-8">
          <h3 className="text-2xl font-bold mb-4">Teste de Responsividade</h3>
          <div className="bg-purple-100 p-4 rounded">
            <p className="text-sm md:text-base lg:text-lg xl:text-xl">
              Este texto muda de tamanho conforme o breakpoint:
              <br />
              <span className="font-mono">
                sm: text-sm | md: text-base | lg: text-lg | xl: text-xl
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}