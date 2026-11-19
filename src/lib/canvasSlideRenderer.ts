import type { SlideCard, SlideDefinition, TransitionKind } from '../data/slidesData';

const W = 1920;
const H = 1080;

const C = {
  navy: '#0A1628',
  navyPanel: '#11223D',
  navyBorder: '#1E3A5F',
  bgLight: '#F8FAFC',
  white: '#FFFFFF',
  panelLight: '#F1F5F9',
  border: '#CBD5E1',
  borderLight: '#E2E8F0',
  ink: '#0F172A',
  body: '#334155',
  muted: '#64748B',
  blue: '#1D4ED8',
  blueTint: '#EFF6FF',
  cyan: '#0891B2',
  cyanLight: '#38BDF8',
  cyanTint: '#ECFEFF',
  amber: '#D97706',
  amberBright: '#F59E0B',
  amberTint: '#FFFBEB',
  emerald: '#059669',
  emeraldTint: '#ECFDF5',
  crimson: '#DC2626',
  crimsonTint: '#FEF2F2',
};

function accentPalette(accent: SlideCard['accent']) {
  switch (accent) {
    case 'blue':
      return { line: C.blue, fill: C.blueTint, text: '#1E3A8A' };
    case 'cyan':
      return { line: C.cyan, fill: C.cyanTint, text: '#155E75' };
    case 'amber':
      return { line: C.amber, fill: C.amberTint, text: '#92400E' };
    case 'emerald':
      return { line: C.emerald, fill: C.emeraldTint, text: '#065F46' };
    case 'crimson':
      return { line: C.crimson, fill: C.crimsonTint, text: '#991B1B' };
    default:
      return { line: C.muted, fill: C.panelLight, text: C.ink };
  }
}

function easeOutCubic(t: number): number {
  const x = Math.max(0, Math.min(1, t));
  return 1 - Math.pow(1 - x, 3);
}

function animAlpha(elapsedMs: number, delayMs: number, durMs = 380): number {
  return easeOutCubic((elapsedMs - delayMs) / durMs);
}

function animRise(elapsedMs: number, delayMs: number, dist = 16, durMs = 380): number {
  return (1 - easeOutCubic((elapsedMs - delayMs) / durMs)) * dist;
}

function roundRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let line = '';
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = w;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function drawWrappedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
): number {
  const lines = wrapLines(ctx, text, maxWidth);
  lines.forEach((ln, idx) => {
    ctx.fillText(ln, x, y + idx * lineHeight);
  });
  return lines.length * lineHeight;
}

function drawArrow(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color: string,
  width = 4,
  headSize = 14,
  dashed = false
) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = width;
  if (dashed) ctx.setLineDash([8, 6]);
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.setLineDash([]);
  const angle = Math.atan2(y2 - y1, x2 - x1);
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - headSize * Math.cos(angle - Math.PI / 6), y2 - headSize * Math.sin(angle - Math.PI / 6));
  ctx.lineTo(x2 - headSize * Math.cos(angle + Math.PI / 6), y2 - headSize * Math.sin(angle + Math.PI / 6));
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawCard(
  ctx: CanvasRenderingContext2D,
  card: SlideCard,
  x: number,
  y: number,
  w: number,
  h: number,
  elapsedMs: number,
  delayMs: number
) {
  const a = animAlpha(elapsedMs, delayMs);
  if (a <= 0.01) return;
  const dy = animRise(elapsedMs, delayMs);
  const pal = accentPalette(card.accent);

  ctx.save();
  ctx.globalAlpha = a;
  ctx.translate(0, dy);

  roundRectPath(ctx, x, y, w, h, 12);
  ctx.fillStyle = C.white;
  ctx.fill();
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = C.border;
  ctx.stroke();

  // Top accent bar
  ctx.fillStyle = pal.line;
  ctx.fillRect(x + 20, y, w - 40, 6);

  let cy = y + 36;
  ctx.fillStyle = C.ink;
  ctx.font = '700 22px "Plus Jakarta Sans", "Segoe UI", sans-serif';
  ctx.textAlign = 'left';
  cy += drawWrappedText(ctx, card.title, x + 22, cy, w - 44, 28);

  if (card.tag) {
    cy += 4;
    ctx.fillStyle = pal.line;
    ctx.font = '600 15px "IBM Plex Mono", Consolas, monospace';
    ctx.fillText(card.tag, x + 22, cy);
    cy += 22;
  } else {
    cy += 4;
  }

  ctx.fillStyle = C.body;
  ctx.font = '400 18.5px "Plus Jakarta Sans", "Segoe UI", sans-serif';
  drawWrappedText(ctx, card.body, x + 22, cy, w - 44, 25);

  ctx.restore();
}

function drawCallout(
  ctx: CanvasRenderingContext2D,
  label: string,
  text: string,
  accent: SlideCard['accent'],
  x: number,
  y: number,
  w: number,
  h: number,
  elapsedMs: number,
  delayMs: number
) {
  const a = animAlpha(elapsedMs, delayMs);
  if (a <= 0.01) return;
  const dy = animRise(elapsedMs, delayMs, 12);
  const pal = accentPalette(accent);

  ctx.save();
  ctx.globalAlpha = a;
  ctx.translate(0, dy);

  roundRectPath(ctx, x, y, w, h, 12);
  ctx.fillStyle = pal.fill;
  ctx.fill();
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = pal.line;
  ctx.stroke();

  ctx.textAlign = 'left';
  ctx.fillStyle = pal.line;
  ctx.font = '700 15px "Plus Jakarta Sans", "Segoe UI", sans-serif';
  ctx.fillText(label.toUpperCase(), x + 24, y + 32);

  ctx.fillStyle = C.ink;
  ctx.font = '500 19px "Plus Jakarta Sans", "Segoe UI", sans-serif';
  drawWrappedText(ctx, text, x + 24, y + 60, w - 48, 26);
  ctx.restore();
}

function drawBullets(
  ctx: CanvasRenderingContext2D,
  points: string[],
  x: number,
  y: number,
  w: number,
  fontSize: number,
  lineHeight: number,
  elapsedMs: number,
  baseDelay: number
) {
  let cy = y;
  points.forEach((pt, idx) => {
    const a = animAlpha(elapsedMs, baseDelay + idx * 90);
    if (a <= 0.01) return;
    const dy = animRise(elapsedMs, baseDelay + idx * 90, 10);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.translate(0, dy);

    ctx.fillStyle = C.cyan;
    ctx.fillRect(x, cy - 11, 8, 8);

    ctx.fillStyle = C.body;
    ctx.font = `400 ${fontSize}px "Plus Jakarta Sans", "Segoe UI", sans-serif`;
    ctx.textAlign = 'left';
    const used = drawWrappedText(ctx, pt, x + 22, cy, w - 22, lineHeight);
    cy += used + 14;
    ctx.restore();
  });
}

