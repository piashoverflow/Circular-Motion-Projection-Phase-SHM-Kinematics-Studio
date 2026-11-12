import React from 'react';
import { Calculator, Activity, GitCompareArrows, Info } from 'lucide-react';
import { KinematicSnapshot, SimulationState } from '../types/simulation';
import { TranslationDict } from '../i18n/translations';
import { formatSigned, shortestPhaseDiffDeg, wrapRadians } from '../utils/physics';

interface TelemetryPanelProps {
  state: SimulationState;
  kinematics: KinematicSnapshot;
  t: TranslationDict;
}

export const TelemetryPanel: React.FC<TelemetryPanelProps> = ({ state, kinematics, t }) => {
  const { activeModule, amplitude, omega, deltaDeg, delta2Deg, projectionAxis, showSecondParticle } = state;

  const deltaRad = (deltaDeg * Math.PI) / 180;
  const totalPhaseRad = kinematics.thetaRad;
  const totalPhaseWrappedRad = wrapRadians(totalPhaseRad);
  const totalPhaseDeg = kinematics.thetaDegWrapped;

  const varSymbol = activeModule === 1 && projectionAxis === 'x' ? 'x' : activeModule === 1 ? 'y' : 'x';
  const trigFn = activeModule === 1 && projectionAxis === 'x' ? 'cos' : 'sin';

  // Simplified trig form for Module 2
  const getSimplifiedForm = () => {
    const d = Math.round(deltaDeg) % 360;
    const A = amplitude.toFixed(1);
    const w = omega.toFixed(1);
    if (d === 0 || d === 360) {
      return `x(t) = ${A} sin(${w}t)`;
    }
    if (d === 90) {
      return `x(t) = ${A} cos(${w}t)  [sin(θ + 90°) = cos θ]`;
    }
    if (d === 180) {
      return `x(t) = -${A} sin(${w}t)`;
    }
    if (d === 270) {
      return `x(t) = -${A} cos(${w}t)`;
    }
    return `x(t) = ${A} sin(${w}t + ${deltaRad.toFixed(2)} rad)`;
  };

  // Phase difference classification for Module 2
  const diffDeg = shortestPhaseDiffDeg(deltaDeg, delta2Deg);
  const diffRad = (diffDeg * Math.PI) / 180;
  const getPhaseDiffStatus = () => {
    if (diffDeg < 1.5) return t.telemetry.inPhaseStatus;
    if (Math.abs(diffDeg - 90) < 1.5) return t.telemetry.quadratureStatus;
    if (Math.abs(diffDeg - 180) < 1.5) return t.telemetry.outOfPhaseStatus;
    return t.telemetry.generalDiffStatus;
  };

  // Landmark status badge (dual-coded: text + color)
  const landmarkStatusText =
    kinematics.landmark === 'equilibrium'
      ? t.telemetry.atEquilibrium
      : kinematics.landmark === 'positiveExtreme' || kinematics.landmark === 'negativeExtreme'
      ? t.telemetry.atExtreme
      : t.telemetry.inMotion;

  const landmarkBadgeStyle =
    kinematics.landmark === 'equilibrium'
      ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
      : kinematics.landmark === 'positiveExtreme' || kinematics.landmark === 'negativeExtreme'
      ? 'bg-rose-50 border-rose-300 text-rose-800'
      : 'bg-sky-50 border-sky-200 text-sky-900';

  const vRatioPct = kinematics.vMax > 0 ? Math.min(100, (Math.abs(kinematics.activeVel) / kinematics.vMax) * 100) : 0;
  const aRatioPct = kinematics.aMax > 0 ? Math.min(100, (Math.abs(kinematics.activeAcc) / kinematics.aMax) * 100) : 0;
  const xRatioPct = amplitude > 0 ? Math.min(100, (Math.abs(kinematics.activeDisp) / amplitude) * 100) : 0;

  return (
    <aside className="w-full lg:w-[330px] shrink-0 flex flex-col gap-3">
      {/* Live Equation Solver Card */}
      <div className="bg-white/95 backdrop-blur-sm border border-sky-200 rounded-2xl shadow-sm p-4 space-y-3">
        <div className="flex items-center justify-between gap-2 pb-2 border-b border-sky-100">
          <div className="flex items-center gap-2">
            <Calculator className="w-4 h-4 text-sky-700 shrink-0" />
            <h2 className="text-sm font-bold text-slate-950">{t.telemetry.liveEquations}</h2>
          </div>
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${landmarkBadgeStyle}`}>
            {landmarkStatusText}
          </span>
        </div>

        {/* Module 1 Equations */}
        {activeModule === 1 && (
          <div className="space-y-2.5">
            {projectionAxis === 'dual' ? (
              <div className="space-y-2">
                <div className="p-2.5 rounded-xl bg-sky-50/80 border border-sky-200 font-mono-tabular text-xs space-y-1">
                  <div className="text-sky-900 font-semibold">
                    x(t) = {amplitude.toFixed(1)} cos({omega.toFixed(1)}t + {Math.round(deltaDeg)}°)
                  </div>
                  <div className="text-slate-800">
                    x = <span className="font-bold text-sky-700">{formatSigned(kinematics.x)} m</span>
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200 font-mono-tabular text-xs space-y-1">
                  <div className="text-emerald-900 font-semibold">
                    y(t) = {amplitude.toFixed(1)} sin({omega.toFixed(1)}t + {Math.round(deltaDeg)}°)
                  </div>
                  <div className="text-slate-800">
                    y = <span className="font-bold text-emerald-700">{formatSigned(kinematics.y)} m</span>
                  </div>
                </div>
                <div className="text-[11.5px] font-mono-tabular text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5">
                  x² + y² = {(kinematics.x ** 2 + kinematics.y ** 2).toFixed(2)} = A² ({(amplitude ** 2).toFixed(2)} m²)
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-sky-50/80 border border-sky-200 space-y-1.5">
                <div className="font-mono-tabular text-xs text-slate-600">
                  {varSymbol}(t) = A {trigFn}(ωt + δ)
                </div>
                <div className="font-mono-tabular text-[13px] font-bold text-sky-950">
                  {varSymbol}(t) = {amplitude.toFixed(1)} {trigFn}({omega.toFixed(1)}×{state.simTime.toFixed(2)} + {Math.round(deltaDeg)}°)
                </div>
                <div className="font-mono-tabular text-sm font-extrabold text-sky-700 pt-1 border-t border-sky-200/70">
                  {varSymbol} = {formatSigned(kinematics.activeDisp)} {t.units.meter}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Module 2 Equations */}
        {activeModule === 2 && (
          <div className="space-y-2.5">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="text-[11px] font-semibold text-slate-600">{t.telemetry.diffEqLabel}</div>
              <div className="font-mono-tabular text-xs font-bold text-slate-900">
                d²x/dt² + ({omega.toFixed(1)})²x = 0  ⟹  a = -{(omega * omega).toFixed(2)}x
              </div>
            </div>

            <div className="p-3 rounded-xl bg-sky-50/80 border border-sky-200 space-y-1.5">
              <div className="text-[11px] font-semibold text-sky-900">{t.telemetry.generalSolution}</div>
              <div className="font-mono-tabular text-[12.5px] font-bold text-slate-950">
                x(t) = {amplitude.toFixed(1)} sin({omega.toFixed(1)}t + {Math.round(deltaDeg)}°)
              </div>
              <div className="font-mono-tabular text-sm font-extrabold text-sky-700">
                x({state.simTime.toFixed(2)}s) = {formatSigned(kinematics.activeDisp)} {t.units.meter}
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-200 space-y-1">
              <div className="text-[11px] font-semibold text-emerald-900">{t.telemetry.simplifiedForm}</div>
              <div className="font-mono-tabular text-xs font-bold text-emerald-950 break-words">
                {getSimplifiedForm()}
              </div>
            </div>

            {showSecondParticle && (
              <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200 space-y-1">
                <div className="text-[11px] font-semibold text-amber-900">{t.telemetry.phaseDifferenceLabel}</div>
                <div className="font-mono-tabular text-xs font-bold text-amber-950">
                  Δφ = {diffDeg.toFixed(0)}° ({diffRad.toFixed(2)} rad)
                </div>
                <div className="text-[11px] text-amber-900 font-medium">{getPhaseDiffStatus()}</div>
              </div>
            )}
          </div>
        )}

        {/* Module 3 Equations & Vector Comparisons */}
        {activeModule === 3 && (
          <div className="space-y-2">
            {/* Displacement */}
            <div className="p-2.5 rounded-xl bg-sky-50/80 border border-sky-200 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-sky-900">{t.telemetry.displacement}</span>
                <span className="font-mono-tabular font-extrabold text-sky-700">
                  {formatSigned(kinematics.activeDisp)} {t.units.meter}
                </span>
              </div>
              <div className="font-mono-tabular text-[11px] text-slate-700">
                x = A sin(θ) = {amplitude.toFixed(1)} sin({totalPhaseDeg.toFixed(1)}°)
              </div>
              <div className="h-1.5 w-full bg-sky-100 rounded-full overflow-hidden">
                <div className="h-full bg-sky-600 transition-all duration-75" style={{ width: `${xRatioPct}%` }} />
              </div>
            </div>

            {/* Velocity */}
            <div className="p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-200 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-emerald-900">{t.telemetry.velocity}</span>
                <span className="font-mono-tabular font-extrabold text-emerald-700">
                  {formatSigned(kinematics.activeVel)} {t.units.meterPerSec}
                </span>
              </div>
              <div className="font-mono-tabular text-[11px] text-slate-700">
                v = ±ω√(A² - x²) | v_max = {kinematics.vMax.toFixed(2)} m/s
              </div>
              <div className="h-1.5 w-full bg-emerald-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-600 transition-all duration-75" style={{ width: `${vRatioPct}%` }} />
              </div>
            </div>

            {/* Acceleration */}
            <div className="p-2.5 rounded-xl bg-rose-50/80 border border-rose-200 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-rose-900">{t.telemetry.acceleration}</span>
                <span className="font-mono-tabular font-extrabold text-rose-700">
                  {formatSigned(kinematics.activeAcc)} {t.units.meterPerSecSq}
                </span>
              </div>
              <div className="font-mono-tabular text-[11px] text-slate-700">
                a = -ω²x = -{(omega * omega).toFixed(2)} × ({formatSigned(kinematics.activeDisp)})
              </div>
              <div className="h-1.5 w-full bg-rose-100 rounded-full overflow-hidden">
                <div className="h-full bg-rose-600 transition-all duration-75" style={{ width: `${aRatioPct}%` }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Kinematic Telemetry Readouts */}
      <div className="bg-white/95 backdrop-blur-sm border border-sky-200 rounded-2xl shadow-sm p-4 space-y-2.5">
        <div className="flex items-center gap-2 pb-2 border-b border-sky-100">
          <Activity className="w-4 h-4 text-emerald-700 shrink-0" />
          <h2 className="text-sm font-bold text-slate-950">{t.telemetry.kinematicReadouts}</h2>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-[11px] text-slate-600 font-medium">{t.telemetry.timeElapsed}</div>
            <div className="font-mono-tabular text-sm font-bold text-slate-950 mt-0.5">
              {state.simTime.toFixed(2)} {t.units.sec}
            </div>
          </div>
          <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-[11px] text-slate-600 font-medium">{t.telemetry.periodAndFreq}</div>
            <div className="font-mono-tabular text-xs font-bold text-slate-950 mt-0.5">
              {kinematics.period.toFixed(2)}s · {kinematics.frequency.toFixed(2)}Hz
            </div>
          </div>
        </div>

        {/* Total Phase in Radians and Degrees */}
        <div className="p-2.5 rounded-xl bg-sky-50/70 border border-sky-200">
          <div className="text-[11px] font-semibold text-sky-900">{t.telemetry.totalPhase}</div>
          <div className="flex items-baseline justify-between mt-1 font-mono-tabular">
            <span className="text-sm font-extrabold text-slate-950">
              {totalPhaseDeg.toFixed(1)}°
            </span>
            <span className="text-xs font-bold text-sky-800">
              {totalPhaseWrappedRad.toFixed(2)} rad ({(totalPhaseWrappedRad / Math.PI).toFixed(2)}π)
            </span>
          </div>
        </div>

        {activeModule !== 3 && (
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 rounded-xl bg-emerald-50/60 border border-emerald-200">
              <div className="text-[11px] text-emerald-900 font-medium">{t.telemetry.velocity}</div>
              <div className="font-mono-tabular text-xs font-bold text-emerald-800 mt-0.5">
                {formatSigned(kinematics.activeVel)} {t.units.meterPerSec}
              </div>
            </div>
            <div className="p-2 rounded-xl bg-rose-50/60 border border-rose-200">
              <div className="text-[11px] text-rose-900 font-medium">{t.telemetry.acceleration}</div>
              <div className="font-mono-tabular text-xs font-bold text-rose-800 mt-0.5">
                {formatSigned(kinematics.activeAcc)} {t.units.meterPerSecSq}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Phase Relationship & Pedagogical Insight Card */}
      <div className="bg-white/95 backdrop-blur-sm border border-sky-200 rounded-2xl shadow-sm p-4 space-y-2.5">
        <div className="flex items-center gap-2 pb-1.5 border-b border-sky-100">
          {activeModule === 3 ? (
            <GitCompareArrows className="w-4 h-4 text-rose-600 shrink-0" />
          ) : (
            <Info className="w-4 h-4 text-sky-700 shrink-0" />
          )}
          <h2 className="text-sm font-bold text-slate-950">
            {activeModule === 3 ? t.telemetry.phaseSummary : t.telemetry.stateIndicator}
          </h2>
        </div>

        {activeModule === 3 ? (
          <ul className="space-y-1.5 text-xs text-slate-800 leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
              <span>{t.telemetry.leadVelDisp}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-600 mt-1.5 shrink-0" />
              <span>{t.telemetry.leadAccVel}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-2 h-2 rounded-full bg-sky-600 mt-1.5 shrink-0" />
              <span>{t.telemetry.leadAccDisp}</span>
            </li>
          </ul>
        ) : (
          <p className="text-xs text-slate-700 leading-relaxed">
            {activeModule === 1 ? t.telemetry.m1ProofNote : t.telemetry.m2ProofNote}
          </p>
        )}
      </div>
    </aside>
  );
};
