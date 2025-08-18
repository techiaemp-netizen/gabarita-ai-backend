"use client";

import Link from 'next/link';
import { Home, Play, BarChart, Trophy, Newspaper } from 'lucide-react';

/**
 * NavDrawer component
 *
 * A slide-in drawer styled similarly to Notion’s sidebar. The drawer
 * becomes visible when the `open` prop is true and hides when false.
 * An overlay darkens the rest of the screen and closes the drawer
 * when clicked.
 */
export default function NavDrawer({ open, onClose }) {
  return (
    <div className={`fixed inset-0 z-40 ${open ? '' : 'pointer-events-none'}`}>
      {/* Overlay */}
      <div
        className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />
      {/* Drawer */}
      <div
        className={`absolute left-0 top-0 h-full w-64 bg-white shadow-md transform transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <nav className="flex flex-col p-4 space-y-4 text-gray-700">
          <Link href="/painel" className="flex items-center space-x-2 hover:text-primary" onClick={onClose}>
            <Home className="w-5 h-5" />
            <span>Painel</span>
          </Link>
          <Link href="/simulado" className="flex items-center space-x-2 hover:text-primary" onClick={onClose}>
            <Play className="w-5 h-5" />
            <span>Simulado</span>
          </Link>
          <Link href="/desempenho" className="flex items-center space-x-2 hover:text-primary" onClick={onClose}>
            <BarChart className="w-5 h-5" />
            <span>Desempenho</span>
          </Link>
          <Link href="/ranking" className="flex items-center space-x-2 hover:text-primary" onClick={onClose}>
            <Trophy className="w-5 h-5" />
            <span>Ranking</span>
          </Link>
          <Link href="/noticias" className="flex items-center space-x-2 hover:text-primary" onClick={onClose}>
            <Newspaper className="w-5 h-5" />
            <span>Notícias</span>
          </Link>
          <Link href="/redacao" className="flex items-center space-x-2 hover:text-primary" onClick={onClose}>
            <span className="text-xl">📝</span>
            <span>Redação</span>
          </Link>
        </nav>
      </div>
    </div>
  );
}