function drawFlowSteps(
  ctx: CanvasRenderingContext2D,
  steps: NonNullable<SlideDefinition['flowSteps']>,
  x: number,
  y: number,
  w: number,
  h: number,
  elapsedMs: number
) {
  const n = steps.length;
  const gap = 36;
  const nw = (w - gap * (n - 1)) / n;

  steps.forEach((st, idx) => {
    const a = animAlpha(elapsedMs, 180 + idx * 90);
    if (a <= 0.01) return;
    const nx = x + idx * (nw + gap);
    const pal = accentPalette(st.accent);

    ctx.save();
    ctx.globalAlpha = a;
    roundRectPath(ctx, nx, y, nw, h, 10);
    ctx.fillStyle = pal.fill;
    ctx.fill();
    ctx.lineWidth = 1.6;
    ctx.strokeStyle = pal.line;
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.fillStyle = C.ink;
    ctx.font = '700 18px "Plus Jakarta Sans", "Segoe UI", sans-serif';
    ctx.fillText(st.title, nx + nw / 2, y + (st.subtitle ? h / 2 - 4 : h / 2 + 6));

    if (st.subtitle) {
      ctx.fillStyle = pal.line;
      ctx.font = '600 14px "IBM Plex Mono", Consolas, monospace';
      ctx.fillText(st.subtitle, nx + nw / 2, y + h / 2 + 22);
    }

    if (idx < n - 1) {
      drawArrow(ctx, nx + nw + 6, y + h / 2, nx + nw + gap - 6, y + h / 2, C.amber, 3.5, 11);
    }
    ctx.restore();
  });
}

