import React, { useRef } from 'react';
import { PresetGeometry, SceneConfig } from '../types';

interface SystemsLabViewProps {
  config: SceneConfig;
  onChangeConfig: (newConfig: Partial<SceneConfig>) => void;
  onResetConfig: () => void;
}

export const SystemsLabView: React.FC<SystemsLabViewProps> = ({
  config,
  onChangeConfig,
  onResetConfig,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Revoke previous URL if any
    if (config.uploadedModelUrl && config.uploadedModelUrl.startsWith('blob:')) {
      URL.revokeObjectURL(config.uploadedModelUrl);
    }

    const url = URL.createObjectURL(file);
    onChangeConfig({
      uploadedModelUrl: url,
      uploadedModelName: file.name
    });
  };

  const handleClearUploadedModel = () => {
    if (config.uploadedModelUrl && config.uploadedModelUrl.startsWith('blob:')) {
      URL.revokeObjectURL(config.uploadedModelUrl);
    }
    onChangeConfig({
      uploadedModelUrl: undefined,
      uploadedModelName: undefined
    });
  };

  const presets: { id: PresetGeometry; name: string; desc: string }[] = [
    { id: 'tower', name: 'Twisting Tower', desc: 'Stacked oscillating thin horizontal plates' },
    { id: 'helix', name: 'Double Helix', desc: 'Twin opposing counter-rotating ribbons' },
    { id: 'monolith', name: 'Monolith Core', desc: 'Graduated heavy brutalist square slabs' },
    { id: 'lattice', name: 'Orbital Rings', desc: 'Nested rotating torus rings sequence' },
  ];

  const colorPalettes = [
    { name: 'Matte White', hex: '#ffffff' },
    { name: 'Warm Alabaster', hex: '#f3ece4' },
    { name: 'Obsidian Slate', hex: '#262930' },
    { name: 'Cobalt Architectural', hex: '#1d3b8a' },
    { name: 'Terracotta Earth', hex: '#b8543d' },
  ];

  return (
    <div className="relative z-10 pt-28 md:pt-36 pb-20 px-6 md:px-12 max-w-[1400px] mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-10 border-b border-[#16181d]/10">
        <div>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-8 h-[1px] bg-[#7c828c]" />
            <span className="text-[11px] font-mono uppercase tracking-[0.28em] text-[#7c828c]">Systems · Interactive Lab</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-[#16181d]">
            Procedural <span className="text-[#7c828c] italic font-normal font-serif">geometry</span> lab.
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={onResetConfig}
            className="px-5 py-2.5 border border-[#16181d]/20 text-[11px] font-mono uppercase tracking-widest text-[#7c828c] hover:text-[#16181d] hover:border-[#16181d] transition-all cursor-pointer"
          >
            Reset Default Tower
          </button>
          <span className="font-mono text-xs text-[#7c828c] tracking-widest hidden sm:inline">REV 4.2</span>
        </div>
      </div>

      {/* Main Lab Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mt-12">
        {/* Left Column: Real-time Controller (7 cols) */}
        <div className="lg:col-span-7 space-y-10">
          {/* Preset Picker */}
          <div className="bg-[#ececea]/60 border border-[#16181d]/10 p-6 sm:p-8">
            <h3 className="text-xs font-mono uppercase tracking-widest text-[#7c828c] mb-4">01 // Architectural Preset</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {presets.map((p) => {
                const isActive = config.preset === p.id && !config.uploadedModelUrl;
                return (
                  <button
                    key={p.id}
                    onClick={() => {
                      if (config.uploadedModelUrl) handleClearUploadedModel();
                      onChangeConfig({ preset: p.id });
                    }}
                    className={`text-left p-4 border transition-all cursor-pointer flex flex-col justify-between ${
                      isActive
                        ? 'bg-[#16181d] text-white border-[#16181d] shadow-md'
                        : 'bg-[#fafafa] text-[#16181d] border-[#16181d]/10 hover:border-[#16181d]/40'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-display font-bold text-sm">{p.name}</span>
                      <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-400' : 'bg-transparent border border-[#7c828c]'}`} />
                    </div>
                    <span className={`text-[11px] mt-2 ${isActive ? 'text-[#eef2f7]/70' : 'text-[#7c828c]'}`}>{p.desc}</span>
                  </button>
                );
              })}
            </div>

            {/* Custom Model Dropzone */}
            <div className="mt-6 pt-6 border-t border-[#16181d]/10">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono uppercase tracking-widest text-[#16181d] font-bold">Or Upload Custom .GLB / .GLTF</span>
                {config.uploadedModelName && (
                  <button
                    onClick={handleClearUploadedModel}
                    className="text-[10px] font-mono text-red-600 uppercase tracking-wider underline cursor-pointer hover:text-red-800"
                  >
                    Remove [{config.uploadedModelName}]
                  </button>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".glb,.gltf"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className={`w-full py-4 px-6 border border-dashed transition-all text-center cursor-pointer font-mono text-xs tracking-wider flex items-center justify-center gap-3 ${
                  config.uploadedModelUrl
                    ? 'bg-blue-50/50 border-blue-600 text-blue-900 font-bold'
                    : 'bg-[#fafafa] border-[#16181d]/20 hover:border-[#16181d] text-[#7c828c] hover:text-[#16181d]'
                }`}
              >
                <span className="text-lg">▲</span>
                {config.uploadedModelName
                  ? `Active Model: ${config.uploadedModelName}`
                  : 'Click to drop any .GLB 3D model into scene'}
              </button>
            </div>
          </div>

          {/* Sliders Box */}
          <div className={`bg-[#ececea]/60 border border-[#16181d]/10 p-6 sm:p-8 space-y-8 ${config.uploadedModelUrl ? 'opacity-50 pointer-events-none' : ''}`}>
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono uppercase tracking-widest text-[#7c828c]">02 // Procedural Parameters</h3>
              {config.uploadedModelUrl && <span className="text-[10px] font-mono text-amber-700 font-bold bg-amber-100 px-2 py-0.5">Disabled for custom GLB</span>}
            </div>

            {/* Plates Count */}
            <div>
              <div className="flex justify-between font-mono text-xs mb-2">
                <span className="text-[#16181d] font-bold">Plates / Elements Count</span>
                <span className="text-[#7c828c]">{config.plates} units</span>
              </div>
              <input
                type="range"
                min={20}
                max={200}
                step={5}
                value={config.plates}
                onChange={(e) => onChangeConfig({ plates: Number(e.target.value) })}
                className="w-full h-1.5 bg-[#16181d]/20 rounded-lg appearance-none cursor-pointer accent-[#16181d]"
              />
            </div>

            {/* Twist Angle */}
            <div>
              <div className="flex justify-between font-mono text-xs mb-2">
                <span className="text-[#16181d] font-bold">Twist Delta per Element</span>
                <span className="text-[#7c828c]">{config.twistAngle.toFixed(1)}°</span>
              </div>
              <input
                type="range"
                min={0}
                max={25}
                step={0.2}
                value={config.twistAngle}
                onChange={(e) => onChangeConfig({ twistAngle: Number(e.target.value) })}
                className="w-full h-1.5 bg-[#16181d]/20 rounded-lg appearance-none cursor-pointer accent-[#16181d]"
              />
            </div>

            {/* Vertical Spacing GAP */}
            <div>
              <div className="flex justify-between font-mono text-xs mb-2">
                <span className="text-[#16181d] font-bold">Vertical Stacking Gap</span>
                <span className="text-[#7c828c]">{config.gap.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min={0.05}
                max={0.35}
                step={0.01}
                value={config.gap}
                onChange={(e) => onChangeConfig({ gap: Number(e.target.value) })}
                className="w-full h-1.5 bg-[#16181d]/20 rounded-lg appearance-none cursor-pointer accent-[#16181d]"
              />
            </div>

            {/* Sine Sway Curvature */}
            <div>
              <div className="flex justify-between font-mono text-xs mb-2">
                <span className="text-[#16181d] font-bold">Sway Wave Curvature</span>
                <span className="text-[#7c828c]">{(config.waveAmplitude * 10).toFixed(1)}×</span>
              </div>
              <input
                type="range"
                min={0}
                max={0.8}
                step={0.05}
                value={config.waveAmplitude}
                onChange={(e) => onChangeConfig({ waveAmplitude: Number(e.target.value) })}
                className="w-full h-1.5 bg-[#16181d]/20 rounded-lg appearance-none cursor-pointer accent-[#16181d]"
              />
            </div>
          </div>

          {/* Material & Motion */}
          <div className="bg-[#ececea]/60 border border-[#16181d]/10 p-6 sm:p-8 space-y-6">
            <h3 className="text-xs font-mono uppercase tracking-widest text-[#7c828c]">03 // Surface & Dynamics</h3>

            {/* Color Swatches */}
            <div>
              <span className="block font-mono text-xs text-[#16181d] font-bold mb-3">Architectural Material Tint</span>
              <div className="flex flex-wrap gap-3">
                {colorPalettes.map((c) => (
                  <button
                    key={c.hex}
                    onClick={() => onChangeConfig({ color: c.hex })}
                    className={`flex items-center gap-2 px-3.5 py-2 border text-xs font-mono transition-all cursor-pointer ${
                      config.color.toLowerCase() === c.hex.toLowerCase()
                        ? 'border-[#16181d] bg-[#16181d] text-white shadow-sm'
                        : 'border-[#16181d]/20 bg-[#fafafa] text-[#16181d] hover:border-[#16181d]'
                    }`}
                  >
                    <span className="w-3 h-3 border border-black/20" style={{ backgroundColor: c.hex }} />
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Wireframe toggle */}
            <div className="flex items-center justify-between pt-4 border-t border-[#16181d]/10">
              <div>
                <span className="block font-mono text-xs font-bold text-[#16181d]">Wireframe Structural Mode</span>
                <span className="text-[11px] text-[#7c828c]">Render raw polygonal mesh vectors</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={config.wireframe}
                  onChange={(e) => onChangeConfig({ wireframe: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#16181d]" />
              </label>
            </div>

            {/* Kinetic Motor Speed */}
            <div className="pt-4 border-t border-[#16181d]/10">
              <div className="flex justify-between font-mono text-xs mb-2">
                <span className="text-[#16181d] font-bold">Kinetic Rotation Velocity</span>
                <span className="text-[#7c828c]">{config.speed.toFixed(1)}×</span>
              </div>
              <input
                type="range"
                min={0}
                max={4}
                step={0.1}
                value={config.speed}
                onChange={(e) => onChangeConfig({ speed: Number(e.target.value) })}
                className="w-full h-1.5 bg-[#16181d]/20 rounded-lg appearance-none cursor-pointer accent-[#16181d]"
              />
            </div>

            {/* Pointer Hover Tilt Intensity */}
            <div className="pt-4 border-t border-[#16181d]/10">
              <div className="flex justify-between font-mono text-xs mb-2">
                <span className="text-[#16181d] font-bold">Pointer Hover Tilt Effect</span>
                <span className="text-[#7c828c]">{config.tiltIntensity === 0 ? 'STOPPED' : `${config.tiltIntensity.toFixed(1)}×`}</span>
              </div>
              <input
                type="range"
                min={0}
                max={2}
                step={0.1}
                value={config.tiltIntensity}
                onChange={(e) => onChangeConfig({ tiltIntensity: Number(e.target.value) })}
                className="w-full h-1.5 bg-[#16181d]/20 rounded-lg appearance-none cursor-pointer accent-[#16181d]"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Original Systems Cards & Specs (5 cols) */}
        <div className="lg:col-span-5 space-y-8 flex flex-col">
          <div className="bg-[#16181d] text-white p-8 border border-[#16181d]">
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#7c828c] block mb-2">Live Engine Telemetry</span>
            <h3 className="text-2xl font-display font-bold">Three.js WebGL Core</h3>
            <p className="text-sm text-[#cbd5e1] mt-3 leading-relaxed">
              Active canvas rendering at 60fps. All procedural geometry recalculations execute in real time on the GPU.
            </p>
            <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-2 gap-4 font-mono text-xs text-[#cbd5e1]">
              <div>
                <span className="text-[10px] text-[#7c828c] block uppercase">Polygon Mode</span>
                {config.wireframe ? 'WIREFRAME' : 'SOLID MATTE'}
              </div>
              <div>
                <span className="text-[10px] text-[#7c828c] block uppercase">Active Geometry</span>
                {config.uploadedModelName ? 'CUSTOM GLB' : config.preset.toUpperCase()}
              </div>
            </div>
          </div>

          <h3 className="text-xs font-mono uppercase tracking-widest text-[#7c828c] pt-4">Original Reference Specs</h3>

          {/* Cards Grid from original HTML */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-[1px] bg-[#16181d]/10 border border-[#16181d]/10">
            <div className="bg-[#ececea] p-6 min-h-[190px] flex flex-col">
              <div className="font-mono text-xs text-[#7c828c] tracking-widest">/ 01</div>
              <h4 className="font-display font-bold text-lg mt-auto text-[#16181d]">GLTF Loader</h4>
              <p className="mt-2 text-xs text-[#7c828c] leading-relaxed">Drop a .glb in place of the generated tower group.</p>
            </div>
            <div className="bg-[#ececea] p-6 min-h-[190px] flex flex-col">
              <div className="font-mono text-xs text-[#7c828c] tracking-widest">/ 02</div>
              <h4 className="font-display font-bold text-lg mt-auto text-[#16181d]">HDRI Lighting</h4>
              <p className="mt-2 text-xs text-[#7c828c] leading-relaxed">Use an environment map for true reflections.</p>
            </div>
            <div className="bg-[#ececea] p-6 min-h-[190px] flex flex-col">
              <div className="font-mono text-xs text-[#7c828c] tracking-widest">/ 03</div>
              <h4 className="font-display font-bold text-lg mt-auto text-[#16181d]">Lenis Scroll</h4>
              <p className="mt-2 text-xs text-[#7c828c] leading-relaxed">Add inertia scrolling for the full premium feel.</p>
            </div>
            <div className="bg-[#ececea] p-6 min-h-[190px] flex flex-col">
              <div className="font-mono text-xs text-[#7c828c] tracking-widest">/ 04</div>
              <h4 className="font-display font-bold text-lg mt-auto text-[#16181d]">Transitions</h4>
              <p className="mt-2 text-xs text-[#7c828c] leading-relaxed">The wipe pattern scales to real multi-page routing.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
