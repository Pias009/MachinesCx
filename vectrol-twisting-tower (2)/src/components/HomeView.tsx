import React from 'react';
import { ViewMode } from '../types';

interface HomeViewProps {
  onOpenLab: () => void;
  onOpenContact: () => void;
  platesCount: number;
}

export const HomeView: React.FC<HomeViewProps> = ({ onOpenLab, onOpenContact, platesCount }) => {
  return (
    <div className="relative z-10 pt-28 md:pt-36 pb-16">
      {/* Hero Section */}
      <section className="min-h-[82vh] flex flex-col justify-center px-6 md:px-12 max-w-[1400px] mx-auto">
        <div className="flex items-center gap-4 mb-6 animate-fade-in">
          <div className="w-10 h-[1px] bg-[#7c828c]" />
          <span className="text-[11px] font-mono uppercase tracking-[0.3em] text-[#7c828c]">Form · in motion</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-[104px] font-bold leading-[0.92] tracking-tight max-w-[850px] mb-8 text-[#16181d]">
          A structure that <span className="text-[#7c828c] italic font-normal font-serif">twists</span> as you move.
        </h1>

        <div className="flex flex-col md:flex-row gap-12 md:gap-24 mt-4">
          <div className="max-w-md">
            <p className="text-base sm:text-lg text-[#7c828c] leading-relaxed">
              A procedural exploration of verticality. Built from {platesCount} stacked plates, each rotating precisely to create a continuous kinetic sweep. Rebuilt with interactive real-time controls.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <button 
                onClick={onOpenLab}
                className="px-8 py-4 bg-[#16181d] border border-[#16181d] text-xs font-mono tracking-widest uppercase text-white hover:bg-transparent hover:text-[#16181d] transition-colors cursor-pointer shadow-sm"
              >
                Launch Systems Lab →
              </button>
              <button 
                onClick={onOpenContact}
                className="px-8 py-4 border border-[#16181d] text-xs font-mono tracking-widest uppercase text-[#16181d] hover:bg-[#16181d] hover:text-white transition-colors cursor-pointer"
              >
                Request Access
              </button>
            </div>
          </div>

          {/* Stats Row */}
          <div className="flex flex-row md:flex-col gap-8 md:gap-8 border-t md:border-t-0 md:border-l border-[#16181d]/10 pt-6 md:pt-0 md:pl-10">
            <div className="font-mono">
              <span className="block text-2xl sm:text-3xl font-bold text-[#16181d]">{platesCount}</span>
              <span className="text-[10px] uppercase tracking-widest text-[#7c828c]">Stacked Plates</span>
            </div>
            <div className="font-mono">
              <span className="block text-2xl sm:text-3xl font-bold text-[#16181d]">3.0×</span>
              <span className="text-[10px] uppercase tracking-widest text-[#7c828c]">Full Rotations</span>
            </div>
            <div className="font-mono">
              <span className="block text-2xl sm:text-3xl font-bold text-[#16181d]">60</span>
              <span className="text-[10px] uppercase tracking-widest text-[#7c828c]">Target FPS</span>
            </div>
          </div>
        </div>

        {/* Scroll cue */}
        <div className="mt-20 md:mt-28 flex items-center gap-3 text-[10px] font-mono text-[#7c828c] uppercase tracking-widest select-none">
          <div className="w-0.5 h-8 bg-gradient-to-b from-[#16181d] to-transparent animate-pulse" />
          Scroll down the tower
        </div>
      </section>

      {/* Band 1: Geometry */}
      <section className="py-24 md:py-36 px-6 md:px-12 border-t border-[#16181d]/10 max-w-[1400px] mx-auto mt-12">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-6 h-[1px] bg-[#7c828c]" />
          <span className="text-[11px] font-mono uppercase tracking-[0.28em] text-[#7c828c]">01 — Geometry</span>
        </div>
        
        <h2 className="text-3xl sm:text-5xl lg:text-[64px] font-bold tracking-tight max-w-[700px] leading-[1.04] text-[#16181d]">
          Built from thin <span className="text-[#7c828c] italic font-normal font-serif">plates</span>, twisted around one axis.
        </h2>
        
        <p className="mt-6 max-w-[550px] text-[#7c828c] text-base sm:text-lg leading-relaxed">
          Each plate is rotated a few degrees more than the one below it, and the whole stack sways on a gentle sine curve. Scroll down and the camera travels the tower; move your cursor across the screen and the architecture tilts to meet your perspective.
        </p>

        {/* Specs Box Grid */}
        <div className="mt-14 grid grid-cols-1 sm:grid-cols-3 gap-[1px] bg-[#16181d]/10 border border-[#16181d]/10 max-w-[900px]">
          <div className="bg-[#fafafa] p-8">
            <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#7c828c]">Twist / plate</div>
            <div className="font-display text-4xl font-bold mt-2 text-[#16181d]">9.2<small className="text-base font-mono text-[#7c828c] font-normal ml-1">deg</small></div>
          </div>
          <div className="bg-[#fafafa] p-8">
            <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#7c828c]">Material</div>
            <div className="font-display text-4xl font-bold mt-2 text-[#16181d]">matte<small className="text-base font-mono text-[#7c828c] font-normal ml-1">white</small></div>
          </div>
          <div className="bg-[#fafafa] p-8">
            <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#7c828c]">Shadows</div>
            <div className="font-display text-4xl font-bold mt-2 text-[#16181d]">soft<small className="text-base font-mono text-[#7c828c] font-normal ml-1">PCF</small></div>
          </div>
        </div>
      </section>

      {/* Band 2: Light */}
      <section className="py-24 md:py-32 px-6 md:px-12 border-t border-[#16181d]/10 max-w-[1400px] mx-auto">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-6 h-[1px] bg-[#7c828c]" />
          <span className="text-[11px] font-mono uppercase tracking-[0.28em] text-[#7c828c]">02 — Light</span>
        </div>
        
        <h2 className="text-3xl sm:text-5xl lg:text-[64px] font-bold tracking-tight max-w-[680px] leading-[1.04] text-[#16181d]">
          Soft <span className="text-[#7c828c] italic font-normal font-serif">shadows</span> do all the heavy lifting.
        </h2>
        
        <p className="mt-6 max-w-[550px] text-[#7c828c] text-base sm:text-lg leading-relaxed">
          A calibrated hemisphere ambient light plus a singular high-altitude key light, projected through high-resolution 2048px shadow maps, allows pristine matte white forms to delineate against a near-white field.
        </p>

        <div className="mt-12">
          <button 
            onClick={onOpenLab}
            className="px-6 py-3 border border-[#16181d]/30 text-xs font-mono uppercase tracking-widest hover:border-[#16181d] hover:bg-[#16181d] hover:text-white transition-all cursor-pointer"
          >
            Customize Lighting & Geometry in Lab →
          </button>
        </div>
      </section>

      {/* Footer Bar */}
      <footer className="mt-20 px-6 md:px-12 py-8 border-t border-[#16181d]/10 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-8 max-w-[1400px] mx-auto z-10">
        <div className="flex items-center gap-3 text-[10px] font-mono text-[#7c828c] uppercase tracking-widest">
          <div className="w-0.5 h-8 bg-gradient-to-b from-[#16181d] to-transparent" />
          Kinetic Architecture · Starter Scaffold
        </div>
        
        <div className="flex flex-wrap gap-12 sm:gap-16">
          <div className="text-[10px] font-mono text-[#7c828c] leading-relaxed">
            <span className="block font-bold text-[#16181d] mb-1 uppercase tracking-tight">Contact</span>
            hello@vectrol.example<br/>
            +1 (000) 555 0142
          </div>
          <div className="text-[10px] font-mono text-[#7c828c] leading-relaxed sm:text-right">
            <span className="block font-bold text-[#16181d] mb-1 uppercase tracking-tight">System Status</span>
            REV 4.2 // ONLINE<br/>
            © 2026 VECTROL
          </div>
        </div>
      </footer>
    </div>
  );
};
