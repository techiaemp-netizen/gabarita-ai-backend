import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Image from 'next/image'
import './globals.css'
import { ClientProviders } from '@/components/ClientProviders'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Gabarita AI - Simulados e Estudos',
  description: 'Plataforma de simulados e estudos preparatórios com inteligência artificial',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <ClientProviders>
          <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm border-b">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                  <div className="flex items-center space-x-3">
                    <Image 
                      src="/logo-gabarita.png" 
                      alt="Gabarita AI" 
                      width={40} 
                      height={40}
                      className="rounded-lg"
                    />
                    <h1 className="text-xl font-bold text-gray-900">Gabarita AI</h1>
                  </div>
                  <nav className="flex space-x-4">
                    <a href="/" className="text-gray-600 hover:text-gray-900">Início</a>
                    <a href="/planos" className="text-gray-600 hover:text-gray-900">Planos</a>
                    <a href="/simulado" className="text-gray-600 hover:text-gray-900">Simulados</a>
                    <a href="/dashboard" className="text-gray-600 hover:text-gray-900">Dashboard</a>
                    <a href="/questoes" className="text-gray-600 hover:text-gray-900">Questões</a>
                    <a href="/jogos" className="text-gray-600 hover:text-gray-900">Jogos</a>
                    <a href="/ranking" className="text-gray-600 hover:text-gray-900">Ranking</a>
                    <a href="/login" className="text-gray-600 hover:text-gray-900">Login</a>
                  </nav>
                </div>
              </div>
            </header>
            <main className="flex-1">
              {children}
            </main>
            <footer className="bg-white border-t">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <p className="text-center text-gray-600">© 2024 Gabarita AI. Todos os direitos reservados.</p>
              </div>
            </footer>
          </div>
        </ClientProviders>
      </body>
    </html>
  )
}