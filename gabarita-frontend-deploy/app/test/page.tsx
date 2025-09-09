'use client';

export default function TestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          🎯 Gabarita AI - Teste
        </h1>
        <p className="text-gray-600 mb-6">
          Se você está vendo esta página, o React está funcionando!
        </p>
        <div className="space-y-4">
          <div className="bg-green-100 text-green-800 p-3 rounded">
            ✅ Next.js 14 carregado
          </div>
          <div className="bg-blue-100 text-blue-800 p-3 rounded">
            ✅ Tailwind CSS funcionando
          </div>
          <div className="bg-purple-100 text-purple-800 p-3 rounded">
            ✅ Componente React renderizado
          </div>
        </div>
        <div className="mt-6">
          <a 
            href="/" 
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            Voltar para Home
          </a>
        </div>
      </div>
    </div>
  );
}