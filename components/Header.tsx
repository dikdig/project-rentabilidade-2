/** @jsx React.createElement */
/** @jsxFrag React.Fragment */
import React from 'react';
import { BarChart3, Bell } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="bg-brand-700 text-white border-b border-brand-800 sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Analise de Rentabilidade Inteligente</h1>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="p-2 rounded-full hover:bg-brand-600 transition-colors text-brand-100 relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-white rounded-full"></span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};