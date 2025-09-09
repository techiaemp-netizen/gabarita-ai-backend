'use client'

import { useState } from 'react'
import Link from 'next/link'

interface Questao {
  id: number
  pergunta: string
  opcoes: string[]
  resposta: number
  explicacao: string
  materia: string
}

const questoesDemo: Questao[] = [
  {
    id: 1,
    pergunta: "Qual é a capital do Brasil?",
    opcoes: [
      "São Paulo",
      "Rio de Janeiro",
      "Brasília",
      "Belo Horizonte"
    ],
    resposta: 2,
    explicacao: "Brasília é a capital federal do Brasil desde 1960, quando foi inaugurada durante o governo de Juscelino Kubitschek.",
    materia: "Geografia"
  },
  {
    id: 2,
    pergunta: "Quem escreveu 'Dom Casmurro'?",
    opcoes: [
      "José de Alencar",
      "Machado de Assis",
      "Clarice Lispector",
      "Guimarães Rosa"
    ],
    resposta: 1,
    explicacao: "'Dom Casmurro' foi escrito por Machado de Assis e publicado em 1899. É considerado uma das obras-primas da literatura brasileira.",
    materia: "Literatura"
  },
  {
    id: 3,
    pergunta: "Qual é a fórmula da água?",
    opcoes: [
      "H2O",
      "CO2",
      "NaCl",
      "CH4"
    ],
    resposta: 0,
    explicacao: "A água tem a fórmula química H2O, indicando que cada molécula é composta por dois átomos de hidrogênio e um de oxigênio.",
    materia: "Química"
  }
]

export default function DemoPage() {
  const [questaoAtual, setQuestaoAtual] = useState(0)
  const [respostaSelecionada, setRespostaSelecionada] = useState<number | null>(null)
  const [mostrarResposta, setMostrarResposta] = useState(false)
  const [pontuacao, setPontuacao] = useState(0)
  const [questoesRespondidas, setQuestoesRespondidas] = useState(0)

  const questao = questoesDemo[questaoAtual]

  const handleResposta = (opcaoIndex: number) => {
    if (mostrarResposta) return
    
    setRespostaSelecionada(opcaoIndex)
    setMostrarResposta(true)
    setQuestoesRespondidas(prev => prev + 1)
    
    if (opcaoIndex === questao.resposta) {
      setPontuacao(prev => prev + 1)
    }
  }

  const proximaQuestao = () => {
    if (questaoAtual < questoesDemo.length - 1) {
      setQuestaoAtual(prev => prev + 1)
      setRespostaSelecionada(null)
      setMostrarResposta(false)
    }
  }

  const reiniciarDemo = () => {
    setQuestaoAtual(0)
    setRespostaSelecionada(null)
    setMostrarResposta(false)
    setPontuacao(0)
    setQuestoesRespondidas(0)
  }

  const isUltimaQuestao = questaoAtual === questoesDemo.length - 1
  const demoCompleta = questoesRespondidas === questoesDemo.length

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Demonstração Interativa
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Experimente nossa plataforma com algumas questões de exemplo
          </p>
        </div>

        {!demoCompleta ? (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {/* Barra de Progresso */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Questão {questaoAtual + 1} de {questoesDemo.length}
                </span>
                <span className="text-sm font-medium text-gray-700">
                  {questao.materia}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((questaoAtual + 1) / questoesDemo.length) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Questão */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                {questao.pergunta}
              </h2>

              <div className="space-y-4">
                {questao.opcoes.map((opcao, index) => {
                  let buttonClass = "w-full p-4 text-left border-2 rounded-lg transition-all duration-200 "
                  
                  if (mostrarResposta) {
                    if (index === questao.resposta) {
                      buttonClass += "border-green-500 bg-green-50 text-green-800"
                    } else if (index === respostaSelecionada && index !== questao.resposta) {
                      buttonClass += "border-red-500 bg-red-50 text-red-800"
                    } else {
                      buttonClass += "border-gray-200 bg-gray-50 text-gray-600"
                    }
                  } else {
                    if (index === respostaSelecionada) {
                      buttonClass += "border-blue-500 bg-blue-50 text-blue-800"
                    } else {
                      buttonClass += "border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                    }
                  }

                  return (
                    <button
                      key={index}
                      onClick={() => handleResposta(index)}
                      className={buttonClass}
                      disabled={mostrarResposta}
                    >
                      <span className="font-medium mr-3">
                        {String.fromCharCode(65 + index)})
                      </span>
                      {opcao}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Explicação */}
            {mostrarResposta && (
              <div className="mb-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-blue-900 mb-2">Explicação:</h3>
                <p className="text-blue-800">{questao.explicacao}</p>
              </div>
            )}

            {/* Botões de Navegação */}
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                Pontuação: {pontuacao}/{questoesRespondidas}
              </div>
              
              {mostrarResposta && (
                <button
                  onClick={proximaQuestao}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  {isUltimaQuestao ? 'Ver Resultado' : 'Próxima Questão'}
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Resultado Final */
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="mb-8">
              <div className="w-24 h-24 mx-auto mb-6 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Demonstração Concluída!
              </h2>
              
              <div className="text-6xl font-bold text-blue-600 mb-2">
                {pontuacao}/{questoesDemo.length}
              </div>
              
              <p className="text-xl text-gray-600 mb-6">
                Você acertou {Math.round((pontuacao / questoesDemo.length) * 100)}% das questões
              </p>
              
              <div className="bg-blue-50 rounded-lg p-6 mb-8">
                <h3 className="font-semibold text-blue-900 mb-2">Na versão completa você terá:</h3>
                <ul className="text-blue-800 space-y-2">
                  <li>✓ Milhares de questões atualizadas</li>
                  <li>✓ Simulados personalizados</li>
                  <li>✓ Análise detalhada de desempenho</li>
                  <li>✓ Estatísticas de progresso</li>
                  <li>✓ Suporte especializado</li>
                </ul>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={reiniciarDemo}
                className="px-6 py-3 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium"
              >
                Tentar Novamente
              </button>
              
              <Link
                href="/planos"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Ver Planos
              </Link>
            </div>
          </div>
        )}

        {/* Call to Action */}
        <div className="mt-12 text-center">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Pronto para começar sua jornada?
            </h3>
            <p className="text-gray-600 mb-6">
              Acesse milhares de questões e prepare-se para o sucesso
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup"
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Criar Conta Grátis
              </Link>
              <Link
                href="/login"
                className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Já tenho conta
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}