import React from 'react';

interface PageTransitionWipeProps {
  isWiping: boolean;
  statusText?: string;
}

export const PageTransitionWipe: React.FC<PageTransitionWipeProps> = ({
  isWiping,
  statusText = 'ESTABLISHING LINK',
}) => {
  return (
    <div
      className={`fixed inset-0 z-50 bg-[#101216] flex items-center justify-center border-t border-white/20 pointer-events-none transition-transform duration-500 ease-in-out ${
        isWiping ? 'translate-y-0' : 'translate-y-full'
      }`}
      aria-hidden="true"
    >
      <span
        className={`font-mono text-xs md:text-sm tracking-[0.3em] uppercase text-[#eef2f7] transition-opacity duration-300 delay-150 ${
          isWiping ? 'opacity-100 animate-pulse' : 'opacity-0'
        }`}
      >
        {statusText}
      </span>
    </div>
  );
};
