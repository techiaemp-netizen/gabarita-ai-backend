'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Sidebar } from './sidebar';
import { Header } from './header';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, title, subtitle, className }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar */}
      <Sidebar isCollapsed={sidebarCollapsed} onToggle={toggleSidebar} />
      
      {/* Header */}
      <Header 
        sidebarCollapsed={sidebarCollapsed} 
        title={title} 
        subtitle={subtitle} 
      />
      
      {/* Main Content */}
      <main className={cn(
        'pt-16 transition-all duration-300 ease-in-out',
        sidebarCollapsed ? 'ml-16' : 'ml-64'
      )}>
        <div className={cn('p-6', className)}>
          {children}
        </div>
      </main>
    </div>
  );
};

export { Layout };