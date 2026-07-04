import React, { useState } from 'react';
import { ContactView } from './components/ContactView';
import { HomeView } from './components/HomeView';
import { Navbar } from './components/Navbar';
import { PageTransitionWipe } from './components/PageTransitionWipe';
import { SystemsLabView } from './components/SystemsLabView';
import { ThreeBackground } from './components/ThreeBackground';
import { SceneConfig, ViewMode } from './types';

const defaultSceneConfig: SceneConfig = {
  plates: 120,
  twistAngle: 9.2,
  gap: 0.14,
  waveAmplitude: 0.32,
  waveFrequency: 0.04,
  color: '#ffffff',
  roughness: 0.92,
  metalness: 0.0,
  wireframe: false,
  speed: 0.8,
  preset: 'tower',
  tiltIntensity: 0.0,
  autoRotate: true,
};

export default function App() {
  const [currentView, setCurrentView] = useState<ViewMode>('home');
  const [isWiping, setIsWiping] = useState(false);
  const [wipeStatus, setWipeStatus] = useState('Establishing link');
  const [sceneConfig, setSceneConfig] = useState<SceneConfig>(defaultSceneConfig);

  const handleSelectView = (newView: ViewMode) => {
    if (newView === currentView || isWiping) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) {
      setCurrentView(newView);
      window.scrollTo({ top: 0 });
      return;
    }

    setWipeStatus(
      newView === 'tech'
        ? 'Loading Systems Lab Core'
        : newView === 'contact'
        ? 'Opening Uplink Channel'
        : 'Aligning Vector Tower'
    );
    setIsWiping(true);

    setTimeout(() => {
      setCurrentView(newView);
      window.scrollTo({ top: 0 });
      setTimeout(() => {
        setIsWiping(false);
      }, 300);
    }, 450);
  };

  const handleChangeConfig = (partial: Partial<SceneConfig>) => {
    setSceneConfig((prev) => ({ ...prev, ...partial }));
  };

  const handleResetConfig = () => {
    setSceneConfig(defaultSceneConfig);
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-[#16181d] selection:bg-[#16181d] selection:text-white relative overflow-x-hidden">
      {/* 3D WebGL Background Canvas */}
      <ThreeBackground config={sceneConfig} currentView={currentView} />

      {/* Persistent Editorial Nav */}
      <Navbar
        currentView={currentView}
        onSelectView={handleSelectView}
        autoRotate={sceneConfig.autoRotate}
        onToggleRotate={() =>
          handleChangeConfig({ autoRotate: !sceneConfig.autoRotate })
        }
      />

      {/* Active View Container */}
      <main className="w-full">
        {currentView === 'home' && (
          <HomeView
            onOpenLab={() => handleSelectView('tech')}
            onOpenContact={() => handleSelectView('contact')}
            platesCount={sceneConfig.plates}
          />
        )}

        {currentView === 'tech' && (
          <SystemsLabView
            config={sceneConfig}
            onChangeConfig={handleChangeConfig}
            onResetConfig={handleResetConfig}
          />
        )}

        {currentView === 'contact' && <ContactView />}
      </main>

      {/* Fullscreen Page Routing Transition Wipe */}
      <PageTransitionWipe isWiping={isWiping} statusText={wipeStatus} />
    </div>
  );
}
