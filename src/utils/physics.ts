import { KinematicSnapshot, ProjectionAxis, ModuleId } from '../types/simulation';

export function wrapDegrees(deg: number): number {
  const m = deg % 360;
  return m < 0 ? m + 360 : m;
}

export function wrapRadians(rad: number): number {
  const twoPi = Math.PI * 2;
  const m = rad % twoPi;
  return m < 0 ? m + twoPi : m;
}

export function computeKinematics(
  amplitude: number,
  omega: number,
  deltaDeg: number,
  simTime: number,
  activeModule: ModuleId,
  projectionAxis: ProjectionAxis
): KinematicSnapshot {
  const deltaRad = (deltaDeg * Math.PI) / 180;
  const thetaRad = omega * simTime + deltaRad;
  const thetaDegWrapped = wrapDegrees((thetaRad * 180) / Math.PI);

  const cosT = Math.cos(thetaRad);
  const sinT = Math.sin(thetaRad);

  const x = amplitude * cosT;
  const y = amplitude * sinT;

  const vx = -omega * amplitude * sinT;
  const vy = omega * amplitude * cosT;

  const ax = -omega * omega * x;
  const ay = -omega * omega * y;

  // Module 1 uses X when 'x' is selected; Module 2 & 3 always project vertical displacement labeled x(t) = A sin(ωt + δ)
  const useHorizontal = activeModule === 1 && projectionAxis === 'x';
  const activeDisp = useHorizontal ? x : y;
  const activeVel = useHorizontal ? vx : vy;
  const activeAcc = useHorizontal ? ax : ay;

  const vMax = omega * amplitude;
  const aMax = omega * omega * amplitude;
  const period = (2 * Math.PI) / omega;
  const frequency = 1 / period;

  // Landmark detection within ~5.5 degrees of equilibrium or turning point
  const ratio = activeDisp / amplitude;
  let landmark: KinematicSnapshot['landmark'] = null;
  if (Math.abs(ratio) < 0.095) {
    landmark = 'equilibrium';
  } else if (ratio > 0.995) {
    landmark = 'positiveExtreme';
  } else if (ratio < -0.995) {
    landmark = 'negativeExtreme';
  }

  return {
    thetaRad,
    thetaDegWrapped,
    x,
    y,
    activeDisp,
    vx,
    vy,
    activeVel,
    ax,
    ay,
    activeAcc,
    vMax,
    aMax,
    period,
    frequency,
    landmark,
  };
}

export function shortestPhaseDiffDeg(d1: number, d2: number): number {
  const diff = Math.abs(wrapDegrees(d2) - wrapDegrees(d1));
  return diff > 180 ? 360 - diff : diff;
}

export function formatSigned(val: number, decimals = 2): string {
  const fixed = Math.abs(val) < Math.pow(10, -decimals - 1) ? 0 : val;
  const str = fixed.toFixed(decimals);
  return fixed > 0 ? `+${str}` : str;
}
