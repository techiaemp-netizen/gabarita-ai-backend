'use client'

import { useState } from 'react'

interface Plano {
  id: string
  nome: string
  preco: number
  descricao: string
  recursos: string[]
  popular?: boolean
}

const planos: Plano[] = [
  {
    id: 'basico',
    nome: 'Básico',
    preco: 29.90,
    descricao: 'Ideal para iniciantes',
    recursos: [
      'Acesso a questões básicas',
      'Simulados mensais',
      'Suporte por email'
    ]
  },
  {
    id: 'premium',
    nome: 'Premium',
    preco: 59.90,
    descricao: 'Para estudantes dedicados',
    recursos: [
      'Acesso completo às questões',
      'Simulados ilimitados',
      'Análise de desempenho',
      'Suporte prioritário'
    ],
    popular: true
  },
  {
    id: 'pro',
    nome: 'Pro',
    preco: 99.90,
    descricao: 'Para máximo aproveitamento',
    recursos: [
      'Todos os recursos Premium',
      'Mentoria personalizada',
      'Acesso antecipado a novos conteúdos',
      'Suporte 24/7'
    ]
  }
]

export default function PlanosPage() {
  const [planoSelecionado, setPlanoSelecionado] = useState<string | null>(null)

  const handleSelecionarPlano = (planoId: string) => {
    setPlanoSelecionado(planoId)
    // Aqui seria implementada a lógica de redirecionamento para pagamento
    console.log('Plano selecionado:', planoId)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Escolha seu Plano
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Selecione o plano ideal para sua jornada de estudos e alcance seus objetivos
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {planos.map((plano) => (
            <div
              key={plano.id}
              className={`relative bg-white rounded-2xl shadow-xl p-8 transition-all duration-300 hover:scale-105 ${
                plano.popular ? 'ring-2 ring-blue-500 ring-offset-2' : ''
              }`}
            >
              {plano.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
                    Mais Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {plano.nome}
                </h3>
                <p className="text-gray-600 mb-4">{plano.descricao}</p>
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  R$ {plano.preco.toFixed(2)}
                </div>
                <p className="text-gray-500">por mês</p>
              </div>

              <ul className="space-y-4 mb-8">
                {plano.recursos.map((recurso, index) => (
                  <li key={index} className="flex items-center">
                    <svg
                      className="w-5 h-5 text-green-500 mr-3 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-gray-700">{recurso}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSelecionarPlano(plano.id)}
                className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 ${
                  plano.popular
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                } ${planoSelecionado === plano.id ? 'ring-2 ring-blue-500' : ''}`}
              >
                {planoSelecionado === plano.id ? 'Selecionado' : 'Selecionar Plano'}
              </button>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">
            Todos os planos incluem garantia de 7 dias
          </p>
          <p className="text-sm text-gray-500">
            Cancele a qualquer momento • Sem taxas ocultas • Suporte especializado
          </p>
        </div>
      </div>
    </div>
  )
}