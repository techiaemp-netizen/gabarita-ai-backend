import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Gabarita AI - Plataforma de Estudos Inteligente",
  description: "Plataforma completa de estudos com simulados, gamificação e inteligência artificial para potencializar seu aprendizado.",
  keywords: "estudos, simulados, concursos, gamificação, inteligência artificial, educação",
  authors: [{ name: "Gabarita AI" }],
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.variable} font-sans antialiased bg-gray-50`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
