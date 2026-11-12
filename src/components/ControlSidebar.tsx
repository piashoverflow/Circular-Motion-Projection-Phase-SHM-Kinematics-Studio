import React from 'react';
import {
  Play,
  Pause,
  StepForward,
  Gauge,
  Compass,
  SlidersHorizontal,
  Layers,
  Hand,
} from 'lucide-react';
import { ProjectionAxis, SimulationState } from '../types/simulation';
import { TranslationDict } from '../i18n/translations';
import { ProgressiveSlider } from './ProgressiveSlider';
import { wrapDegrees } from '../utils/physics';

interface ControlSidebarProps {
  state: SimulationState;
  t: TranslationDict;
  onUpdate: (patch: Partial<SimulationState>) => void;
  onStep15: () => void;
  onSetPhasePreset: (deg: number) => void;
  onJumpToAngle: (targetThetaDeg: number) => void;
}

export const ControlSidebar: React.FC<ControlSidebarProps> = ({
  state,
  t,
  onUpdate,
  onStep15,
  onSetPhasePreset,
  onJumpToAngle,
}) => {
  const { activeModule } = state;

  const axisOptions: { id: ProjectionAxis; label: string }[] = [
    { id: 'y', label: t.controls.axisVertical },
    { id: 'x', label: t.controls.axisHorizontal },
    { id: 'dual', label: t.controls.axisDual },
  ];

  const phasePresets = [
    { deg: 0, label: t.controls.presetEquilibrium },
    { deg: 90, label: t.controls.presetPosExtreme },
    { deg: 180, label: t.controls.presetNegEquilibrium },
    { deg: 270, label: t.controls.presetNegExtreme },
  ];

  return (
    <aside className="w-full lg:w-[340px] shrink-0 flex flex-col gap-3">
      {/* Main Parameter Card */}
      <div className="bg-white/95 backdrop-blur-sm border border-sky-200 rounded-2xl shadow-sm p-4 space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-sky-100">
          <SlidersHorizontal className="w-4 h-4 text-sky-700 shrink-0" />
          <h2 className="text-sm font-bold text-slate-950">{t.controls.parametersHeading}</h2>
        </div>

        {/* Module 1: Projection Axis Switcher & Spring Overlay */}
        {activeModule === 1 && (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <span className="block text-[13px] font-semibold text-slate-900">
                {t.controls.projectionAxis}
              </span>
              <div className="grid grid-cols-1 gap-1.5">
                {axisOptions.map((opt) => {
                  const active = state.projectionAxis === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => onUpdate({ projectionAxis: opt.id })}
                      className={`w-full text-left px-3 py-2 rounded-xl text-[13px] font-semibold border transition-all cursor-pointer flex items-center justify-between ${
                        active
                          ? 'bg-sky-600 text-white border-sky-700 shadow-xs'
                          : 'bg-sky-50/60 text-slate-800 border-sky-200 hover:bg-sky-100/80'
                      }`}
                    >
                      <span>{opt.label}</span>
                      <span
                        className={`font-mono-tabular text-[11px] px-1.5 py-0.5 rounded ${
                          active ? 'bg-sky-700 text-sky-50' : 'bg-white text-slate-600 border border-sky-200'
                        }`}
                      >
                        {opt.id === 'y' ? 'A sinθ' : opt.id === 'x' ? 'A cosθ' : 'X & Y'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {state.projectionAxis !== 'dual' && (
              <label className="flex items-start gap-2.5 p-2.5 rounded-xl bg-sky-50/70 border border-sky-200 cursor-pointer hover:bg-sky-100/60 transition-colors">
                <input
                  type="checkbox"
                  checked={state.showSpringOverlay}
                  onChange={(e) => onUpdate({ showSpringOverlay: e.target.checked })}
                  className="mt-0.5 w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                />
                <span className="flex flex-col">
                  <span className="text-[13px] font-semibold text-slate-900">
                    {t.controls.springOverlay}
                  </span>
                  <span className="text-[11px] text-slate-600 leading-snug">
                    {t.controls.springOverlayDesc}
                  </span>
                </span>
              </label>
            )}
          </div>
        )}

        {/* Core Parameters: Amplitude & Angular Velocity */}
        <div className="space-y-3.5">
          <ProgressiveSlider
            id="slider-amplitude"
            label={t.controls.amplitude}
            value={state.amplitude}
            min={0.5}
            max={3.0}
            step={0.1}
            unit={t.units.meter}
            displayValue={state.amplitude.toFixed(1)}
            minLabel="0.5 m"
            maxLabel="3.0 m"
            onChange={(val) => onUpdate({ amplitude: val })}
          />

          <ProgressiveSlider
            id="slider-omega"
            label={t.controls.angularVelocity}
            value={state.omega}
            min={0.5}
            max={6.0}
            step={0.1}
            unit={t.units.radPerSec}
            displayValue={state.omega.toFixed(1)}
            minLabel="0.5 rad/s"
            maxLabel="6.0 rad/s"
            onChange={(val) => onUpdate({ omega: val })}
          />

          {/* Initial Phase δ slider (prominent in Module 2, also accessible in 1 & 3) */}
          <ProgressiveSlider
            id="slider-delta"
            label={t.controls.initialPhase}
            value={state.deltaDeg}
            min={0}
            max={360}
            step={1}
            unit="°"
            displayValue={`${Math.round(state.deltaDeg)}`}
            minLabel="0°"
            maxLabel="360°"
            onChange={(val) => onUpdate({ deltaDeg: val })}
          />
        </div>

        {/* Module 2: Phase Presets & Dual-Particle Comparator */}
        {activeModule === 2 && (
          <div className="space-y-3 pt-2 border-t border-sky-100">
            <div className="space-y-1.5">
              <span className="block text-xs font-bold text-slate-800">
                {t.controls.phasePresets}
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {phasePresets.map((p) => {
                  const active = Math.round(state.deltaDeg) === p.deg;
                  return (
                    <button
                      key={p.deg}
                      type="button"
                      onClick={() => onSetPhasePreset(p.deg)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer text-left truncate ${
                        active
                          ? 'bg-emerald-600 text-white border-emerald-700'
                          : 'bg-emerald-50/70 text-emerald-950 border-emerald-200 hover:bg-emerald-100'
                      }`}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-2 border-t border-sky-100 space-y-2.5">
              <label className="flex items-start gap-2.5 p-2.5 rounded-xl bg-amber-50/60 border border-amber-200 cursor-pointer hover:bg-amber-50 transition-colors">
                <input
                  type="checkbox"
                  checked={state.showSecondParticle}
                  onChange={(e) => onUpdate({ showSecondParticle: e.target.checked })}
                  className="mt-0.5 w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                />
                <span className="flex flex-col">
                  <span className="text-[13px] font-semibold text-slate-900">
                    {t.controls.secondParticle}
                  </span>
                  <span className="text-[11px] text-slate-600 leading-snug">
                    {t.controls.secondParticleDesc}
                  </span>
                </span>
              </label>

              {state.showSecondParticle && (
                <div className="space-y-2.5 p-2.5 rounded-xl bg-slate-50 border border-sky-200">
                  <ProgressiveSlider
                    id="slider-delta2"
                    label={t.controls.phaseTwo}
                    value={state.delta2Deg}
                    min={0}
                    max={360}
                    step={1}
                    unit="°"
                    displayValue={`${Math.round(state.delta2Deg)}`}
                    onChange={(val) => onUpdate({ delta2Deg: val })}
                  />

                  <div className="space-y-1">
                    <span className="block text-[11px] font-semibold text-slate-600">
                      {t.controls.phaseDiffPresets}
                    </span>
                    <div className="grid grid-cols-3 gap-1">
                      {[
                        { offset: 0, label: t.controls.inPhase },
                        { offset: 90, label: t.controls.quadrature },
                        { offset: 180, label: t.controls.outOfPhase },
                      ].map((preset) => (
                        <button
                          key={preset.offset}
                          type="button"
                          onClick={() =>
                            onUpdate({ delta2Deg: wrapDegrees(state.deltaDeg + preset.offset) })
                          }
                          className="px-1.5 py-1 rounded-lg bg-white border border-sky-200 hover:border-emerald-400 hover:bg-emerald-50 text-[11px] font-semibold text-slate-800 transition-colors cursor-pointer truncate"
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Module 3: Vector Layers & Landmark Jumps */}
        {activeModule === 3 && (
          <div className="space-y-3 pt-2 border-t border-sky-100">
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-sky-700" />
                <span className="text-xs font-bold text-slate-800">{t.controls.vectorLayers}</span>
              </div>
              <div className="space-y-1.5">
                {[
                  {
                    key: 'showDisplacementVector' as const,
                    label: t.controls.displacementVec,
                    colorClass: 'bg-sky-600',
                    checked: state.showDisplacementVector,
                  },
                  {
                    key: 'showVelocityVector' as const,
                    label: t.controls.velocityVec,
                    colorClass: 'bg-emerald-600',
                    checked: state.showVelocityVector,
                  },
                  {
                    key: 'showAccelerationVector' as const,
                    label: t.controls.accelerationVec,
                    colorClass: 'bg-rose-600',
                    checked: state.showAccelerationVector,
                  },
                  {
                    key: 'showPhasorVectors' as const,
                    label: t.controls.circlePhasors,
                    colorClass: 'bg-slate-700',
                    checked: state.showPhasorVectors,
                  },
                ].map((item) => (
                  <label
                    key={item.key}
                    className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-sky-50/50 border border-sky-100 cursor-pointer hover:bg-sky-50"
                  >
                    <span className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                      <span className={`w-2.5 h-2.5 rounded-xs ${item.colorClass}`} />
                      {item.label}
                    </span>
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={(e) => onUpdate({ [item.key]: e.target.checked })}
                      className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                    />
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="block text-xs font-bold text-slate-800">{t.controls.quickInspect}</span>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => onJumpToAngle(0)}
                  className="px-2.5 py-1.5 rounded-lg bg-sky-50 border border-sky-200 hover:bg-sky-100 text-xs font-semibold text-sky-900 cursor-pointer transition-colors"
                >
                  {t.controls.jumpEquilibrium}
                </button>
                <button
                  type="button"
                  onClick={() => onJumpToAngle(90)}
                  className="px-2.5 py-1.5 rounded-lg bg-rose-50 border border-rose-200 hover:bg-rose-100 text-xs font-semibold text-rose-900 cursor-pointer transition-colors"
                >
                  {t.controls.jumpPosExtreme}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Playback Controls Card */}
      <div className="bg-white/95 backdrop-blur-sm border border-sky-200 rounded-2xl shadow-sm p-4 space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-sky-100">
          <Compass className="w-4 h-4 text-emerald-700 shrink-0" />
          <h2 className="text-sm font-bold text-slate-950">{t.controls.playbackHeading}</h2>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onUpdate({ isPlaying: !state.isPlaying })}
            className={`inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-[13px] font-bold transition-colors cursor-pointer ${
              state.isPlaying
                ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-xs'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
            }`}
          >
            {state.isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{state.isPlaying ? t.controls.pause : t.controls.play}</span>
          </button>

          <button
            type="button"
            onClick={onStep15}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-[13px] font-bold bg-sky-50 hover:bg-sky-100 text-sky-900 border border-sky-200 transition-colors cursor-pointer"
          >
            <StepForward className="w-4 h-4 text-sky-700" />
            <span>{t.controls.step15}</span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => onUpdate({ slowMotion: !state.slowMotion })}
          className={`w-full inline-flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
            state.slowMotion
              ? 'bg-emerald-50 border-emerald-400 text-emerald-900'
              : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
          }`}
        >
          <span className="inline-flex items-center gap-2">
            <Gauge className="w-4 h-4 text-emerald-700" />
            <span>{t.controls.slowMotion}</span>
          </span>
          <span
            className={`font-mono-tabular px-2 py-0.5 rounded-md text-[11px] font-bold ${
              state.slowMotion ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
            }`}
          >
            {state.slowMotion ? '0.25×' : '1.0×'}
          </span>
        </button>

        <div className="flex items-start gap-2 pt-1 text-[11.5px] text-slate-600 leading-relaxed">
          <Hand className="w-3.5 h-3.5 text-sky-600 shrink-0 mt-0.5" />
          <span>{t.controls.dragHint}</span>
        </div>
      </div>
    </aside>
  );
};
