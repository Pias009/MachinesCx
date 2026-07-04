import React, { useState } from 'react';

export const ContactView: React.FC = () => {
  const [sent, setSent] = useState(false);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSent(true);
  };

  return (
    <div className="relative z-10 min-h-[90vh] flex flex-col justify-between pt-32 md:pt-40 pb-12 px-6 md:px-12 max-w-[1400px] mx-auto animate-fade-in">
      <div className="max-w-[800px]">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-10 h-[1px] bg-[#7c828c]" />
          <span className="text-[11px] font-mono uppercase tracking-[0.3em] text-[#7c828c]">Uplink · Communications</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-[104px] font-bold leading-[0.94] tracking-tight mb-12 text-[#16181d]">
          Open a <span className="text-[#7c828c] italic font-normal font-serif">channel</span>.
        </h1>

        {/* Contact Info Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-12 font-mono text-xs sm:text-sm text-[#7c828c] tracking-wider my-12 border-y border-[#16181d]/10 py-10">
          <div>
            <span className="block font-bold text-[#16181d] text-base mb-2">Inquiries</span>
            <a href="mailto:hello@vectrol.example" className="hover:text-[#16181d] underline transition-colors">hello@vectrol.example</a>
          </div>
          <div>
            <span className="block font-bold text-[#16181d] text-base mb-2">Studio</span>
            <span>+1 (000) 555 0142</span>
          </div>
          <div>
            <span className="block font-bold text-[#16181d] text-base mb-2">Location</span>
            <span>Floor 34 · Kinetic District</span>
          </div>
        </div>

        {/* Form or Confirmation */}
        {!sent ? (
          <form onSubmit={handleSubmit} className="mt-8 space-y-4 max-w-lg">
            <h3 className="text-xs font-mono uppercase tracking-widest text-[#16181d] font-bold mb-4">Request Scaffold Access / GLB Blueprint</h3>
            <div className="space-y-3">
              <input
                type="email"
                required
                placeholder="Enter your institutional email..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3.5 bg-[#ececea]/50 border border-[#16181d]/20 text-sm font-mono focus:outline-none focus:border-[#16181d] text-[#16181d] placeholder-[#7c828c]"
              />
              <textarea
                rows={3}
                placeholder="Project parameters or custom architecture inquiry..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-4 py-3.5 bg-[#ececea]/50 border border-[#16181d]/20 text-sm font-mono focus:outline-none focus:border-[#16181d] text-[#16181d] placeholder-[#7c828c]"
              />
            </div>
            <button
              type="submit"
              className="mt-2 px-8 py-4 bg-[#16181d] border border-[#16181d] text-xs font-mono tracking-widest uppercase text-white hover:bg-transparent hover:text-[#16181d] transition-colors cursor-pointer"
            >
              Request Access →
            </button>
          </form>
        ) : (
          <div className="p-8 bg-[#16181d] text-white border border-[#16181d] max-w-lg animate-fade-in">
            <span className="font-mono text-xs text-emerald-400 font-bold uppercase tracking-widest block mb-2">● Uplink Established</span>
            <h3 className="text-xl font-display font-bold">Access Granted</h3>
            <p className="text-sm text-[#cbd5e1] mt-2 font-mono leading-relaxed">
              Transmission received for [{email}]. Our architectural synthesis core will forward the starter scaffold credentials to your inbox shortly.
            </p>
            <button
              onClick={() => setSent(false)}
              className="mt-6 text-xs font-mono underline text-[#7c828c] hover:text-white uppercase cursor-pointer"
            >
              Send another message
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-24 pt-8 border-t border-[#16181d]/10 flex flex-col sm:flex-row justify-between items-center gap-4 font-mono text-[11px] uppercase tracking-widest text-[#7c828c]">
        <span>VECTROL</span>
        <span>© 2026 · STARTER SCAFFOLD</span>
      </footer>
    </div>
  );
};
