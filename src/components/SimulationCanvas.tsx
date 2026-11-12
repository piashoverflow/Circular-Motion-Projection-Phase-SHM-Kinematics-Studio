import React, { useEffect, useRef, useState } from 'react';
import { KinematicSnapshot, SimulationState } from '../types/simulation';
import { TranslationDict } from '../i18n/translations';
import { shortestPhaseDiffDeg, wrapDegrees } from '../utils/physics';

interface SimulationCanvasProps {
  state: SimulationState;
  kinematics: KinematicSnapshot;
  t: TranslationDict;
  onDragParticle: (newAngleDeg: number, particleIndex: 1 | 2) => void;
}

interface CircleLayout {
  cx: number;
  cy: number;
  maxRadiusPx: number;
  radiusPx: number;
  p1x: number;
  p1y: number;
  p2x?: number;
  p2y?: number;
}

function drawArrow(
  ctx: CanvasRenderingContext2D,
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  color: string,
  lineWidth = 2.5,
  headLen = 9
) {
  const dx = toX - fromX;
  const dy = toY - fromY;
  const len = Math.hypot(dx, dy);
  if (len < 3) return;

  const angle = Math.atan2(dy, dx);
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  ctx.beginPath();
  ctx.moveTo(fromX, fromY);
  ctx.lineTo(toX - Math.cos(angle) * (headLen * 0.55), toY - Math.sin(angle) * (headLen * 0.55));
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(toX, toY);
  ctx.lineTo(
    toX - headLen * Math.cos(angle - Math.PI / 6),
    toY - headLen * Math.sin(angle - Math.PI / 6)
  );
  ctx.lineTo(
    toX - headLen * Math.cos(angle + Math.PI / 6),
    toY - headLen * Math.sin(angle + Math.PI / 6)
  );
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawHelicalSpring(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  coils = 10,
  width = 14
) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy);
  if (len < 10) return;

  const ux = dx / len;
  const uy = dy / len;
  const nx = -uy;
  const ny = ux;

  const lead = 12;
  const bodyLen = Math.max(8, len - lead * 2);
  const step = bodyLen / (coils * 2);

  ctx.save();
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 2.2;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  ctx.beginPath();
  ctx.moveTo(x1, y1);
  const startX = x1 + ux * lead;
  const startY = y1 + uy * lead;
  ctx.lineTo(startX, startY);

  for (let i = 1; i <= coils * 2; i++) {
    const along = lead + i * step;
    const side = i === coils * 2 ? 0 : i % 2 === 1 ? width : -width;
    ctx.lineTo(x1 + ux * along + nx * side, y1 + uy * along + ny * side);
  }
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.restore();
}

function drawPillLabel(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  bg = 'rgba(255, 255, 255, 0.92)',
  border = '#bae6fd',
  color = '#0f172a',
  font = '600 12px "Hind Siliguri", "Plus Jakarta Sans", sans-serif',
  align: CanvasTextAlign = 'center'
) {
  ctx.save();
  ctx.font = font;
  const metrics = ctx.measureText(text);
  const padX = 8;
  const h = 22;
  const w = metrics.width + padX * 2;
  let rx = x - w / 2;
  if (align === 'left') rx = x;
  if (align === 'right') rx = x - w;
  const ry = y - h / 2;

  ctx.fillStyle = bg;
  ctx.strokeStyle = border;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(rx, ry, w, h, 6);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, rx + w / 2, y + 0.5);
  ctx.restore();
}

