"use client";

import Image from 'next/image';
import { useAuth } from '../utils/auth';
import { Menu } from 'lucide-react';

/**
 * Header component
 *
 * Displays the logo, the current user's display name (if signed in)
 * and a button to toggle the navigation drawer. This header is
 * intended to be used at the top of all authenticated pages.
 */
export default function Header({ onMenuToggle }) {
  const { user } = useAuth();
  return (
    <header className="w-full flex items-center justify-between px-4 py-2 bg-background border-b border-gray-200 sticky top-0 z-30">
      <div className="flex items-center">
        <Image src="/logo.png" alt="Logo" width={32} height={32} />
        <span className="ml-2 font-medium text-lg">Gabarita.AI</span>
      </div>
      <div className="flex items-center space-x-4">
        {user && <span className="text-sm text-gray-600">Olá, {user.displayName}</span>}
        <button onClick={onMenuToggle} className="p-2 rounded-md hover:bg-gray-100">
          <Menu className="w-6 h-6" />
        </button>
      </div>
    </header>
  );
}
