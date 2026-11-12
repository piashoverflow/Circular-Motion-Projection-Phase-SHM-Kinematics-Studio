import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ModuleId, SimulationState } from './types/simulation';
import { TRANSLATIONS } from './i18n/translations';
import { computeKinematics, wrapDegrees } from './utils/physics';
import { TopNav } from './components/TopNav';
import { ControlSidebar } from './components/ControlSidebar';
import { SimulationCanvas } from './components/SimulationCanvas';
import { TelemetryPanel } from './components/TelemetryPanel';

const INITIAL_STATE: SimulationState = {
  activeModule: 1,
  language: 'bn',
  amplitude: 2.0,
  omega: 2.0,
  deltaDeg: 0,
  projectionAxis: 'y',
  showSpringOverlay: true,
  showSecondParticle: true,
  delta2Deg: 90,
  showDisplacementVector: true,
  showVelocityVector: true,
  showAccelerationVector: true,
  showPhasorVectors: true,
  isPlaying: true,
  slowMotion: false,
  simTime: 0,
};

export default function App() {
  const [state, setState] = useState<SimulationState>(INITIAL_STATE);
  const lastFrameRef = useRef<number | null>(null);

  const t = TRANSLATIONS[state.language];

  // Keep <html lang="..."> synced for screen readers & typography
  useEffect(() => {
    document.documentElement.lang = state.language;
  }, [state.language]);

  // 60 FPS requestAnimationFrame simulation loop
  useEffect(() => {
    if (!state.isPlaying) {
      lastFrameRef.current = null;
      return;
    }

    let rafId = 0;
    const tick = (now: number) => {
      if (lastFrameRef.current !== null) {
        const dtRaw = (now - lastFrameRef.current) / 1000;
        const dt = Math.min(dtRaw, 0.05) * (state.slowMotion ? 0.25 : 1.0);
        setState((prev) => ({
          ...prev,
          simTime: prev.simTime + dt,
        }));
      }
      lastFrameRef.current = now;
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(rafId);
      lastFrameRef.current = null;
    };
  }, [state.isPlaying, state.slowMotion]);

  const kinematics = useMemo(
    () =>
      computeKinematics(
        state.amplitude,
        state.omega,
        state.deltaDeg,
        state.simTime,
        state.activeModule,
        state.projectionAxis
      ),
    [
      state.amplitude,
      state.omega,
      state.deltaDeg,
      state.simTime,
      state.activeModule,
      state.projectionAxis,
    ]
  );

  const handleUpdate = useCallback((patch: Partial<SimulationState>) => {
    setState((prev) => ({ ...prev, ...patch }));
  }, []);

  const handleSelectModule = useCallback((mod: ModuleId) => {
    setState((prev) => ({
      ...prev,
      activeModule: mod,
    }));
  }, []);

  const handleToggleLanguage = useCallback(() => {
    setState((prev) => ({
      ...prev,
      language: prev.language === 'bn' ? 'en' : 'bn',
    }));
  }, []);

  const handleReset = useCallback(() => {
    setState((prev) => ({
      ...INITIAL_STATE,
      activeModule: prev.activeModule,
      language: prev.language,
    }));
  }, []);

  const handleStep15 = useCallback(() => {
    setState((prev) => {
      const stepRad = (15 * Math.PI) / 180;
      return {
        ...prev,
        isPlaying: false,
        simTime: prev.simTime + stepRad / prev.omega,
      };
    });
  }, []);

  const handleSetPhasePreset = useCallback((deg: number) => {
    setState((prev) => ({
      ...prev,
      deltaDeg: deg,
      simTime: 0,
    }));
  }, []);

  const handleJumpToAngle = useCallback((targetThetaDeg: number) => {
    setState((prev) => {
      const targetRad = (targetThetaDeg * Math.PI) / 180;
      const deltaRad = (prev.deltaDeg * Math.PI) / 180;
      let diffRad = (targetRad - deltaRad) % (Math.PI * 2);
      if (diffRad < 0) diffRad += Math.PI * 2;
      return {
        ...prev,
        isPlaying: false,
        simTime: diffRad / prev.omega,
      };
    });
  }, []);

  const handleDragParticle = useCallback((newAngleDeg: number, particleIndex: 1 | 2) => {
    setState((prev) => {
      if (particleIndex === 2) {
        const omegaDegT = ((prev.omega * prev.simTime) * 180) / Math.PI;
        return {
          ...prev,
          isPlaying: false,
          delta2Deg: Math.round(wrapDegrees(newAngleDeg - omegaDegT)),
        };
      }

      if (prev.activeModule === 2 && prev.simTime === 0) {
        return {
          ...prev,
          isPlaying: false,
          deltaDeg: Math.round(wrapDegrees(newAngleDeg)),
        };
      }

      const targetRad = (newAngleDeg * Math.PI) / 180;
      const deltaRad = (prev.deltaDeg * Math.PI) / 180;
      let diffRad = (targetRad - deltaRad) % (Math.PI * 2);
      if (diffRad < 0) diffRad += Math.PI * 2;

      return {
        ...prev,
        isPlaying: false,
        simTime: diffRad / prev.omega,
      };
    });
  }, []);

  return (
    <div className="min-h-screen bg-sky-50 text-slate-950 flex flex-col">
      <TopNav
        activeModule={state.activeModule}
        language={state.language}
        t={t}
        onSelectModule={handleSelectModule}
        onToggleLanguage={handleToggleLanguage}
        onReset={handleReset}
      />

      <main className="flex-1 w-full max-w-[1680px] mx-auto px-4 lg:px-6 py-2.5 flex flex-col lg:flex-row items-start gap-4">
        <ControlSidebar
          state={state}
          t={t}
          onUpdate={handleUpdate}
          onStep15={handleStep15}
          onSetPhasePreset={handleSetPhasePreset}
          onJumpToAngle={handleJumpToAngle}
        />

        <SimulationCanvas
          state={state}
          kinematics={kinematics}
          t={t}
          onDragParticle={handleDragParticle}
        />

        <TelemetryPanel state={state} kinematics={kinematics} t={t} />
      </main>
    </div>
  );
}