export const SimulationCanvas: React.FC<SimulationCanvasProps> = ({
  state,
  kinematics,
  t,
  onDragParticle,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sizeRef = useRef<{ width: number; height: number }>({ width: 760, height: 540 });
  const layoutRef = useRef<CircleLayout | null>(null);
  const draggingRef = useRef<{ active: boolean; particle: 1 | 2 }>({ active: false, particle: 1 });
  const [cursorMode, setCursorMode] = useState<'default' | 'grab' | 'grabbing'>('default');

  // Observe container dimensions for crisp Retina resizing
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateSize = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        sizeRef.current = { width: rect.width, height: rect.height };
      }
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Main render effect whenever state/kinematics update
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const { width, height } = sizeRef.current;
    const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.save();
    ctx.scale(dpr, dpr);

    // 1. Clean high-contrast sky-paper backdrop & subtle scientific grid
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    const gridStep = 28;
    ctx.lineWidth = 1;
    for (let gx = 0; gx < width; gx += gridStep) {
      ctx.strokeStyle = gx % (gridStep * 4) === 0 ? 'rgba(14, 165, 233, 0.10)' : 'rgba(14, 165, 233, 0.045)';
      ctx.beginPath();
      ctx.moveTo(gx, 0);
      ctx.lineTo(gx, height);
      ctx.stroke();
    }
    for (let gy = 0; gy < height; gy += gridStep) {
      ctx.strokeStyle = gy % (gridStep * 4) === 0 ? 'rgba(14, 165, 233, 0.10)' : 'rgba(14, 165, 233, 0.045)';
      ctx.beginPath();
      ctx.moveTo(0, gy);
      ctx.lineTo(width, gy);
      ctx.stroke();
    }

    const {
      activeModule,
      amplitude,
      omega,
      deltaDeg,
      delta2Deg,
      projectionAxis,
      showSpringOverlay,
      showSecondParticle,
      simTime,
    } = state;

    const theta1 = kinematics.thetaRad;
    const delta1Rad = (deltaDeg * Math.PI) / 180;
    const delta2Rad = (delta2Deg * Math.PI) / 180;
    const theta2 = omega * simTime + delta2Rad;

    // Determine Circle Geometry per module & mode (positioned comfortably high in the stage)
    let cx = width * 0.28;
    let maxRadiusPx = Math.min(width * 0.19, height * 0.30);
    let cy = Math.max(maxRadiusPx + 54, height * 0.42);

    if (activeModule === 1 && projectionAxis === 'x') {
      cx = width * 0.5;
      maxRadiusPx = Math.min(width * 0.24, height * 0.23);
      cy = Math.max(maxRadiusPx + 52, height * 0.31);
    } else if (activeModule === 1 && projectionAxis === 'dual') {
      cx = width * 0.27;
      maxRadiusPx = Math.min(width * 0.175, height * 0.25);
      cy = Math.max(maxRadiusPx + 52, height * 0.36);
    } else if (activeModule === 1 && projectionAxis === 'y') {
      cx = width * 0.30;
      maxRadiusPx = Math.min(width * 0.19, height * 0.29);
      cy = Math.max(maxRadiusPx + 60, height * 0.43);
    }

    const pxPerMeter = maxRadiusPx / 3.0;
    const R = amplitude * pxPerMeter;

    // Particle 1 coordinates on circle (screen Y is inverted)
    const p1x = cx + R * Math.cos(theta1);
    const p1y = cy - R * Math.sin(theta1);

    const p2x = cx + R * Math.cos(theta2);
    const p2y = cy - R * Math.sin(theta2);

    layoutRef.current = {
      cx,
      cy,
      maxRadiusPx,
      radiusPx: R,
      p1x,
      p1y,
      p2x: activeModule === 2 && showSecondParticle ? p2x : undefined,
      p2y: activeModule === 2 && showSecondParticle ? p2y : undefined,
    };

    // --- DRAW REFERENCE CIRCLE ---
    // Max 3.0m reference boundary ring
    ctx.save();
    ctx.setLineDash([4, 5]);
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.45)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(cx, cy, maxRadiusPx, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // Subtle interior fill of active circle
    ctx.fillStyle = 'rgba(224, 242, 254, 0.28)';
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.fill();

    // X & Y Axes through center O
    const axisPad = maxRadiusPx + 22;
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.moveTo(cx - axisPad, cy);
    ctx.lineTo(cx + axisPad, cy);
    ctx.moveTo(cx, cy - axisPad);
    ctx.lineTo(cx, cy + axisPad);
    ctx.stroke();

    // Active Circle Circumference
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.stroke();

    // Center O & axis labels
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(cx, cy, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.font = '600 11px "IBM Plex Mono", monospace';
    ctx.fillStyle = '#475569';
    ctx.fillText('O', cx - 14, cy + 14);
    ctx.fillText('+X', cx + axisPad - 12, cy - 8);
    ctx.fillText('+Y', cx + 8, cy - axisPad + 10);

    // Reference Circle Title
    drawPillLabel(
      ctx,
      activeModule === 3 ? t.canvas.phasorDiagram : t.canvas.referenceCircle,
      cx,
      20,
      'rgba(240, 249, 255, 0.96)',
      '#7dd3fc',
      '#0369a1'
    );

    // Module 2: Visual Phase Arc for Initial Phase δ1 & Phase Difference Δφ
    if (activeModule === 2) {
      // Shaded initial phase sector δ1 (from 0 to δ1)
      if (deltaDeg > 0.5) {
        ctx.save();
        ctx.fillStyle = 'rgba(14, 165, 233, 0.16)';
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, Math.min(R * 0.62, 56), 0, -delta1Rad, true);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = '#0284c7';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.arc(cx, cy, Math.min(R * 0.62, 56), 0, -delta1Rad, true);
        ctx.stroke();
        ctx.restore();
      }

      // t=0 Marker on circle for Particle 1
      const p10x = cx + R * Math.cos(delta1Rad);
      const p10y = cy - R * Math.sin(delta1Rad);
      ctx.save();
      ctx.setLineDash([3, 3]);
      ctx.strokeStyle = 'rgba(2, 132, 199, 0.45)';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(p10x, p10y);
      ctx.stroke();
      ctx.restore();
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(p10x, p10y, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.font = '600 10px "IBM Plex Mono", monospace';
      ctx.fillStyle = '#0369a1';
      ctx.fillText(`t=0 (δ=${Math.round(deltaDeg)}°)`, p10x + 8, p10y - 6);

      // Phase difference arc between P1 and P2
      if (showSecondParticle) {
        const diffDeg = shortestPhaseDiffDeg(deltaDeg, delta2Deg);
        if (diffDeg > 1) {
          const arcR = Math.min(R * 0.8, 72);
          // Determine shortest sweep direction
          const diffSigned = ((delta2Rad - delta1Rad + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
          const startAngle = -theta1;
          const endAngle = -(theta1 + diffSigned);
          const anticlockwise = diffSigned > 0;

          ctx.save();
          ctx.fillStyle = 'rgba(245, 158, 11, 0.22)';
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.arc(cx, cy, arcR, startAngle, endAngle, anticlockwise);
          ctx.closePath();
          ctx.fill();

          ctx.strokeStyle = '#d97706';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(cx, cy, arcR, startAngle, endAngle, anticlockwise);
          ctx.stroke();
          ctx.restore();

          const midAngle = theta1 + diffSigned / 2;
          const lblX = cx + (arcR + 18) * Math.cos(midAngle);
          const lblY = cy - (arcR + 18) * Math.sin(midAngle);
          ctx.font = '700 11px "IBM Plex Mono", monospace';
          ctx.fillStyle = '#b45309';
          ctx.textAlign = 'center';
          ctx.fillText(`Δφ=${diffDeg.toFixed(0)}°`, lblX, lblY);
          ctx.textAlign = 'left';
        }
      }
    } else {
      // Standard instantaneous phase arc θ = ωt + δ
      const arcR = Math.min(R * 0.42, 42);
      const wrappedRad = ((theta1 % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
      ctx.save();
      ctx.fillStyle = 'rgba(14, 165, 233, 0.14)';
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, arcR, 0, -wrappedRad, true);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(cx, cy, arcR, 0, -wrappedRad, true);
      ctx.stroke();
      ctx.restore();

      const midA = wrappedRad / 2;
      ctx.font = '700 11px "IBM Plex Mono", monospace';
      ctx.fillStyle = '#0369a1';
      ctx.fillText(
        `θ=${kinematics.thetaDegWrapped.toFixed(0)}°`,
        cx + (arcR + 12) * Math.cos(midA) - 6,
        cy - (arcR + 12) * Math.sin(midA) + 4
      );
    }

    // Rotating Radius Vector A
    drawArrow(ctx, cx, cy, p1x, p1y, '#0284c7', 2.6, 9);

    // =========================================================================
    // MODULE 1: ORTHOGONAL PROJECTION & SPRING-MASS SYSTEM
    // =========================================================================
    if (activeModule === 1) {
      if (projectionAxis === 'y') {
        const trackX = cx + maxRadiusPx + 74;
        const topY = cy - maxRadiusPx;
        const botY = cy + maxRadiusPx;

        drawPillLabel(ctx, t.canvas.projectionTrack, trackX, 20, '#f0fdf4', '#86efac', '#166534');

        // Track rail
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(trackX, topY - 12);
        ctx.lineTo(trackX, botY + 12);
        ctx.stroke();

        // Amplitude bounds +A, 0, -A
        const ampTopY = cy - R;
        const ampBotY = cy + R;
        [
          { y: ampTopY, lbl: '+A' },
          { y: cy, lbl: '0' },
          { y: ampBotY, lbl: '-A' },
        ].forEach((m) => {
          ctx.strokeStyle = '#64748b';
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.moveTo(trackX - 9, m.y);
          ctx.lineTo(trackX + 9, m.y);
          ctx.stroke();
          ctx.font = '600 11px "IBM Plex Mono", monospace';
          ctx.fillStyle = '#475569';
          ctx.fillText(m.lbl, trackX + 14, m.y + 4);
        });

        // Equilibrium dashed baseline
        ctx.save();
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = 'rgba(100, 116, 139, 0.35)';
        ctx.beginPath();
        ctx.moveTo(cx + R, cy);
        ctx.lineTo(trackX, cy);
        ctx.stroke();
        ctx.restore();

        // Dynamic perpendicular projection light-beam from P to P'
        ctx.save();
        ctx.setLineDash([6, 5]);
        ctx.strokeStyle = '#059669';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(p1x, p1y);
        ctx.lineTo(trackX, p1y);
        ctx.stroke();
        ctx.restore();

        // Displacement vector on track
        drawArrow(ctx, trackX, cy, trackX, p1y, '#0284c7', 3.2, 9);

        // Shadow particle P'
        ctx.fillStyle = 'rgba(5, 150, 105, 0.2)';
        ctx.beginPath();
        ctx.arc(trackX, p1y, 13, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#059669';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(trackX, p1y, 7.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.font = '700 12px "IBM Plex Mono", monospace';
        ctx.fillStyle = '#065f46';
        ctx.fillText("P'", trackX + 14, p1y - 10);

        // Optional Synchronized Mass-Spring Oscillator
        if (showSpringOverlay) {
          const springX = Math.min(width - 74, trackX + 130);
          const ceilingY = Math.max(46, cy - maxRadiusPx - 28);

          drawPillLabel(ctx, t.canvas.springOscillator, springX, 20, '#f8fafc', '#cbd5e1', '#334155');

          // Fixed ceiling bracket
          ctx.strokeStyle = '#334155';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(springX - 28, ceilingY);
          ctx.lineTo(springX + 28, ceilingY);
          ctx.stroke();

          // Equivalence beam from P' to mass block
          ctx.save();
          ctx.setLineDash([4, 4]);
          ctx.strokeStyle = 'rgba(2, 132, 199, 0.55)';
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          ctx.moveTo(trackX + 10, p1y);
          ctx.lineTo(springX - 22, p1y);
          ctx.stroke();
          ctx.restore();

          // Helical spring
          drawHelicalSpring(ctx, springX, ceilingY, springX, p1y - 18, 11, 12);

          // Mass block
          ctx.fillStyle = '#0284c7';
          ctx.strokeStyle = '#0c4a6e';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.roundRect(springX - 20, p1y - 18, 40, 36, 7);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = '#ffffff';
          ctx.font = '700 13px "IBM Plex Mono", monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('m', springX, p1y);
          ctx.textAlign = 'left';
          ctx.textBaseline = 'alphabetic';
        }
      } else if (projectionAxis === 'x') {
        const trackY = cy + maxRadiusPx + 42;
        const leftX = cx - maxRadiusPx;
        const rightX = cx + maxRadiusPx;

        drawPillLabel(ctx, t.canvas.projectionTrack, cx, trackY + 38, '#f0fdf4', '#86efac', '#166534');

        // Horizontal track rail
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(leftX - 16, trackY);
        ctx.lineTo(rightX + 16, trackY);
        ctx.stroke();

        // Bounds -A, 0, +A
        [
          { x: cx - R, lbl: '-A' },
          { x: cx, lbl: '0' },
          { x: cx + R, lbl: '+A' },
        ].forEach((m) => {
          ctx.strokeStyle = '#64748b';
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.moveTo(m.x, trackY - 9);
          ctx.lineTo(m.x, trackY + 9);
          ctx.stroke();
          ctx.font = '600 11px "IBM Plex Mono", monospace';
          ctx.fillStyle = '#475569';
          ctx.textAlign = 'center';
          ctx.fillText(m.lbl, m.x, trackY + 22);
        });
        ctx.textAlign = 'left';

        // Projection light beam from P down to P'_x
        ctx.save();
        ctx.setLineDash([6, 5]);
        ctx.strokeStyle = '#059669';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(p1x, p1y);
        ctx.lineTo(p1x, trackY);
        ctx.stroke();
        ctx.restore();

        // Displacement vector on X track
        drawArrow(ctx, cx, trackY, p1x, trackY, '#0284c7', 3.2, 9);

        // Shadow particle P'_x
        ctx.fillStyle = 'rgba(5, 150, 105, 0.2)';
        ctx.beginPath();
        ctx.arc(p1x, trackY, 13, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#059669';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(p1x, trackY, 7.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.font = '700 12px "IBM Plex Mono", monospace';
        ctx.fillStyle = '#065f46';
        ctx.fillText("P'", p1x + 10, trackY - 12);

        // Optional Horizontal Mass-Spring Overlay
        if (showSpringOverlay) {
          const springY = Math.min(height - 30, trackY + 78);
          const wallX = Math.max(42, cx - maxRadiusPx - 56);

          ctx.strokeStyle = '#334155';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(wallX, springY - 24);
          ctx.lineTo(wallX, springY + 24);
          ctx.stroke();

          ctx.save();
          ctx.setLineDash([4, 4]);
          ctx.strokeStyle = 'rgba(2, 132, 199, 0.55)';
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          ctx.moveTo(p1x, trackY + 10);
          ctx.lineTo(p1x, springY - 18);
          ctx.stroke();
          ctx.restore();

          drawHelicalSpring(ctx, wallX, springY, p1x - 20, springY, 12, 11);

          ctx.fillStyle = '#0284c7';
          ctx.strokeStyle = '#0c4a6e';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.roundRect(p1x - 20, springY - 18, 40, 36, 7);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = '#ffffff';
          ctx.font = '700 13px "IBM Plex Mono", monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('m', p1x, springY);
          ctx.textAlign = 'left';
          ctx.textBaseline = 'alphabetic';
        }
      } else {
        // DUAL SIMULTANEOUS PROJECTION (X and Y + Lissajous Synthesis)
        const trackX = cx + maxRadiusPx + 50;
        const trackY = cy + maxRadiusPx + 50;

        // Vertical track (Y)
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.moveTo(trackX, cy - maxRadiusPx - 8);
        ctx.lineTo(trackX, cy + maxRadiusPx + 8);
        ctx.stroke();

        // Horizontal track (X)
        ctx.beginPath();
        ctx.moveTo(cx - maxRadiusPx - 8, trackY);
        ctx.lineTo(cx + maxRadiusPx + 8, trackY);
        ctx.stroke();

        // Orthogonal beams
        ctx.save();
        ctx.setLineDash([5, 5]);
        ctx.strokeStyle = '#059669';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(p1x, p1y);
        ctx.lineTo(trackX, p1y);
        ctx.stroke();

        ctx.strokeStyle = '#0284c7';
        ctx.beginPath();
        ctx.moveTo(p1x, p1y);
        ctx.lineTo(p1x, trackY);
        ctx.stroke();
        ctx.restore();

        // Shadows P'_y and P'_x
        ctx.fillStyle = '#059669';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(trackX, p1y, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.font = '700 11px "IBM Plex Mono", monospace';
        ctx.fillStyle = '#065f46';
        ctx.fillText("P'y", trackX + 11, p1y + 4);

        ctx.fillStyle = '#0284c7';
        ctx.strokeStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(p1x, trackY, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#0369a1';
        ctx.fillText("P'x", p1x - 9, trackY + 20);

        // Lissajous Synthesis Box on Right Half
        const lx = Math.max(trackX + maxRadiusPx + 70, width * 0.76);
        const ly = cy + 12;
        const lRadius = R;

        drawPillLabel(ctx, t.canvas.lissajousSynthesis, lx, 20, '#f0fdf4', '#86efac', '#166534');

        // Bounding square [-A, +A] x [-A, +A]
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 1.2;
        ctx.strokeRect(lx - lRadius, ly - lRadius, lRadius * 2, lRadius * 2);

        // Axes
        ctx.strokeStyle = '#94a3b8';
        ctx.beginPath();
        ctx.moveTo(lx - lRadius - 12, ly);
        ctx.lineTo(lx + lRadius + 12, ly);
        ctx.moveTo(lx, ly - lRadius - 12);
        ctx.lineTo(lx, ly + lRadius + 12);
        ctx.stroke();

        // Synthesized circular locus x^2 + y^2 = A^2
        ctx.strokeStyle = 'rgba(5, 150, 105, 0.35)';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(lx, ly, lRadius, 0, Math.PI * 2);
        ctx.stroke();

        // Reconstructed point from (x, y)
        const sx = lx + R * Math.cos(theta1);
        const sy = ly - R * Math.sin(theta1);

        // Component dashed guides inside Lissajous box
        ctx.save();
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = '#0284c7';
        ctx.beginPath();
        ctx.moveTo(sx, ly);
        ctx.lineTo(sx, sy);
        ctx.stroke();
        ctx.strokeStyle = '#059669';
        ctx.beginPath();
        ctx.moveTo(lx, sy);
        ctx.lineTo(sx, sy);
        ctx.stroke();
        ctx.restore();

        drawArrow(ctx, lx, ly, sx, ly, '#0284c7', 2.2, 7);
        drawArrow(ctx, lx, ly, lx, sy, '#059669', 2.2, 7);

        ctx.fillStyle = '#0f172a';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(sx, sy, 6.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.font = '600 11px "IBM Plex Mono", monospace';
        ctx.fillStyle = '#0f172a';
        ctx.fillText('(x, y)', sx + 10, sy - 8);
      }
    }

    // =========================================================================
    // MODULE 2: INITIAL PHASE & LIVE WAVEFORM TRAIL
    // =========================================================================
    if (activeModule === 2) {
      const trackX = cx + maxRadiusPx + 50;
      const waveStartX = trackX + 20;
      const waveEndX = width - 24;
      const waveWidth = Math.max(120, waveEndX - waveStartX);

      drawPillLabel(
        ctx,
        t.canvas.waveformTrail,
        waveStartX + waveWidth / 2,
        20,
        '#f0f9ff',
        '#7dd3fc',
        '#0369a1'
      );

      // Vertical projection track
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(trackX, cy - maxRadiusPx - 10);
      ctx.lineTo(trackX, cy + maxRadiusPx + 10);
      ctx.stroke();

      // Waveform axis (x = 0 centerline)
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(waveStartX, cy);
      ctx.lineTo(waveEndX, cy);
      ctx.stroke();

      // Amplitude guide bands +A and -A
      ctx.save();
      ctx.setLineDash([4, 5]);
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.45)';
      ctx.beginPath();
      ctx.moveTo(waveStartX, cy - R);
      ctx.lineTo(waveEndX, cy - R);
      ctx.moveTo(waveStartX, cy + R);
      ctx.lineTo(waveEndX, cy + R);
      ctx.stroke();
      ctx.restore();

      ctx.font = '600 11px "IBM Plex Mono", monospace';
      ctx.fillStyle = '#64748b';
      ctx.fillText('+A', trackX - 24, cy - R + 4);
      ctx.fillText('-A', trackX - 24, cy + R + 4);

      // Wave spatial-phase factor: show ~2.2 cycles across waveWidth
      const totalSpanRad = Math.PI * 4.4;

      // Primary Wave Trail x1(t)
      ctx.save();
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 2.8;
      ctx.beginPath();
      for (let i = 0; i <= 200; i++) {
        const frac = i / 200;
        const px = waveStartX + frac * waveWidth;
        const phaseAtPx = theta1 - frac * totalSpanRad;
        const py = cy - R * Math.sin(phaseAtPx);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
      ctx.restore();

      // Dashed projection beam from P1 to P'1 and wave origin
      ctx.save();
      ctx.setLineDash([5, 4]);
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(p1x, p1y);
      ctx.lineTo(waveStartX, p1y);
      ctx.stroke();
      ctx.restore();

      // Shadow P'1
      ctx.fillStyle = '#0284c7';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(trackX, p1y, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Wave origin dot
      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.arc(waveStartX, p1y, 5, 0, Math.PI * 2);
      ctx.fill();

      // Secondary Particle & Wave Trail
      if (showSecondParticle) {
        drawArrow(ctx, cx, cy, p2x, p2y, '#d97706', 2.4, 8);

        ctx.save();
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 2.4;
        ctx.setLineDash([7, 4]);
        ctx.beginPath();
        for (let i = 0; i <= 200; i++) {
          const frac = i / 200;
          const px = waveStartX + frac * waveWidth;
          const phaseAtPx = theta2 - frac * totalSpanRad;
          const py = cy - R * Math.sin(phaseAtPx);
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
        ctx.restore();

        // Projection beam from P2
        ctx.save();
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = 'rgba(217, 119, 6, 0.75)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(p2x, p2y);
        ctx.lineTo(waveStartX, p2y);
        ctx.stroke();
        ctx.restore();

        // Shadow P'2
        ctx.fillStyle = '#d97706';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(trackX, p2y, 6.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Particle P2 on circle
        ctx.fillStyle = 'rgba(245, 158, 11, 0.25)';
        ctx.beginPath();
        ctx.arc(p2x, p2y, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#d97706';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.arc(p2x, p2y, 7.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.font = '700 12px "IBM Plex Mono", monospace';
        ctx.fillStyle = '#b45309';
        ctx.fillText('P₂', p2x + 11, p2y - 9);
      }

      ctx.font = '600 11px "Hind Siliguri", "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#64748b';
      ctx.textAlign = 'right';
      ctx.fillText(`← ${t.canvas.timeAxis}`, waveEndX, cy + maxRadiusPx + 24);
      ctx.textAlign = 'left';
    }

    // =========================================================================
    // MODULE 3: VELOCITY, ACCELERATION & ROTATING PHASOR VECTORS
    // =========================================================================
    if (activeModule === 3) {
      const trackX = cx + maxRadiusPx + 54;

      // Dynamic scaling for tangential velocity & centripetal acceleration vectors so they stay crisp & readable
      const vScale = Math.min(58, Math.max(28, R * 0.65)) / Math.max(0.01, kinematics.vMax);
      const aScale = Math.min(54, Math.max(24, R * 0.58)) / Math.max(0.01, kinematics.aMax);

      // Vertical oscillation track
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(trackX, cy - maxRadiusPx - 10);
      ctx.lineTo(trackX, cy + maxRadiusPx + 10);
      ctx.stroke();

      // Equilibrium & Extreme markers on track
      [
        { y: cy - R, lbl: '+A', active: kinematics.landmark === 'positiveExtreme' },
        { y: cy, lbl: '0', active: kinematics.landmark === 'equilibrium' },
        { y: cy + R, lbl: '-A', active: kinematics.landmark === 'negativeExtreme' },
      ].forEach((m) => {
        ctx.strokeStyle = m.active ? '#0f172a' : '#94a3b8';
        ctx.lineWidth = m.active ? 2.2 : 1.3;
        ctx.beginPath();
        ctx.moveTo(trackX - 9, m.y);
        ctx.lineTo(trackX + 9, m.y);
        ctx.stroke();
        ctx.font = '600 11px "IBM Plex Mono", monospace';
        ctx.fillStyle = m.active ? '#0f172a' : '#64748b';
        ctx.fillText(m.lbl, trackX - 28, m.y + 4);
      });

      // Projection dashed line from P to P'
      ctx.save();
      ctx.setLineDash([5, 4]);
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(p1x, p1y);
      ctx.lineTo(trackX, p1y);
      ctx.stroke();
      ctx.restore();

      // 1. Circle Phasor Vectors (Tangential v_circ & Centripetal a_circ)
      if (state.showPhasorVectors) {
        if (state.showVelocityVector) {
          // Tangential direction (-sin θ, cos θ) in math coords -> screen (-sin θ, -cos θ)
          const vTx = p1x - Math.sin(theta1) * kinematics.vMax * vScale;
          const vTy = p1y - Math.cos(theta1) * kinematics.vMax * vScale;
          drawArrow(ctx, p1x, p1y, vTx, vTy, '#059669', 2.8, 9);
          ctx.font = '700 11px "IBM Plex Mono", monospace';
          ctx.fillStyle = '#047857';
          ctx.fillText('v=ωA', vTx + 6, vTy - 6);
        }

        if (state.showAccelerationVector) {
          // Centripetal direction (-cos θ, -sin θ) in math -> screen (-cos θ, +sin θ)
          const aCx = p1x - Math.cos(theta1) * kinematics.aMax * aScale;
          const aCy = p1y + Math.sin(theta1) * kinematics.aMax * aScale;
          drawArrow(ctx, p1x, p1y, aCx, aCy, '#e11d48', 2.8, 9);
          ctx.font = '700 11px "IBM Plex Mono", monospace';
          ctx.fillStyle = '#be123c';
          ctx.fillText('a=ω²A', aCx + 6, aCy + 12);
        }
      }

      // 2. Projected Linear Vectors along the SHM Track
      if (state.showDisplacementVector) {
        drawArrow(ctx, trackX - 10, cy, trackX - 10, p1y, '#0284c7', 3.2, 9);
      }

      if (state.showVelocityVector) {
        // Vertical projection of v_circ is +v_y = ωA cos θ (upwards is negative screen Y)
        const vEndY = p1y - kinematics.activeVel * vScale;
        drawArrow(ctx, trackX + 10, p1y, trackX + 10, vEndY, '#059669', 3.2, 9);
        if (Math.abs(kinematics.activeVel) > 0.15) {
          ctx.font = '700 11px "IBM Plex Mono", monospace';
          ctx.fillStyle = '#047857';
          ctx.fillText('v', trackX + 16, vEndY);
        }
      }

      if (state.showAccelerationVector) {
        // Vertical projection of a_circ is a_y = -ω²y (upwards is negative screen Y)
        const aEndY = p1y - kinematics.activeAcc * aScale;
        drawArrow(ctx, trackX + 24, p1y, trackX + 24, aEndY, '#e11d48', 3.2, 9);
        if (Math.abs(kinematics.activeAcc) > 0.15) {
          ctx.font = '700 11px "IBM Plex Mono", monospace';
          ctx.fillStyle = '#be123c';
          ctx.fillText('a', trackX + 30, aEndY);
        }
      }

      // Shadow P' on track
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(trackX, p1y, 6.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Synchronized x, v, a Phase-Aligned Comparison Curves on Right Side
      const plotStartX = trackX + 54;
      const plotEndX = width - 22;
      const plotW = Math.max(120, plotEndX - plotStartX);
      const plotAmp = Math.min(54, height * 0.12);
      const plotCy = cy;

      if (plotW > 110) {
        drawPillLabel(
          ctx,
          'x(t), v(t), a(t) Phase Lead (π/2, π)',
          plotStartX + plotW / 2,
          20,
          '#f8fafc',
          '#cbd5e1',
          '#0f172a'
        );

        // Plot center zero axis
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(plotStartX, plotCy);
        ctx.lineTo(plotEndX, plotCy);
        ctx.stroke();

        // Plot +1 / -1 normalized envelopes
        ctx.save();
        ctx.setLineDash([3, 4]);
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.45)';
        ctx.beginPath();
        ctx.moveTo(plotStartX, plotCy - plotAmp);
        ctx.lineTo(plotEndX, plotCy - plotAmp);
        ctx.moveTo(plotStartX, plotCy + plotAmp);
        ctx.lineTo(plotEndX, plotCy + plotAmp);
        ctx.stroke();
        ctx.restore();

        const spanRad = Math.PI * 2.5;
        const drawNormCurve = (fn: (ph: number) => number, color: string, widthPx: number) => {
          ctx.save();
          ctx.strokeStyle = color;
          ctx.lineWidth = widthPx;
          ctx.beginPath();
          for (let i = 0; i <= 160; i++) {
            const frac = i / 160;
            const px = plotStartX + frac * plotW;
            const ph = theta1 - frac * spanRad;
            const py = plotCy - plotAmp * fn(ph);
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.stroke();
          ctx.restore();
        };

        if (state.showDisplacementVector) {
          drawNormCurve((ph) => Math.sin(ph), '#0284c7', 2.4);
          const py = plotCy - plotAmp * Math.sin(theta1);
          ctx.fillStyle = '#0284c7';
          ctx.beginPath();
          ctx.arc(plotStartX, py, 4.5, 0, Math.PI * 2);
          ctx.fill();
        }
        if (state.showVelocityVector) {
          drawNormCurve((ph) => Math.cos(ph), '#059669', 2.4);
          const py = plotCy - plotAmp * Math.cos(theta1);
          ctx.fillStyle = '#059669';
          ctx.beginPath();
          ctx.arc(plotStartX, py, 4.5, 0, Math.PI * 2);
          ctx.fill();
        }
        if (state.showAccelerationVector) {
          drawNormCurve((ph) => -Math.sin(ph), '#e11d48', 2.4);
          const py = plotCy + plotAmp * Math.sin(theta1);
          ctx.fillStyle = '#e11d48';
          ctx.beginPath();
          ctx.arc(plotStartX, py, 4.5, 0, Math.PI * 2);
          ctx.fill();
        }

        // Legend pills under plot
        const legendY = plotCy + plotAmp + 28;
        ctx.font = '700 11px "IBM Plex Mono", monospace';
        ctx.fillStyle = '#0284c7';
        ctx.fillText('— x (0°)', plotStartX, legendY);
        ctx.fillStyle = '#059669';
        ctx.fillText('— v (+90°)', plotStartX + 68, legendY);
        ctx.fillStyle = '#e11d48';
        ctx.fillText('— a (+180°)', plotStartX + 148, legendY);
      }

      // Landmark Flash Callout Badge at bottom-center or top-right of canvas
      if (kinematics.landmark) {
        const badgeText =
          kinematics.landmark === 'equilibrium'
            ? t.canvas.equilibriumBadge
            : kinematics.landmark === 'positiveExtreme'
            ? t.canvas.posExtremeBadge
            : t.canvas.negExtremeBadge;
        const isEq = kinematics.landmark === 'equilibrium';
        drawPillLabel(
          ctx,
          badgeText,
          width * 0.5,
          Math.min(height - 22, cy + maxRadiusPx + 42),
          isEq ? '#ecfdf5' : '#fff1f2',
          isEq ? '#34d399' : '#fda4af',
          isEq ? '#065f46' : '#9f1239',
          '700 12.5px "Hind Siliguri", "Plus Jakarta Sans", sans-serif'
        );
      }
    }

    // --- PRIMARY PARTICLE P₁ (GLOWING BLUE) ON TOP ---
    ctx.fillStyle = 'rgba(2, 132, 199, 0.22)';
    ctx.beginPath();
    ctx.arc(p1x, p1y, 15, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#0284c7';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(p1x, p1y, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.font = '700 12px "IBM Plex Mono", monospace';
    ctx.fillStyle = '#0c4a6e';
    ctx.fillText(activeModule === 2 && showSecondParticle ? 'P₁' : 'P', p1x + 11, p1y - 10);

    ctx.restore();
  }, [state, kinematics, t]);

  // Pointer interaction helpers for dragging particle on the reference circle
  const getPointerPos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const layout = layoutRef.current;
    if (!layout) return;
    const pos = getPointerPos(e);

    const d1 = Math.hypot(pos.x - layout.p1x, pos.y - layout.p1y);
    const d2 =
      layout.p2x !== undefined && layout.p2y !== undefined
        ? Math.hypot(pos.x - layout.p2x, pos.y - layout.p2y)
        : Infinity;

    const distToCenter = Math.hypot(pos.x - layout.cx, pos.y - layout.cy);
    const nearCircleRing = Math.abs(distToCenter - layout.radiusPx) <= 32;

    if (d1 <= 30 || d2 <= 30 || nearCircleRing) {
      const targetParticle: 1 | 2 = d2 < d1 && d2 <= 32 ? 2 : 1;
      draggingRef.current = { active: true, particle: targetParticle };
      setCursorMode('grabbing');
      e.currentTarget.setPointerCapture(e.pointerId);

      const angleRad = Math.atan2(-(pos.y - layout.cy), pos.x - layout.cx);
      onDragParticle(wrapDegrees((angleRad * 180) / Math.PI), targetParticle);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const layout = layoutRef.current;
    if (!layout) return;
    const pos = getPointerPos(e);

    if (draggingRef.current.active) {
      const angleRad = Math.atan2(-(pos.y - layout.cy), pos.x - layout.cx);
      onDragParticle(wrapDegrees((angleRad * 180) / Math.PI), draggingRef.current.particle);
      return;
    }

    const d1 = Math.hypot(pos.x - layout.p1x, pos.y - layout.p1y);
    const d2 =
      layout.p2x !== undefined && layout.p2y !== undefined
        ? Math.hypot(pos.x - layout.p2x, pos.y - layout.p2y)
        : Infinity;
    const distToCenter = Math.hypot(pos.x - layout.cx, pos.y - layout.cy);
    const nearCircleRing = Math.abs(distToCenter - layout.radiusPx) <= 28;

    setCursorMode(d1 <= 28 || d2 <= 28 || nearCircleRing ? 'grab' : 'default');
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (draggingRef.current.active) {
      draggingRef.current.active = false;
      setCursorMode('grab');
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    }
  };

  return (
    <section
      ref={containerRef}
      className="flex-1 min-w-0 bg-white/95 backdrop-blur-sm border border-sky-200 rounded-2xl shadow-sm overflow-hidden relative h-[460px] lg:h-[520px] flex flex-col"
    >
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{ cursor: cursorMode, touchAction: 'none' }}
        className="w-full h-full flex-1 block"
      />
    </section>
  );
};
