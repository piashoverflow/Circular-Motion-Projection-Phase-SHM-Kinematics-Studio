export type ModuleId = 1 | 2 | 3;

export type Language = 'bn' | 'en';

export type ProjectionAxis = 'y' | 'x' | 'dual';

export interface SimulationState {
  activeModule: ModuleId;
  language: Language;

  // Core SHM parameters
  amplitude: number; // A in meters (0.5 to 3.0)
  omega: number; // ω in rad/s (0.5 to 6.0)
  deltaDeg: number; // δ in degrees (0 to 360)

  // Module 1 options
  projectionAxis: ProjectionAxis;
  showSpringOverlay: boolean;

  // Module 2 options (Dual-Particle Phase Comparator)
  showSecondParticle: boolean;
  delta2Deg: number; // δ₂ in degrees (0 to 360)

  // Module 3 options (Vector Layers)
  showDisplacementVector: boolean;
  showVelocityVector: boolean;
  showAccelerationVector: boolean;
  showPhasorVectors: boolean;

  // Playback
  isPlaying: boolean;
  slowMotion: boolean;
  simTime: number; // t in seconds
}

export interface KinematicSnapshot {
  thetaRad: number;
  thetaDegWrapped: number;
  x: number; // horizontal projection A cos(θ)
  y: number; // vertical projection A sin(θ)
  activeDisp: number; // primary displacement along active axis
  vx: number; // -ω A sin(θ)
  vy: number; // ω A cos(θ)
  activeVel: number;
  ax: number; // -ω² A cos(θ)
  ay: number; // -ω² A sin(θ)
  activeAcc: number;
  vMax: number;
  aMax: number;
  period: number;
  frequency: number;
  landmark: 'equilibrium' | 'positiveExtreme' | 'negativeExtreme' | null;
}