function drawDiagramBox(
  ctx: CanvasRenderingContext2D,
  def: SlideDefinition,
  x: number,
  y: number,
  w: number,
  h: number,
  elapsedMs: number
) {
  const a = animAlpha(elapsedMs, 260, 420);
  if (a <= 0.01) return;

  ctx.save();
  ctx.globalAlpha = a;
  roundRectPath(ctx, x, y, w, h, 12);
  ctx.fillStyle = C.white;
  ctx.fill();
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = C.border;
  ctx.stroke();

  if (def.diagramTitle) {
    ctx.textAlign = 'left';
    ctx.fillStyle = C.cyan;
    ctx.font = '700 15px "Plus Jakarta Sans", "Segoe UI", sans-serif';
    ctx.fillText(def.diagramTitle.toUpperCase(), x + 22, y + 30);
  }

  if (def.diagramCaption) {
    ctx.textAlign = 'left';
    ctx.fillStyle = C.muted;
    ctx.font = 'italic 15px "Plus Jakarta Sans", "Segoe UI", sans-serif';
    ctx.fillText(def.diagramCaption, x + 22, y + h - 18);
  }

  const ix = x + 28;
  const iy = y + 48;
  const iw = w - 56;
  const ih = h - 88;
  const animProg = easeOutCubic((elapsedMs - 340) / 700);

  if (def.id === 2) {
    // Thermal vs Photochemical Energy Profiles
    ctx.strokeStyle = C.muted;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(ix + 35, iy + 15);
    ctx.lineTo(ix + 35, iy + ih - 24);
    ctx.lineTo(ix + iw - 15, iy + ih - 24);
    ctx.stroke();

    // Ground curve
    ctx.strokeStyle = C.blue;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(ix + 65, iy + ih - 50);
    ctx.bezierCurveTo(
      ix + iw * 0.3,
      iy + ih - 50,
      ix + iw * 0.38,
      iy + ih * 0.35,
      ix + iw * 0.52,
      iy + ih * 0.35
    );
    ctx.bezierCurveTo(
      ix + iw * 0.66,
      iy + ih * 0.35,
      ix + iw * 0.74,
      iy + ih - 45,
      ix + iw - 40,
      iy + ih - 45
    );
    ctx.stroke();

    // Excited curve
    ctx.strokeStyle = C.cyan;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(ix + 65, iy + ih * 0.25);
    ctx.bezierCurveTo(
      ix + iw * 0.35,
      iy + ih * 0.16,
      ix + iw * 0.55,
      iy + ih * 0.38,
      ix + iw - 40,
      iy + ih * 0.18
    );
    ctx.stroke();

    if (animProg > 0.2) {
      drawArrow(ctx, ix + 115, iy + ih - 54, ix + 115, iy + ih * 0.27, C.amber, 4, 14);
      ctx.fillStyle = C.amber;
      ctx.font = '700 18px "IBM Plex Mono", monospace';
      ctx.fillText('hν', ix + 82, iy + ih * 0.55);
    }

    ctx.fillStyle = C.cyan;
    ctx.font = '700 16px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('Excited Surface (S₁*)', ix + iw * 0.52, iy + 22);
    ctx.fillStyle = C.blue;
    ctx.fillText('Ground Surface (S₀) · ΔG‡', ix + iw * 0.42, iy + ih * 0.32 - 10);
  } else if (def.id === 3) {
    // Absorption Spectrum Vibronic Envelope
    ctx.strokeStyle = C.muted;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(ix + 40, iy + 15);
    ctx.lineTo(ix + 40, iy + ih - 24);
    ctx.lineTo(ix + iw - 15, iy + ih - 24);
    ctx.stroke();

    ctx.fillStyle = C.cyanTint;
    ctx.strokeStyle = C.cyan;
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(ix + 70, iy + ih - 24);
    ctx.bezierCurveTo(ix + iw * 0.24, iy + ih - 24, ix + iw * 0.26, iy + ih * 0.42, ix + iw * 0.34, iy + ih * 0.42);
    ctx.bezierCurveTo(ix + iw * 0.42, iy + ih * 0.42, ix + iw * 0.44, iy + 24, ix + iw * 0.52, iy + 24);
    ctx.bezierCurveTo(ix + iw * 0.6, iy + 24, ix + iw * 0.62, iy + ih * 0.48, ix + iw * 0.7, iy + ih * 0.48);
    ctx.bezierCurveTo(ix + iw * 0.78, iy + ih * 0.48, ix + iw * 0.82, iy + ih - 24, ix + iw - 45, iy + ih - 24);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = C.ink;
    ctx.font = '700 16px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('ε(λ) Molar Absorptivity', ix + 56, iy + 24);
  } else if (def.id === 4) {
    // Relative Photon Energy Spectrum
    const bands = [
      { title: 'Longer λ', sub: 'IR · Lower E', e: '< 1.7 eV', col: C.blue },
      { title: 'Visible', sub: '400–700 nm', e: '1.8–3.1 eV', col: C.cyan },
      { title: 'UV', sub: '200–400 nm', e: '3.1–6.2 eV', col: C.amber },
      { title: 'Shorter λ', sub: 'UV-C · High E', e: '> 6.2 eV', col: C.crimson },
    ];
    const bw = (iw - 48) / 4;
    bands.forEach((b, i) => {
      const bx = ix + i * (bw + 16);
      roundRectPath(ctx, bx, iy + 18, bw, ih - 86, 10);
      ctx.fillStyle = b.col;
      ctx.fill();
      ctx.textAlign = 'center';
      ctx.fillStyle = C.white;
      ctx.font = '700 20px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(b.title, bx + bw / 2, iy + 78);
      ctx.font = '500 16px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(b.sub, bx + bw / 2, iy + 108);
      ctx.font = '600 15px "IBM Plex Mono", monospace';
      ctx.fillText(b.e, bx + bw / 2, iy + 140);
    });
    drawArrow(ctx, ix + 15, iy + ih - 40, ix + iw - 15, iy + ih - 40, C.ink, 3.5, 13);
    ctx.textAlign = 'center';
    ctx.fillStyle = C.ink;
    ctx.font = '700 17px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('Increasing frequency (ν) → Increasing photon energy (E)', ix + iw / 2, iy + ih - 10);
  } else if (def.id === 5) {
    // Franck-Condon Morse Potential Wells
    ctx.strokeStyle = C.muted;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(ix + 48, iy + 15);
    ctx.lineTo(ix + 48, iy + ih - 32);
    ctx.lineTo(ix + iw - 15, iy + ih - 32);
    ctx.stroke();

    // S0 well
    ctx.strokeStyle = C.blue;
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    ctx.moveTo(ix + 110, iy + ih * 0.52);
    ctx.bezierCurveTo(ix + 160, iy + ih * 0.88, ix + 210, iy + ih * 0.88, ix + 270, iy + ih * 0.88);
    ctx.bezierCurveTo(ix + 360, iy + ih * 0.88, ix + 450, iy + ih * 0.62, ix + 560, iy + ih * 0.58);
    ctx.stroke();

    // S0 rungs
    ctx.setLineDash([7, 5]);
    ctx.lineWidth = 1.8;
    [0.84, 0.76, 0.68].forEach((f, idx) => {
      ctx.beginPath();
      ctx.moveTo(ix + 195 - idx * 24, iy + ih * f);
      ctx.lineTo(ix + 345 + idx * 35, iy + ih * f);
      ctx.stroke();
    });
    ctx.setLineDash([]);

    // S1* well displaced right
    ctx.strokeStyle = C.cyan;
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    ctx.moveTo(ix + 215, iy + 28);
    ctx.bezierCurveTo(ix + 270, iy + ih * 0.42, ix + 335, iy + ih * 0.42, ix + 395, iy + ih * 0.42);
    ctx.bezierCurveTo(ix + 485, iy + ih * 0.42, ix + 590, iy + ih * 0.16, ix + 720, iy + ih * 0.1);
    ctx.stroke();

    // S1 rungs
    ctx.setLineDash([7, 5]);
    ctx.lineWidth = 1.8;
    [0.38, 0.3, 0.22].forEach((f, idx) => {
      ctx.beginPath();
      ctx.moveTo(ix + 310 - idx * 24, iy + ih * f);
      ctx.lineTo(ix + 475 + idx * 38, iy + ih * f);
      ctx.stroke();
    });
    ctx.setLineDash([]);

    // Vertical absorption arrow
    if (animProg > 0.15) {
      drawArrow(ctx, ix + 270, iy + ih * 0.84, ix + 270, iy + ih * 0.23, C.amber, 4.5, 16);
      ctx.fillStyle = C.amber;
      ctx.font = '700 17px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText('Vertical Absorption (~10⁻¹⁵ s)', ix + 256, iy + ih * 0.5);
    }
    if (animProg > 0.45) {
      drawArrow(ctx, ix + 295, iy + ih * 0.22, ix + 390, iy + ih * 0.37, C.emerald, 3.2, 13, true);
      ctx.fillStyle = C.emerald;
      ctx.textAlign = 'left';
      ctx.font = '700 16px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('VR (~10⁻¹² s)', ix + 365, iy + ih * 0.24);
    }

    ctx.textAlign = 'left';
    ctx.fillStyle = C.blue;
    ctx.font = '700 19px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('S₀ (Ground)', ix + 105, iy + ih * 0.9);
    ctx.fillStyle = C.cyan;
    ctx.fillText('S₁* (Excited)', ix + 640, iy + ih * 0.18);
  } else if (def.id === 6) {
    // Singlet & Triplet Manifolds
    const sx = ix + 40;
    const tx = ix + 360;
    ctx.fillStyle = C.ink;
    ctx.font = '700 17px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('Singlet Manifold (S = 0)', sx, iy + 18);
    ctx.fillText('Hund’s Rule Ordering', tx, iy + 18);

    const drawLvl = (lx: number, ly: number, lw: number, lbl: string, col: string) => {
      ctx.strokeStyle = col;
      ctx.lineWidth = 4.5;
      ctx.beginPath();
      ctx.moveTo(lx, ly);
      ctx.lineTo(lx + lw, ly);
      ctx.stroke();
      ctx.fillStyle = col;
      ctx.font = '700 18px "IBM Plex Mono", monospace';
      ctx.fillText(lbl, lx + lw + 14, ly + 6);
    };

    drawLvl(sx, iy + ih - 24, 210, 'S₀ (↑↓)', C.blue);
    drawLvl(sx, iy + ih * 0.54, 210, 'S₁ (↑↓)', C.cyan);
    drawLvl(sx, iy + 46, 210, 'S₂ (↑↓)', C.cyan);

    drawLvl(tx, iy + ih - 24, 210, 'S₀ (↑↓)', C.blue);
    drawLvl(tx, iy + ih * 0.62, 210, 'T₁ (↑↑)', C.amber);
    drawLvl(tx, iy + ih * 0.34, 210, 'S₁ (↑↓)', C.cyan);

    // Orbital Spin Boxes on right
    const orbs = [
      { ox: ix + 720, lbl: 'S₀ (↑↓)', col: C.blue, top: '', bot: '↑↓' },
      { ox: ix + 840, lbl: 'S₁ (↑↓)', col: C.cyan, top: '↑', bot: '↓' },
      { ox: ix + 960, lbl: 'T₁ (↑↑)', col: C.amber, top: '↑', bot: '↑' },
    ];
    orbs.forEach((o) => {
      roundRectPath(ctx, o.ox, iy + 26, 90, 120, 8);
      ctx.fillStyle = C.bgLight;
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = o.col;
      ctx.stroke();
      ctx.strokeStyle = '#94A3B8';
      ctx.beginPath();
      ctx.moveTo(o.ox + 16, iy + 64);
      ctx.lineTo(o.ox + 74, iy + 64);
      ctx.moveTo(o.ox + 16, iy + 114);
      ctx.lineTo(o.ox + 74, iy + 114);
      ctx.stroke();
      ctx.textAlign = 'center';
      ctx.fillStyle = o.col;
      ctx.font = '700 22px "Plus Jakarta Sans", sans-serif';
      if (o.top) ctx.fillText(o.top, o.ox + 45, iy + 58);
      ctx.fillText(o.bot, o.ox + 45, iy + 108);
      ctx.font = '700 16px "IBM Plex Mono", monospace';
      ctx.fillText(o.lbl, o.ox + 45, iy + 168);
    });
  } else if (def.id === 7) {
    // Jablonski Diagram
    const sx = ix + 70;
    const sw = 320;
    const tx = ix + 520;
    const tw = 260;

    const yS2 = iy + 62;
    const yS1 = iy + 235;
    const yT1 = iy + 320;
    const yS0 = iy + ih - 50;

    const drawState = (lx: number, ly: number, lw: number, lbl: string, col: string, side: 'l' | 'r') => {
      ctx.strokeStyle = col;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(lx, ly);
      ctx.lineTo(lx + lw, ly);
      ctx.stroke();
      ctx.strokeStyle = C.border;
      ctx.lineWidth = 1.5;
      [20, 38].forEach((dy) => {
        ctx.beginPath();
        ctx.moveTo(lx, ly - dy);
        ctx.lineTo(lx + lw, ly - dy);
        ctx.stroke();
      });
      ctx.fillStyle = col;
      ctx.font = '700 22px "IBM Plex Mono", monospace';
      ctx.textAlign = side === 'l' ? 'right' : 'left';
      ctx.fillText(lbl, side === 'l' ? lx - 16 : lx + lw + 16, ly + 7);
    };

    drawState(sx, yS0, sw + 390, 'S₀', C.blue, 'l');
    drawState(sx, yS1, sw, 'S₁', C.cyan, 'l');
    drawState(sx, yS2, sw, 'S₂', C.cyan, 'l');
    drawState(tx, yT1, tw, 'T₁', C.amber, 'r');

    if (animProg > 0.1) {
      drawArrow(ctx, sx + 65, yS0 - 4, sx + 65, yS2 + 4, C.amber, 4.5, 16);
      ctx.textAlign = 'left';
      ctx.fillStyle = C.amber;
      ctx.font = '700 17px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('Absorption (hν)', sx + 78, (yS0 + yS1) / 2 + 12);
    }
    if (animProg > 0.3) {
      drawArrow(ctx, sx + 165, yS2 + 6, sx + 165, yS1 - 42, C.emerald, 3.5, 13, true);
      ctx.fillStyle = C.emerald;
      ctx.fillText('IC / VR', sx + 178, (yS2 + yS1) / 2);
    }
    if (animProg > 0.45) {
      drawArrow(ctx, sx + 235, yS1 + 4, sx + 235, yS0 - 6, C.blue, 4.5, 16);
      ctx.fillStyle = C.blue;
      ctx.fillText('Fluorescence', sx + 248, (yS0 + yS1) / 2 + 10);
      ctx.font = '500 14px "IBM Plex Mono", monospace';
      ctx.fillText('(~10⁻⁹ s)', sx + 248, (yS0 + yS1) / 2 + 30);
    }
    if (animProg > 0.6) {
      drawArrow(ctx, sx + sw + 8, yS1, tx - 8, yT1 - 36, C.amber, 3.5, 13, true);
      ctx.fillStyle = C.amber;
      ctx.font = '700 17px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('ISC', sx + sw + 45, yS1 - 12);
    }
    if (animProg > 0.75) {
      drawArrow(ctx, tx + 110, yT1 + 4, tx + 110, yS0 - 6, C.crimson, 4.5, 16);
      ctx.fillStyle = C.crimson;
      ctx.fillText('Phosphorescence', tx + 124, (yS0 + yT1) / 2 + 6);
      ctx.font = '500 14px "IBM Plex Mono", monospace';
      ctx.fillText('(~10⁻³–10⁰ s)', tx + 124, (yS0 + yT1) / 2 + 28);
    }
  } else if (def.id === 11) {
    // Potential Energy Surface & Conical Intersection
    ctx.strokeStyle = C.muted;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(ix + 48, iy + 15);
    ctx.lineTo(ix + 48, iy + ih - 32);
    ctx.lineTo(ix + iw - 15, iy + ih - 32);
    ctx.stroke();

    // Ground state surface
    ctx.strokeStyle = C.blue;
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    ctx.moveTo(ix + 80, iy + ih * 0.78);
    ctx.bezierCurveTo(ix + iw * 0.3, iy + ih * 0.78, ix + iw * 0.35, iy + ih * 0.45, ix + iw * 0.48, iy + ih * 0.45);
    ctx.bezierCurveTo(ix + iw * 0.6, iy + ih * 0.45, ix + iw * 0.65, iy + ih * 0.82, ix + iw * 0.78, iy + ih * 0.82);
    ctx.bezierCurveTo(ix + iw * 0.88, iy + ih * 0.82, ix + iw * 0.92, iy + ih * 0.76, ix + iw - 35, iy + ih * 0.74);
    ctx.stroke();

    // Excited state surface dipping to CI
    ctx.strokeStyle = C.cyan;
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    ctx.moveTo(ix + 80, iy + ih * 0.22);
    ctx.bezierCurveTo(ix + iw * 0.28, iy + ih * 0.18, ix + iw * 0.38, iy + ih * 0.42, ix + iw * 0.48, iy + ih * 0.42);
    ctx.bezierCurveTo(ix + iw * 0.62, iy + ih * 0.42, ix + iw * 0.72, iy + ih * 0.16, ix + iw - 40, iy + ih * 0.15);
    ctx.stroke();

    drawArrow(ctx, ix + 130, iy + ih * 0.76, ix + 130, iy + ih * 0.24, C.amber, 4.5, 16);
    ctx.fillStyle = C.amber;
    ctx.font = '700 17px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('Photoexcitation', ix + 144, iy + ih * 0.44);

    // CI node
    ctx.beginPath();
    ctx.arc(ix + iw * 0.48, iy + ih * 0.435, 22, 0, Math.PI * 2);
    ctx.fillStyle = C.amberTint;
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = C.amber;
    ctx.stroke();
    ctx.textAlign = 'center';
    ctx.fillStyle = '#92400E';
    ctx.font = '700 16px "IBM Plex Mono", monospace';
    ctx.fillText('CI', ix + iw * 0.48, iy + ih * 0.435 + 6);
    ctx.fillStyle = C.amber;
    ctx.font = '700 17px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('Conical Intersection', ix + iw * 0.48, iy + ih * 0.435 - 32);

    ctx.textAlign = 'left';
    ctx.fillStyle = C.blue;
    ctx.fillText('Ground State (S₀)', ix + 85, iy + ih * 0.87);
    ctx.fillStyle = C.cyan;
    ctx.fillText('Excited State (S₁)', ix + iw * 0.65, iy + ih * 0.12);
  } else if (def.id === 15) {
    // Semiconductor Band-Gap Model
    roundRectPath(ctx, ix + 70, iy + 30, iw - 230, 105, 10);
    ctx.fillStyle = C.blueTint;
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = C.blue;
    ctx.stroke();
    ctx.textAlign = 'center';
    ctx.fillStyle = C.blue;
    ctx.font = '700 22px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('Conduction Band (CB)', ix + 70 + (iw - 230) / 2, iy + 74);
    ctx.font = '500 17px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('Reduction reactions (e⁻)', ix + 70 + (iw - 230) / 2, iy + 106);

    roundRectPath(ctx, ix + 70, iy + ih - 135, iw - 230, 105, 10);
    ctx.fillStyle = C.cyanTint;
    ctx.fill();
    ctx.strokeStyle = C.cyan;
    ctx.stroke();
    ctx.fillStyle = C.cyan;
    ctx.font = '700 22px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('Valence Band (VB)', ix + 70 + (iw - 230) / 2, iy + ih - 91);
    ctx.font = '500 17px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('Oxidation reactions (h⁺)', ix + 70 + (iw - 230) / 2, iy + ih - 59);

    drawArrow(ctx, ix + 240, iy + ih - 142, ix + 240, iy + 142, C.amber, 5, 16);
    ctx.textAlign = 'right';
    ctx.fillStyle = C.amber;
    ctx.font = '700 20px "IBM Plex Mono", monospace';
    ctx.fillText('hν ≥ E_g', ix + 220, iy + ih / 2 + 6);

    drawArrow(ctx, ix + iw - 280, iy + 142, ix + iw - 280, iy + ih - 142, C.crimson, 3.5, 13, true);
    ctx.textAlign = 'left';
    ctx.fillStyle = C.crimson;
    ctx.font = '600 17px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('Recombination', ix + iw - 262, iy + ih / 2 + 6);

    // e- / h+ circles
    ctx.beginPath();
    ctx.arc(ix + iw - 90, iy + 82, 26, 0, Math.PI * 2);
    ctx.fillStyle = C.blue;
    ctx.fill();
    ctx.fillStyle = C.white;
    ctx.textAlign = 'center';
    ctx.font = '700 22px "IBM Plex Mono", monospace';
    ctx.fillText('e⁻', ix + iw - 90, iy + 90);

    ctx.beginPath();
    ctx.arc(ix + iw - 90, iy + ih - 82, 26, 0, Math.PI * 2);
    ctx.fillStyle = C.cyan;
    ctx.fill();
    ctx.fillStyle = C.white;
    ctx.fillText('h⁺', ix + iw - 90, iy + ih - 74);
  } else {
    // Compact diagram representations for 9, 10, 12, 14, 16, 17, 18, 19, 20
    if (def.id === 9) {
      roundRectPath(ctx, ix, iy + 8, iw / 2 - 12, ih - 16, 10);
      ctx.fillStyle = C.cyanTint;
      ctx.fill();
      ctx.strokeStyle = C.cyan;
      ctx.lineWidth = 1.6;
      ctx.stroke();
      ctx.textAlign = 'center';
      ctx.fillStyle = '#155E75';
      ctx.font = '700 17px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('Photoisomerization (cis → trans)', ix + (iw / 2 - 12) / 2, iy + ih / 2 - 6);
      ctx.font = '600 15px "IBM Plex Mono", monospace';
      ctx.fillStyle = C.ink;
      ctx.fillText('R₂C=CR₂ + hν → [π→π*] → trans', ix + (iw / 2 - 12) / 2, iy + ih / 2 + 22);

      roundRectPath(ctx, ix + iw / 2 + 12, iy + 8, iw / 2 - 12, ih - 16, 10);
      ctx.fillStyle = C.amberTint;
      ctx.fill();
      ctx.strokeStyle = C.amber;
      ctx.stroke();
      ctx.fillStyle = '#92400E';
      ctx.font = '700 17px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('Photodissociation (Cleavage)', ix + iw / 2 + 12 + (iw / 2 - 12) / 2, iy + ih / 2 - 6);
      ctx.font = '600 15px "IBM Plex Mono", monospace';
      ctx.fillStyle = C.ink;
      ctx.fillText('A—B + hν → (A—B)* → A• + B•', ix + iw / 2 + 12 + (iw / 2 - 12) / 2, iy + ih / 2 + 22);
    } else if (def.id === 10 || def.id === 12) {
      const bars =
        def.id === 10
          ? [
              { w: iw * 0.94, col: C.amber, lbl: 'Absorbed Photon Energy (hν)' },
              { w: iw * 0.72, col: C.cyan, lbl: 'After VR / IC Relaxation' },
              { w: iw * 0.56, col: C.blue, lbl: 'Reactive Excited-State Energy' },
              { w: iw * 0.4, col: C.emerald, lbl: 'Net Chemical Work / Products' },
            ]
          : [
              { w: iw * 0.44, col: C.crimson, lbl: 'Φ < 1 · Quenching & relaxation losses' },
              { w: iw * 0.68, col: C.cyan, lbl: 'Φ = 1 · Ideal primary quantum event' },
              { w: iw * 0.95, col: C.emerald, lbl: 'Φ > 1 · Photoinitiated chain propagation' },
            ];
      const bh = Math.min(38, (ih - 24) / bars.length - 10);
      bars.forEach((b, i) => {
        const by = iy + 6 + i * (bh + 12);
        roundRectPath(ctx, ix, by, b.w * Math.max(0.2, animProg), bh, 6);
        ctx.fillStyle = b.col;
        ctx.fill();
        ctx.textAlign = 'left';
        ctx.fillStyle = C.white;
        ctx.font = '700 15px "Plus Jakarta Sans", sans-serif';
        ctx.fillText(b.lbl, ix + 14, by + bh / 2 + 5);
      });
    } else if (def.id === 14) {
      const pts = [
        { x: ix + 10, y: iy + ih - 54, w: 120, lbl: 'H₂O → O₂', sub: '+0.82 V', col: C.blue },
        { x: ix + 165, y: iy + 10, w: 120, lbl: 'P680*', sub: '−0.8 V', col: C.cyan },
        { x: ix + 320, y: iy + ih * 0.42, w: 145, lbl: 'Cyt b₆f / PC', sub: '+0.35 V', col: C.amber },
        { x: ix + 495, y: iy + 6, w: 120, lbl: 'P700*', sub: '−1.2 V', col: C.cyan },
        { x: ix + 645, y: iy + ih * 0.34, w: 125, lbl: 'NADPH', sub: '−0.32 V', col: C.emerald },
      ];
      pts.forEach((p) => {
        roundRectPath(ctx, p.x, p.y, p.w, 46, 8);
        ctx.fillStyle = C.white;
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = p.col;
        ctx.stroke();
        ctx.textAlign = 'center';
        ctx.fillStyle = p.col;
        ctx.font = '700 15px "Plus Jakarta Sans", sans-serif';
        ctx.fillText(p.lbl, p.x + p.w / 2, p.y + 20);
        ctx.fillStyle = C.muted;
        ctx.font = '600 13px "IBM Plex Mono", monospace';
        ctx.fillText(p.sub, p.x + p.w / 2, p.y + 38);
      });
    } else if (def.id === 16) {
      const layers = [
        { lbl: 'Front', sub: 'Contact', fill: C.panelLight, stroke: C.muted },
        { lbl: 'n-Type', sub: 'e⁻ collection', fill: C.blueTint, stroke: C.blue },
        { lbl: 'p-Type', sub: 'h⁺ collection', fill: C.cyanTint, stroke: C.cyan },
        { lbl: 'Load', sub: 'Power Out', fill: C.emeraldTint, stroke: C.emerald },
      ];
      const lw = (iw - 36) / 4;
      layers.forEach((l, i) => {
        const lx = ix + i * (lw + 12);
        roundRectPath(ctx, lx, iy + 14, lw, ih - 28, 8);
        ctx.fillStyle = l.fill;
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = l.stroke;
        ctx.stroke();
        ctx.textAlign = 'center';
        ctx.fillStyle = C.ink;
        ctx.font = '700 18px "Plus Jakarta Sans", sans-serif';
        ctx.fillText(l.lbl, lx + lw / 2, iy + ih / 2 - 4);
        ctx.fillStyle = C.muted;
        ctx.font = '500 14px "Plus Jakarta Sans", sans-serif';
        ctx.fillText(l.sub, lx + lw / 2, iy + ih / 2 + 20);
      });
    } else if (def.id === 17) {
      roundRectPath(ctx, ix, iy + 12, iw, ih - 24, 10);
      ctx.fillStyle = C.blueTint;
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = C.blue;
      ctx.stroke();
      ctx.textAlign = 'center';
      ctx.fillStyle = C.blue;
      ctx.font = '700 19px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('[2+2] Photocycloaddition & Photoredox Pathway', ix + iw / 2, iy + ih / 2 - 12);
      ctx.fillStyle = C.ink;
      ctx.font = '600 17px "IBM Plex Mono", monospace';
      ctx.fillText('Alkene₁ + Alkene₂ + hν (PS) → [³Excited] → Cyclobutane', ix + iw / 2, iy + ih / 2 + 22);
    } else if (def.id === 18) {
      const nodes = [
        { txt: 'NO₂ + hν', sub: 'λ < 420 nm', fill: C.amberTint, stroke: C.amber },
        { txt: 'NO + O(³P)', sub: 'Photolysis', fill: C.blueTint, stroke: C.blue },
        { txt: 'O₃ + M', sub: 'O + O₂ + M', fill: C.cyanTint, stroke: C.cyan },
      ];
      const nw = (iw - 96) / 3;
      nodes.forEach((n, i) => {
        const nx = ix + i * (nw + 48);
        roundRectPath(ctx, nx, iy + 16, nw, ih - 32, 10);
        ctx.fillStyle = n.fill;
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = n.stroke;
        ctx.stroke();
        ctx.textAlign = 'center';
        ctx.fillStyle = C.ink;
        ctx.font = '700 18px "IBM Plex Mono", monospace';
        ctx.fillText(n.txt, nx + nw / 2, iy + ih / 2 - 4);
        ctx.fillStyle = C.muted;
        ctx.font = '500 14px "Plus Jakarta Sans", sans-serif';
        ctx.fillText(n.sub, nx + nw / 2, iy + ih / 2 + 22);
        if (i < 2) {
          drawArrow(ctx, nx + nw + 6, iy + ih / 2, nx + nw + 42, iy + ih / 2, C.amber, 3.5, 11);
        }
      });
    } else if (def.id === 19) {
      roundRectPath(ctx, ix, iy + ih * 0.2, 185, ih * 0.6, 10);
      ctx.fillStyle = C.amberTint;
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = C.amber;
      ctx.stroke();
      ctx.textAlign = 'center';
      ctx.fillStyle = '#92400E';
      ctx.font = '700 18px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('³PS* (Triplet)', ix + 92, iy + ih / 2 + 6);

      roundRectPath(ctx, ix + 245, iy + 6, iw - 245, ih * 0.42, 8);
      ctx.fillStyle = C.blueTint;
      ctx.fill();
      ctx.strokeStyle = C.blue;
      ctx.stroke();
      ctx.fillStyle = '#1E3A8A';
      ctx.font = '600 17px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('Type I: e⁻ / H• transfer → O₂•⁻, •OH radicals', ix + 245 + (iw - 245) / 2, iy + 6 + ih * 0.21 + 5);

      roundRectPath(ctx, ix + 245, iy + ih * 0.54, iw - 245, ih * 0.42, 8);
      ctx.fillStyle = C.cyanTint;
      ctx.fill();
      ctx.strokeStyle = C.cyan;
      ctx.stroke();
      ctx.fillStyle = '#155E75';
      ctx.fillText('Type II: Energy transfer → ¹O₂ (Singlet O₂)', ix + 245 + (iw - 245) / 2, iy + ih * 0.54 + ih * 0.21 + 5);
    } else if (def.id === 20) {
      ctx.setLineDash([8, 6]);
      ctx.lineWidth = 3;
      ctx.strokeStyle = C.blue;
      ctx.beginPath();
      ctx.moveTo(ix + 16, iy + 32);
      ctx.lineTo(ix + iw - 16, iy + 32);
      ctx.stroke();

      ctx.strokeStyle = C.cyan;
      ctx.beginPath();
      ctx.moveTo(ix + 16, iy + ih - 32);
      ctx.lineTo(ix + iw - 16, iy + ih - 32);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.textAlign = 'left';
      ctx.fillStyle = C.blue;
      ctx.font = '700 16px "IBM Plex Mono", monospace';
      ctx.fillText('E°(H⁺/H₂) = 0.00 V vs. NHE · Photocathode', ix + 22, iy + 20);
      ctx.fillStyle = C.cyan;
      ctx.fillText('E°(O₂/H₂O) = +1.23 V vs. NHE · Photoanode', ix + 22, iy + ih - 8);

      drawArrow(ctx, ix + iw * 0.5, iy + 38, ix + iw * 0.5, iy + ih - 38, C.amber, 4, 13);
      ctx.fillStyle = C.amber;
      ctx.fillText('ΔE° = 1.23 V + η', ix + iw * 0.5 + 16, iy + ih / 2 + 6);
    }
  }

  ctx.restore();
}

