import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Navigation from "./components/Navigation"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Gabarita AI - Plataforma de Estudos",
  description: "A melhor plataforma para seus estudos com questões atualizadas e simulados personalizados",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} antialiased`}>
        <Navigation />
        <main>{children}</main>
      </body>
    </html>
  )
}
