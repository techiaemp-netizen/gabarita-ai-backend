import './globals.css'

export const metadata = {
  title: 'Gabarita AI',
  description: 'Plataforma de estudos com IA para concursos públicos',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-gray-50">{children}</body>
    </html>
  )
}