function drawSingleSlide(ctx: CanvasRenderingContext2D, slide: SlideDefinition, elapsedMs: number) {
  ctx.save();
  // Slide 1: Deep Navy Title Slide
  if (slide.layout === 'title') {
    ctx.fillStyle = C.navy;
    ctx.fillRect(0, 0, W, H);

    // Left accent stripe
    ctx.fillStyle = C.amberBright;
    ctx.fillRect(0, 0, 16, H);

    // Right observatory panel
    ctx.fillStyle = C.navyPanel;
    ctx.fillRect(1340, 0, W - 1340, H);
    ctx.strokeStyle = C.navyBorder;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(1340, 0);
    ctx.lineTo(1340, H);
    ctx.stroke();

    // Right energy-manifold graphic
    const rx = 1430;
    [790, 540, 300].forEach((ly, i) => {
      const a = animAlpha(elapsedMs, 200 + i * 140);
      ctx.save();
      ctx.globalAlpha = a;
      ctx.strokeStyle = i === 0 ? '#3B82F6' : i === 1 ? C.cyanLight : C.amberBright;
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(rx, ly);
      ctx.lineTo(rx + 360, ly);
      ctx.stroke();
      ctx.fillStyle = C.white;
      ctx.font = '700 22px "IBM Plex Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText(i === 0 ? 'S₀' : i === 1 ? 'S₁*' : 'S₂*', rx + 382, ly + 8);
      ctx.restore();
    });
    if (elapsedMs > 500) {
      drawArrow(ctx, rx + 95, 780, rx + 95, 315, C.amberBright, 5, 18);
      ctx.fillStyle = C.amberBright;
      ctx.font = '700 22px "IBM Plex Mono", monospace';
      ctx.fillText('hν', rx + 42, 550);
    }
    if (elapsedMs > 700) {
      drawArrow(ctx, rx + 245, 550, rx + 245, 775, C.cyanLight, 4.5, 16);
      ctx.fillStyle = C.cyanLight;
      ctx.font = '600 18px "IBM Plex Mono", monospace';
      ctx.fillText('hν′', rx + 265, 670);
    }

    // Left typography
    ctx.textAlign = 'left';
    const aKicker = animAlpha(elapsedMs, 100);
    ctx.save();
    ctx.globalAlpha = aKicker;
    ctx.fillStyle = C.amberBright;
    ctx.font = '700 20px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(slide.kicker.toUpperCase(), 110, 145);
    ctx.restore();

    const aTitle = animAlpha(elapsedMs, 220);
    ctx.save();
    ctx.globalAlpha = aTitle;
    ctx.translate(0, animRise(elapsedMs, 220, 20));
    ctx.fillStyle = C.white;
    ctx.font = '700 68px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('ENERGETICS OF', 110, 275);
    ctx.fillText('PHOTOCHEMICAL REACTIONS', 110, 358);
    ctx.restore();

    const barProg = easeOutCubic((elapsedMs - 360) / 400);
    ctx.fillStyle = C.cyanLight;
    ctx.fillRect(110, 415, 220 * barProg, 8);

    const aSub = animAlpha(elapsedMs, 450);
    ctx.save();
    ctx.globalAlpha = aSub;
    ctx.fillStyle = C.bgLight;
    ctx.font = '600 34px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(slide.subtitle || '', 110, 495);

    ctx.fillStyle = '#CBD5E1';
    ctx.font = '400 24px "Plus Jakarta Sans", sans-serif';
    drawWrappedText(ctx, slide.callout?.text || '', 110, 565, 1120, 36);
    ctx.restore();

    const aMeta = animAlpha(elapsedMs, 620);
    ctx.save();
    ctx.globalAlpha = aMeta;
    ctx.strokeStyle = C.amberBright;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(110, 760);
    ctx.lineTo(1180, 760);
    ctx.stroke();

    ctx.fillStyle = C.white;
    ctx.font = '700 22px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(
      `Presented by: ${slide.metadata?.presenter}   |   Roll No.: ${slide.metadata?.rollNo}`,
      110,
      810
    );
    ctx.fillStyle = '#CBD5E1';
    ctx.font = '400 21px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(`Presented to: ${slide.metadata?.supervisor}`, 110, 848);

    ctx.fillStyle = C.amberBright;
    ctx.font = '600 18px "IBM Plex Mono", monospace';
    ctx.fillText('ACADEMIC PRESENTATION  ·  01 / 22', 110, 980);
    ctx.restore();

    ctx.restore();
    return;
  }

  // Content Slides (2–22)
  ctx.fillStyle = C.bgLight;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = C.navy;
  ctx.fillRect(0, 0, W, 10);

  // Header
  ctx.textAlign = 'left';
  ctx.save();
  ctx.globalAlpha = animAlpha(elapsedMs, 60);
  ctx.fillStyle = C.cyan;
  ctx.font = '700 17px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(slide.kicker.toUpperCase(), 92, 62);
  ctx.restore();

  ctx.save();
  ctx.globalAlpha = animAlpha(elapsedMs, 120);
  ctx.translate(0, animRise(elapsedMs, 120, 12));
  ctx.fillStyle = C.ink;
  ctx.font = '700 40px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(slide.title, 92, 114);
  ctx.restore();

  const hBar = easeOutCubic((elapsedMs - 180) / 360);
  ctx.fillStyle = C.amber;
  ctx.fillRect(92, 138, 180 * hBar, 5);
  ctx.fillStyle = C.borderLight;
  ctx.fillRect(280, 140, W - 372, 2);

  // Footer
  ctx.strokeStyle = C.border;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(92, 1012);
  ctx.lineTo(W - 92, 1012);
  ctx.stroke();
  ctx.fillStyle = C.muted;
  ctx.font = '500 16px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('MPhil Physical Chemistry  ·  Energetics of Photochemical Reactions', 92, 1046);
  ctx.textAlign = 'right';
  ctx.font = '600 16px "IBM Plex Mono", monospace';
  ctx.fillText(`${String(slide.id).padStart(2, '0')} / 22`, W - 92, 1046);
  ctx.textAlign = 'left';

  // Layouts
  if (slide.layout === 'equation-scale') {
    const eqA = animAlpha(elapsedMs, 220);
    ctx.save();
    ctx.globalAlpha = eqA;
    roundRectPath(ctx, 92, 180, 740, 145, 12);
    ctx.fillStyle = C.navy;
    ctx.fill();
    ctx.textAlign = 'center';
    ctx.fillStyle = C.white;
    ctx.font = '700 44px "IBM Plex Mono", monospace';
    ctx.fillText(slide.equation?.formula || '', 462, 268);
    ctx.restore();

    let vy = 375;
    slide.equation?.variables?.forEach((v, i) => {
      const a = animAlpha(elapsedMs, 300 + i * 70);
      ctx.save();
      ctx.globalAlpha = a;
      ctx.textAlign = 'left';
      ctx.fillStyle = C.ink;
      ctx.font = '700 22px "IBM Plex Mono", monospace';
      ctx.fillText(v.symbol, 104, vy);
      ctx.fillStyle = C.muted;
      ctx.fillText('=', 144, vy);
      ctx.fillStyle = C.body;
      ctx.font = '400 22px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(v.meaning, 178, vy);
      ctx.restore();
      vy += 46;
    });

    if (slide.callout) {
      drawCallout(ctx, slide.callout.label, slide.callout.text, slide.callout.accent, 92, 735, 740, 185, elapsedMs, 480);
    }

    drawDiagramBox(ctx, slide, 872, 180, 956, 515, elapsedMs);

    if (slide.secondaryEquation) {
      ctx.save();
      ctx.globalAlpha = animAlpha(elapsedMs, 520);
      roundRectPath(ctx, 872, 735, 956, 185, 12);
      ctx.fillStyle = C.blueTint;
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = C.blue;
      ctx.stroke();
      ctx.textAlign = 'center';
      ctx.fillStyle = C.blue;
      ctx.font = '700 19px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(slide.secondaryEquation.caption || '', 1350, 795);
      ctx.fillStyle = C.ink;
      ctx.font = '700 36px "IBM Plex Mono", monospace';
      ctx.fillText(slide.secondaryEquation.formula, 1350, 860);
      ctx.restore();
    }
  } else if (slide.layout === 'states-schematic') {
    const cards = slide.cards || [];
    const cw = (W - 184 - 48) / 3;
    cards.forEach((c, idx) => {
      drawCard(ctx, c, 92 + idx * (cw + 24), 175, cw, 225, elapsedMs, 200 + idx * 90);
    });
    drawDiagramBox(ctx, slide, 92, 425, W - 184, 395, elapsedMs);
    if (slide.callout) {
      drawCallout(ctx, slide.callout.label, slide.callout.text, slide.callout.accent, 92, 845, W - 184, 130, elapsedMs, 580);
    }
  } else if (slide.layout === 'diagram-points') {
    drawDiagramBox(ctx, slide, 92, 175, 970, 800, elapsedMs);
    if (slide.points) {
      drawBullets(ctx, slide.points, 1100, 215, 728, 22, 32, elapsedMs, 280);
    }
    if (slide.callout) {
      drawCallout(ctx, slide.callout.label, slide.callout.text, slide.callout.accent, 1100, 780, 728, 195, elapsedMs, 600);
    }
  } else if (slide.layout === 'grid-6') {
    const cards = slide.cards || [];
    const cw = (W - 184 - 48) / 3;
    const ch = 290;
    cards.forEach((c, idx) => {
      const col = idx % 3;
      const row = Math.floor(idx / 3);
      drawCard(ctx, c, 92 + col * (cw + 24), 175 + row * (ch + 28), cw, ch, elapsedMs, 180 + idx * 75);
    });
    if (slide.callout) {
      drawCallout(ctx, slide.callout.label, slide.callout.text, slide.callout.accent, 92, 835, W - 184, 140, elapsedMs, 620);
    }
  } else if (slide.layout === 'cards-3-diagram') {
    if (slide.equation) {
      ctx.save();
      ctx.globalAlpha = animAlpha(elapsedMs, 200);
      roundRectPath(ctx, 92, 175, 835, 115, 10);
      ctx.fillStyle = C.navy;
      ctx.fill();
      ctx.textAlign = 'center';
      ctx.fillStyle = C.white;
      ctx.font = '700 32px "IBM Plex Mono", monospace';
      ctx.fillText(slide.equation.formula, 509, 244);
      ctx.restore();
    }
    if (slide.points) {
      drawBullets(ctx, slide.points, 92, 345, 835, 22, 31, elapsedMs, 260);
    }
    (slide.cards || []).forEach((c, idx) => {
      drawCard(ctx, c, 965, 175 + idx * 148, 863, 132, elapsedMs, 250 + idx * 80);
    });
    drawDiagramBox(ctx, slide, 965, 632, 863, 342, elapsedMs);
  } else if (slide.layout === 'points-diagram') {
    if (slide.points) {
      drawBullets(ctx, slide.points, 92, 215, 760, 23, 33, elapsedMs, 220);
    }
    const hasCallout = Boolean(slide.callout);
    drawDiagramBox(ctx, slide, 892, 175, 936, hasCallout ? 625 : 800, elapsedMs);
    if (slide.callout) {
      drawCallout(ctx, slide.callout.label, slide.callout.text, slide.callout.accent, 892, 825, 936, 150, elapsedMs, 560);
    }
  } else if (slide.layout === 'flow-points-diagram') {
    if (slide.flowSteps) {
      drawFlowSteps(ctx, slide.flowSteps, 92, 175, W - 184, 122, elapsedMs);
    }
    if (slide.points) {
      drawBullets(ctx, slide.points, 92, 350, 845, 21, 30, elapsedMs, 300);
    }
    let ry = 328;
    if (slide.equation) {
      ctx.save();
      ctx.globalAlpha = animAlpha(elapsedMs, 350);
      roundRectPath(ctx, 975, ry, 853, 86, 10);
      ctx.fillStyle = C.navy;
      ctx.fill();
      ctx.textAlign = 'center';
      ctx.fillStyle = C.white;
      ctx.font = '700 24px "IBM Plex Mono", monospace';
      ctx.fillText(slide.equation.formula, 1401, ry + 52);
      ctx.restore();
      ry += 102;
    }
    if (slide.cards && slide.cards.length > 0) {
      if (slide.cards.length === 2) {
        const cw = (853 - 20) / 2;
        slide.cards.forEach((c, idx) => {
          drawCard(ctx, c, 975 + idx * (cw + 20), ry, cw, 155, elapsedMs, 420 + idx * 80);
        });
        ry += 172;
      } else {
        drawCard(ctx, slide.cards[0], 975, ry, 853, 140, elapsedMs, 420);
        ry += 156;
      }
    }
    const calloutH = slide.callout ? 145 : 0;
    const diagH = 975 - ry - (calloutH > 0 ? calloutH + 18 : 0);
    if (diagH >= 150) {
      drawDiagramBox(ctx, slide, 975, ry, 853, diagH, elapsedMs);
    }
    if (slide.callout) {
      drawCallout(ctx, slide.callout.label, slide.callout.text, slide.callout.accent, 975, 830, 853, 145, elapsedMs, 580);
    }
  } else if (slide.layout === 'points-cards-diagram') {
    let ly = 185;
    if (slide.equation) {
      ctx.save();
      ctx.globalAlpha = animAlpha(elapsedMs, 200);
      roundRectPath(ctx, 92, ly, 835, 110, 10);
      ctx.fillStyle = C.navy;
      ctx.fill();
      ctx.textAlign = 'center';
      ctx.fillStyle = C.white;
      ctx.font = '700 22px "IBM Plex Mono", monospace';
      ctx.fillText(slide.equation.formula, 509, ly + 64);
      ctx.restore();
      ly += 145;
    }
    if (slide.points) {
      drawBullets(ctx, slide.points, 92, ly + 15, 835, 22, 31, elapsedMs, 250);
    }
    let ry = 175;
    const cards = slide.cards || [];
    const ch = cards.length >= 3 ? 124 : 155;
    cards.forEach((c, idx) => {
      drawCard(ctx, c, 965, ry, 863, ch, elapsedMs, 280 + idx * 80);
      ry += ch + 16;
    });
    const diagH = 815 - ry;
    if (diagH >= 160) {
      drawDiagramBox(ctx, slide, 965, ry, 863, diagH, elapsedMs);
    }
    if (slide.callout) {
      drawCallout(ctx, slide.callout.label, slide.callout.text, slide.callout.accent, 965, 835, 863, 140, elapsedMs, 580);
    }
  } else if (slide.layout === 'table-summary') {
    const rows = slide.tableRows || [];
    const tx = 92;
    const ty = 180;
    const tw = W - 184;
    const rh = 72;

    ctx.save();
    ctx.globalAlpha = animAlpha(elapsedMs, 200);
    roundRectPath(ctx, tx, ty, tw, rh * (rows.length + 1), 10);
    ctx.fillStyle = C.white;
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = C.border;
    ctx.stroke();

    ctx.fillStyle = C.navy;
    ctx.fillRect(tx, ty, tw, rh);
    ctx.fillStyle = C.white;
    ctx.font = '700 18px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('APPLICATION', tx + 28, ty + 43);
    ctx.fillText('KEY ENERGY PROCESS', tx + 430, ty + 43);
    ctx.fillText('MAIN OUTCOME', tx + 1180, ty + 43);

    rows.forEach((r, i) => {
      const y = ty + (i + 1) * rh;
      if (i % 2 === 1) {
        ctx.fillStyle = C.panelLight;
        ctx.fillRect(tx + 1, y, tw - 2, rh - 1);
      }
      ctx.strokeStyle = C.borderLight;
      ctx.beginPath();
      ctx.moveTo(tx, y);
      ctx.lineTo(tx + tw, y);
      ctx.stroke();

      ctx.fillStyle = C.ink;
      ctx.font = '700 19px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(r.application, tx + 28, y + 43);
      ctx.fillStyle = C.body;
      ctx.font = '400 19px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(r.keyProcess, tx + 430, y + 43);
      ctx.fillStyle = C.cyan;
      ctx.font = '700 19px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(r.mainOutcome, tx + 1180, y + 43);
    });
    ctx.restore();

    if (slide.callout) {
      drawCallout(ctx, slide.callout.label, slide.callout.text, slide.callout.accent, 92, 815, W - 184, 155, elapsedMs, 480);
    }
  } else if (slide.layout === 'references') {
    const refs = slide.references || [];
    refs.forEach((r, idx) => {
      const ry = 175 + idx * 88;
      const a = animAlpha(elapsedMs, 160 + idx * 60);
      ctx.save();
      ctx.globalAlpha = a;
      roundRectPath(ctx, 92, ry, W - 184, 74, 8);
      ctx.fillStyle = idx % 2 === 0 ? C.white : C.panelLight;
      ctx.fill();
      ctx.lineWidth = 1.2;
      ctx.strokeStyle = C.borderLight;
      ctx.stroke();

      ctx.textAlign = 'left';
      ctx.fillStyle = C.cyan;
      ctx.font = '700 16px "IBM Plex Mono", monospace';
      const tag = `[${String(idx + 1).padStart(2, '0')} · ${r.category}]`;
      ctx.fillText(tag, 118, ry + 43);

      ctx.fillStyle = C.ink;
      ctx.font = '400 19px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(r.citation, 330, ry + 43);
      ctx.restore();
    });

    if (slide.callout) {
      drawCallout(ctx, slide.callout.label, slide.callout.text, slide.callout.accent, 92, 830, W - 184, 140, elapsedMs, 560);
    }
  }

  ctx.restore();
}

