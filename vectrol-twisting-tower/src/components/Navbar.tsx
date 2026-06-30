import React from 'react';
import { ViewMode } from '../types';

interface NavbarProps {
  currentView: ViewMode;
  onSelectView: (view: ViewMode) => void;
  autoRotate: boolean;
  onToggleRotate: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onSelectView,
  autoRotate,
  onToggleRotate,
}) => {
  return (
    <nav className="fixed top-0 left-0 right-0 flex justify-between items-center px-6 md:px-12 py-6 md:py-8 z-20 backdrop-blur-[2px]">
      <div 
        className="text-sm font-bold tracking-[0.2em] uppercase cursor-pointer select-none"
        onClick={() => onSelectView('home')}
      >
        VEC<span className="text-[#7c828c]">·</span>TROL
      </div>

      <div className="flex items-center gap-6 md:gap-8 text-[11px] font-mono uppercase tracking-widest text-[#7c828c]">
        <button
          onClick={() => onSelectView('home')}
          className={`cursor-pointer transition-colors pb-1 ${
            currentView === 'home'
              ? 'text-[#16181d] border-b border-[#16181d]'
              : 'hover:text-[#16181d]'
          }`}
        >
          Vector
        </button>
        <button
          onClick={() => onSelectView('tech')}
          className={`cursor-pointer transition-colors pb-1 flex items-center gap-1.5 ${
            currentView === 'tech'
              ? 'text-[#16181d] border-b border-[#16181d]'
              : 'hover:text-[#16181d]'
          }`}
        >
          Systems <span className="text-[9px] px-1 py-0.2 bg-[#16181d]/10 text-[#16181d] rounded">LAB</span>
        </button>
        <button
          onClick={() => onSelectView('contact')}
          className={`cursor-pointer transition-colors pb-1 ${
            currentView === 'contact'
              ? 'text-[#16181d] border-b border-[#16181d]'
              : 'hover:text-[#16181d]'
          }`}
        >
          Uplink
        </button>

        <div className="hidden sm:block w-[1px] h-3 bg-[#7c828c]/40 mx-1" />

        <button
          onClick={onToggleRotate}
          className="hidden sm:flex items-center gap-1.5 text-[9px] tracking-wider border border-[#16181d]/20 px-2.5 py-1 hover:border-[#16181d] text-[#16181d] transition-all"
          title={autoRotate ? "Pause kinetic motor" : "Start kinetic motor"}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${autoRotate ? 'bg-emerald-600 animate-pulse' : 'bg-[#7c828c]'}`} />
          {autoRotate ? 'MOTOR ON' : 'PAUSED'}
        </button>
      </div>
    </nav>
  );
};
