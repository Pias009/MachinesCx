export type ViewMode = 'home' | 'tech' | 'contact';

export type PresetGeometry = 'tower' | 'helix' | 'monolith' | 'lattice';

export interface SceneConfig {
  plates: number;
  twistAngle: number; // degrees per plate
  gap: number;
  waveAmplitude: number;
  waveFrequency: number;
  color: string;
  roughness: number;
  metalness: number;
  wireframe: boolean;
  speed: number;
  preset: PresetGeometry;
  tiltIntensity: number;
  autoRotate: boolean;
  uploadedModelUrl?: string;
  uploadedModelName?: string;
}

export interface SpecItem {
  key: string;
  value: string;
  unit?: string;
  description: string;
}

export interface SystemCard {
  id: string;
  idx: string;
  title: string;
  description: string;
  tag: string;
}