export function renderCompositeSlideFrame(
  ctx: CanvasRenderingContext2D,
  slide: SlideDefinition,
  elapsedMs: number,
  prevSlide: SlideDefinition | null,
  prevElapsedMs: number,
  transitionType: TransitionKind,
  transitionMs = 450
) {
  ctx.clearRect(0, 0, W, H);

  if (!prevSlide || elapsedMs >= transitionMs) {
    drawSingleSlide(ctx, slide, elapsedMs);
    return;
  }

  const p = easeOutCubic(elapsedMs / transitionMs);

  if (transitionType === 'push') {
    ctx.save();
    ctx.translate(-W * p, 0);
    drawSingleSlide(ctx, prevSlide, prevElapsedMs);
    ctx.restore();

    ctx.save();
    ctx.translate(W * (1 - p), 0);
    drawSingleSlide(ctx, slide, elapsedMs);
    ctx.restore();
  } else if (transitionType === 'wipe' || transitionType === 'cover') {
    drawSingleSlide(ctx, prevSlide, prevElapsedMs);
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, W * p, H);
    ctx.clip();
    drawSingleSlide(ctx, slide, elapsedMs);
    ctx.restore();
  } else if (transitionType === 'split') {
    drawSingleSlide(ctx, prevSlide, prevElapsedMs);
    ctx.save();
    const halfH = (H / 2) * p;
    ctx.beginPath();
    ctx.rect(0, H / 2 - halfH, W, halfH * 2);
    ctx.clip();
    drawSingleSlide(ctx, slide, elapsedMs);
    ctx.restore();
  } else {
    // fade
    drawSingleSlide(ctx, prevSlide, prevElapsedMs);
    ctx.save();
    ctx.globalAlpha = p;
    drawSingleSlide(ctx, slide, elapsedMs);
    ctx.restore();
  }
}
