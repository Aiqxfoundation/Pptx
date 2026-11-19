import PptxGenJS from 'pptxgenjs';
import { SLIDES, type SlideCard, type SlideDefinition, type TransitionKind } from '../data/slidesData';
import { convertPptxBufferToAnimatedPpsx, type SlideAnimationConfig } from './ppsxTimingXml';

export interface PpsxExportOptions {
  paceMultiplier?: number; // 0.75 (fast), 1.0 (standard), 1.4 (deep-dive)
  transitionOverride?: 'auto' | TransitionKind;
  loopShow?: boolean;
  format?: 'ppsx' | 'pptx';
}

const PALETTE = {
  navy: '0A1628',
  navyPanel: '11223D',
  navyBorder: '1E3A5F',
  bgLight: 'F8FAFC',
  white: 'FFFFFF',
  panelLight: 'F1F5F9',
  border: 'CBD5E1',
  borderLight: 'E2E8F0',
  ink: '0F172A',
  body: '334155',
  muted: '64748B',
  blue: '1D4ED8',
  blueTint: 'EFF6FF',
  cyan: '0891B2',
  cyanLight: '38BDF8',
  cyanTint: 'ECFEFF',
  amber: 'D97706',
  amberBright: 'F59E0B',
  amberTint: 'FFFBEB',
  emerald: '059669',
  emeraldTint: 'ECFDF5',
  crimson: 'DC2626',
  crimsonTint: 'FEF2F2',
  slateTint: 'F1F5F9',
};

function accentColors(accent: SlideCard['accent']) {
  switch (accent) {
    case 'blue':
      return { line: PALETTE.blue, fill: PALETTE.blueTint, text: '1E3A8A' };
    case 'cyan':
      return { line: PALETTE.cyan, fill: PALETTE.cyanTint, text: '155E75' };
    case 'amber':
      return { line: PALETTE.amber, fill: PALETTE.amberTint, text: '92400E' };
    case 'emerald':
      return { line: PALETTE.emerald, fill: PALETTE.emeraldTint, text: '065F46' };
    case 'crimson':
      return { line: PALETTE.crimson, fill: PALETTE.crimsonTint, text: '991B1B' };
    default:
      return { line: PALETTE.muted, fill: PALETTE.slateTint, text: PALETTE.ink };
  }
}

function addContentChrome(pptx: PptxGenJS, slide: PptxGenJS.Slide, def: SlideDefinition) {
  slide.background = { color: PALETTE.bgLight };

  // Static subtle top ribbon & footer chrome
  slide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: 13.333,
    h: 0.055,
    fill: { color: PALETTE.navy },
    line: { color: PALETTE.navy, width: 0 },
    objectName: 'STATIC_TopStripe',
  });

  slide.addShape(pptx.ShapeType.line, {
    x: 0.65,
    y: 7.05,
    w: 12.03,
    h: 0,
    line: { color: PALETTE.border, width: 0.75 },
    objectName: 'STATIC_FooterLine',
  });

  slide.addText('MPhil Physical Chemistry  ·  Energetics of Photochemical Reactions', {
    x: 0.65,
    y: 7.1,
    w: 9.5,
    h: 0.3,
    fontFace: 'Calibri',
    fontSize: 9.5,
    color: PALETTE.muted,
    margin: 0,
    objectName: 'STATIC_FooterLeft',
  });

  slide.addText(String(def.id).padStart(2, '0') + ' / 22', {
    x: 11.4,
    y: 7.1,
    w: 1.28,
    h: 0.3,
    fontFace: 'Consolas',
    fontSize: 9.5,
    bold: true,
    color: PALETTE.muted,
    align: 'right',
    margin: 0,
    objectName: 'STATIC_FooterPage',
  });

  // Animated header: kicker, title, accent underline
  slide.addText(def.kicker.toUpperCase(), {
    x: 0.65,
    y: 0.25,
    w: 11.5,
    h: 0.26,
    fontFace: 'Calibri',
    fontSize: 10,
    bold: true,
    charSpacing: 1.8,
    color: PALETTE.cyan,
    margin: 0,
    objectName: 'FADE_Kicker',
  });

  slide.addText(def.title, {
    x: 0.65,
    y: 0.5,
    w: 12.03,
    h: 0.52,
    fontFace: 'Calibri',
    fontSize: 25,
    bold: true,
    color: PALETTE.ink,
    margin: 0,
    objectName: 'RISE_Title',
  });

  slide.addShape(pptx.ShapeType.rect, {
    x: 0.65,
    y: 1.07,
    w: 1.15,
    h: 0.04,
    fill: { color: PALETTE.amber },
    line: { color: PALETTE.amber, width: 0 },
    objectName: 'WIPE_HeaderAccent',
  });

  slide.addShape(pptx.ShapeType.line, {
    x: 1.85,
    y: 1.09,
    w: 10.83,
    h: 0,
    line: { color: PALETTE.borderLight, width: 0.75 },
    objectName: 'STATIC_HeaderDivider',
  });
}

function addCardBox(
  pptx: PptxGenJS,
  slide: PptxGenJS.Slide,
  card: SlideCard,
  box: { x: number; y: number; w: number; h: number },
  animPrefix = 'RISE_Card'
) {
  const colors = accentColors(card.accent);
  slide.addShape(pptx.ShapeType.roundRect, {
    x: box.x,
    y: box.y,
    w: box.w,
    h: box.h,
    rectRadius: 0.06,
    fill: { color: PALETTE.white },
    line: { color: PALETTE.border, width: 0.9 },
    objectName: `${animPrefix}_Bg`,
  });

  // Clean top hairline accent stripe (no thick left-border cliche)
  slide.addShape(pptx.ShapeType.rect, {
    x: box.x + 0.14,
    y: box.y,
    w: Math.max(0.8, box.w - 0.28),
    h: 0.045,
    fill: { color: colors.line },
    line: { color: colors.line, width: 0 },
    objectName: `${animPrefix}_TopBar`,
  });

  const hasTag = Boolean(card.tag);
  const titleText: PptxGenJS.TextProps[] = [
    {
      text: card.title,
      options: { fontFace: 'Calibri', fontSize: 13.5, bold: true, color: PALETTE.ink, breakLine: true },
    },
  ];
  if (hasTag) {
    titleText.push({
      text: card.tag!,
      options: { fontFace: 'Consolas', fontSize: 9.2, bold: true, color: colors.line, breakLine: true },
    });
  }
  titleText.push({
    text: card.body,
    options: { fontFace: 'Calibri', fontSize: 11.5, color: PALETTE.body },
  });

  slide.addText(titleText, {
    x: box.x + 0.16,
    y: box.y + 0.1,
    w: box.w - 0.32,
    h: box.h - 0.16,
    valign: 'top',
    lineSpacingMultiple: 1.15,
    margin: 0,
    objectName: `${animPrefix}_Txt`,
  });
}

function addCalloutBox(
  pptx: PptxGenJS,
  slide: PptxGenJS.Slide,
  label: string,
  text: string,
  accent: SlideCard['accent'],
  box: { x: number; y: number; w: number; h: number }
) {
  const colors = accentColors(accent);
  slide.addShape(pptx.ShapeType.roundRect, {
    x: box.x,
    y: box.y,
    w: box.w,
    h: box.h,
    rectRadius: 0.06,
    fill: { color: colors.fill },
    line: { color: colors.line, width: 0.9 },
    objectName: 'RISE_Callout_Bg',
  });

  slide.addText(
    [
      {
        text: label.toUpperCase() + '\n',
        options: { fontFace: 'Calibri', fontSize: 9.5, bold: true, charSpacing: 1.2, color: colors.line },
      },
      {
        text: text,
        options: { fontFace: 'Calibri', fontSize: 11.5, bold: false, color: PALETTE.ink },
      },
    ],
    {
      x: box.x + 0.18,
      y: box.y + 0.08,
      w: box.w - 0.36,
      h: box.h - 0.14,
      valign: 'middle',
      lineSpacingMultiple: 1.15,
      margin: 0,
      objectName: 'FADE_Callout_Txt',
    }
  );
}

function addBulletsList(
  slide: PptxGenJS.Slide,
  points: string[],
  box: { x: number; y: number; w: number; h: number },
  fontSize = 13
) {
  const items: PptxGenJS.TextProps[] = points.map((pt, idx) => ({
    text: pt,
    options: {
      fontFace: 'Calibri',
      fontSize,
      color: PALETTE.body,
      bullet: { code: '25AA', color: PALETTE.cyan },
      paraSpaceAfter: 8,
      breakLine: idx < points.length - 1,
    },
  }));

  slide.addText(items, {
    x: box.x,
    y: box.y,
    w: box.w,
    h: box.h,
    valign: 'top',
    lineSpacingMultiple: 1.18,
    margin: 0,
    objectName: 'RISE_Bullets',
  });
}

function addFlowPipeline(
  pptx: PptxGenJS,
  slide: PptxGenJS.Slide,
  steps: NonNullable<SlideDefinition['flowSteps']>,
  box: { x: number; y: number; w: number; h: number }
) {
  const n = steps.length;
  const gap = 0.28;
  const nodeW = (box.w - gap * (n - 1)) / n;

  steps.forEach((step, idx) => {
    const colors = accentColors(step.accent);
    const nx = box.x + idx * (nodeW + gap);

    slide.addShape(pptx.ShapeType.roundRect, {
      x: nx,
      y: box.y,
      w: nodeW,
      h: box.h,
      rectRadius: 0.06,
      fill: { color: colors.fill },
      line: { color: colors.line, width: 1.0 },
      objectName: `ZOOM_FlowNode_${idx}`,
    });

    slide.addText(
      [
        {
          text: step.title + (step.subtitle ? '\n' : ''),
          options: { fontFace: 'Calibri', fontSize: 11.5, bold: true, color: PALETTE.ink },
        },
        ...(step.subtitle
          ? [
              {
                text: step.subtitle,
                options: { fontFace: 'Consolas', fontSize: 9, color: colors.line },
              },
            ]
          : []),
      ],
      {
        x: nx + 0.06,
        y: box.y + 0.05,
        w: nodeW - 0.12,
        h: box.h - 0.1,
        align: 'center',
        valign: 'middle',
        margin: 0,
        objectName: `FADE_FlowTxt_${idx}`,
      }
    );

    if (idx < n - 1) {
      slide.addShape(pptx.ShapeType.line, {
        x: nx + nodeW + 0.03,
        y: box.y + box.h / 2,
        w: gap - 0.06,
        h: 0,
        line: { color: PALETTE.amber, width: 2.0, endArrowType: 'triangle' },
        objectName: `WIPE_FlowArrow_${idx}`,
      });
    }
  });
}

function addDiagramFrame(
  pptx: PptxGenJS,
  slide: PptxGenJS.Slide,
  title: string,
  caption: string | undefined,
  box: { x: number; y: number; w: number; h: number }
) {
  slide.addShape(pptx.ShapeType.roundRect, {
    x: box.x,
    y: box.y,
    w: box.w,
    h: box.h,
    rectRadius: 0.07,
    fill: { color: PALETTE.white },
    line: { color: PALETTE.border, width: 1.0 },
    objectName: 'FADE_DiagFrame',
  });

  slide.addText(title.toUpperCase(), {
    x: box.x + 0.18,
    y: box.y + 0.1,
    w: box.w - 0.36,
    h: 0.25,
    fontFace: 'Calibri',
    fontSize: 9.5,
    bold: true,
    charSpacing: 1.3,
    color: PALETTE.cyan,
    margin: 0,
    objectName: 'FADE_DiagTitle',
  });

  if (caption) {
    slide.addText(caption, {
      x: box.x + 0.18,
      y: box.y + box.h - 0.36,
      w: box.w - 0.36,
      h: 0.28,
      fontFace: 'Calibri',
      fontSize: 9.5,
      italic: true,
      color: PALETTE.muted,
      margin: 0,
      objectName: 'FADE_DiagCaption',
    });
  }
}

// Native vector scientific diagrams inside pptxgenjs for key slides
function renderSlideDiagram(
  pptx: PptxGenJS,
  slide: PptxGenJS.Slide,
  def: SlideDefinition,
  box: { x: number; y: number; w: number; h: number }
) {
  addDiagramFrame(pptx, slide, def.diagramTitle || 'Scientific Schematic', def.diagramCaption, box);

  const ix = box.x + 0.25;
  const iy = box.y + 0.42;
  const iw = box.w - 0.5;
  const ih = box.h - 0.85;

  switch (def.id) {
    case 2: {
      // Thermal vs Photochemical Activation Diagram
      // Axes
      slide.addShape(pptx.ShapeType.line, {
        x: ix + 0.3,
        y: iy + 0.15,
        w: 0,
        h: ih - 0.4,
        line: { color: PALETTE.muted, width: 1.2 },
        objectName: 'FADE_AxisY',
      });
      slide.addShape(pptx.ShapeType.line, {
        x: ix + 0.3,
        y: iy + ih - 0.25,
        w: iw - 0.5,
        h: 0,
        line: { color: PALETTE.muted, width: 1.2, endArrowType: 'triangle' },
        objectName: 'WIPE_AxisX',
      });
      // Ground state thermal barrier curve
      slide.addShape(('custGeom' as PptxGenJS.ShapeType), {
        x: ix + 0.55,
        y: iy + ih * 0.42,
        w: iw - 0.9,
        h: ih * 0.42,
        line: { color: PALETTE.blue, width: 2.5 },
        points: [
          { x: 0, y: ih * 0.34, moveTo: true },
          {
            x: (iw - 0.9) * 0.48,
            y: 0.0,
            curve: { type: 'cubic', x1: (iw - 0.9) * 0.22, y1: ih * 0.34, x2: (iw - 0.9) * 0.3, y2: 0.0 },
          },
          {
            x: iw - 0.9,
            y: ih * 0.38,
            curve: { type: 'cubic', x1: (iw - 0.9) * 0.68, y1: 0.0, x2: (iw - 0.9) * 0.78, y2: ih * 0.38 },
          },
        ],
        objectName: 'WIPE_GroundCurve',
      });
      // Excited state surface
      slide.addShape(('custGeom' as PptxGenJS.ShapeType), {
        x: ix + 0.55,
        y: iy + 0.22,
        w: iw - 0.9,
        h: ih * 0.36,
        line: { color: PALETTE.cyan, width: 2.5 },
        points: [
          { x: 0, y: ih * 0.14, moveTo: true },
          {
            x: (iw - 0.9) * 0.52,
            y: ih * 0.24,
            curve: { type: 'cubic', x1: (iw - 0.9) * 0.25, y1: ih * 0.06, x2: (iw - 0.9) * 0.38, y2: ih * 0.28 },
          },
          {
            x: iw - 0.9,
            y: ih * 0.1,
            curve: { type: 'cubic', x1: (iw - 0.9) * 0.72, y1: ih * 0.2, x2: (iw - 0.9) * 0.84, y2: ih * 0.1 },
          },
        ],
        objectName: 'WIPE_ExcitedCurve',
      });
      // Photon excitation arrow
      slide.addShape(pptx.ShapeType.line, {
        x: ix + 1.0,
        y: iy + ih * 0.32,
        w: 0,
        h: ih * 0.43,
        line: { color: PALETTE.amber, width: 2.5, beginArrowType: 'triangle' },
        objectName: 'WIPE_PhotonArrow',
      });
      slide.addText('hν', {
        x: ix + 0.62,
        y: iy + ih * 0.47,
        w: 0.36,
        h: 0.26,
        fontFace: 'Consolas',
        fontSize: 11,
        bold: true,
        color: PALETTE.amber,
        margin: 0,
        objectName: 'FADE_HvLabel',
      });
      slide.addText('Excited Surface (S₁*)', {
        x: ix + iw * 0.45,
        y: iy + 0.14,
        w: 2.2,
        h: 0.25,
        fontFace: 'Calibri',
        fontSize: 10.5,
        bold: true,
        color: PALETTE.cyan,
        margin: 0,
        objectName: 'FADE_S1Lbl',
      });
      slide.addText('Ground Surface (S₀)  ·  ΔG‡ thermal', {
        x: ix + iw * 0.36,
        y: iy + ih * 0.35,
        w: 2.6,
        h: 0.25,
        fontFace: 'Calibri',
        fontSize: 10,
        bold: true,
        color: PALETTE.blue,
        margin: 0,
        objectName: 'FADE_S0Lbl',
      });
      break;
    }

    case 3: {
      // Absorption Spectrum Vibronic Envelope
      slide.addShape(pptx.ShapeType.line, {
        x: ix + 0.4,
        y: iy + 0.12,
        w: 0,
        h: ih - 0.35,
        line: { color: PALETTE.muted, width: 1.2 },
        objectName: 'FADE_SpecY',
      });
      slide.addShape(pptx.ShapeType.line, {
        x: ix + 0.4,
        y: iy + ih - 0.23,
        w: iw - 0.55,
        h: 0,
        line: { color: PALETTE.muted, width: 1.2, endArrowType: 'triangle' },
        objectName: 'WIPE_SpecX',
      });
      slide.addShape(('custGeom' as PptxGenJS.ShapeType), {
        x: ix + 0.55,
        y: iy + 0.22,
        w: iw - 0.85,
        h: ih - 0.46,
        fill: { color: PALETTE.cyanTint },
        line: { color: PALETTE.cyan, width: 2.2 },
        points: [
          { x: 0, y: ih - 0.46, moveTo: true },
          { x: (iw - 0.85) * 0.25, y: (ih - 0.46) * 0.35, curve: { type: 'cubic', x1: (iw - 0.85) * 0.12, y1: ih - 0.46, x2: (iw - 0.85) * 0.18, y2: (ih - 0.46) * 0.35 } },
          { x: (iw - 0.85) * 0.46, y: (ih - 0.46) * 0.08, curve: { type: 'cubic', x1: (iw - 0.85) * 0.33, y1: (ih - 0.46) * 0.35, x2: (iw - 0.85) * 0.38, y2: (ih - 0.46) * 0.08 } },
          { x: (iw - 0.85) * 0.68, y: (ih - 0.46) * 0.42, curve: { type: 'cubic', x1: (iw - 0.85) * 0.54, y1: (ih - 0.46) * 0.08, x2: (iw - 0.85) * 0.6, y2: (ih - 0.46) * 0.42 } },
          { x: iw - 0.85, y: ih - 0.46, curve: { type: 'cubic', x1: (iw - 0.85) * 0.78, y1: (ih - 0.46) * 0.42, x2: (iw - 0.85) * 0.88, y2: ih - 0.46 } },
          { close: true },
        ],
        objectName: 'WIPE_AbsBand',
      });
      slide.addText('ε(λ)  Molar Absorptivity', {
        x: ix + 0.52,
        y: iy + 0.05,
        w: 2.2,
        h: 0.24,
        fontFace: 'Calibri',
        fontSize: 9.5,
        bold: true,
        color: PALETTE.ink,
        margin: 0,
        objectName: 'FADE_SpecLbl1',
      });
      slide.addText('Allowed Vibronic Transitions (0→0, 0→1, 0→2)', {
        x: ix + 0.8,
        y: iy + ih - 0.2,
        w: 3.6,
        h: 0.22,
        fontFace: 'Calibri',
        fontSize: 9.5,
        color: PALETTE.muted,
        margin: 0,
        objectName: 'FADE_SpecLbl2',
      });
      break;
    }

    case 4: {
      // Relative Photon Energy Spectrum Scale
      const bands = [
        { title: 'IR / Longer λ', sub: 'Lower E\n< 1.7 eV', color: PALETTE.blue },
        { title: 'Visible (400–700 nm)', sub: 'Intermediate\n1.8–3.1 eV', color: PALETTE.cyan },
        { title: 'UV (200–400 nm)', sub: 'Higher E\n3.1–6.2 eV', color: PALETTE.amber },
        { title: 'UV-C / Shorter λ', sub: 'Highest E\n> 6.2 eV', color: PALETTE.crimson },
      ];
      const bw = (iw - 0.36) / 4;
      bands.forEach((b, idx) => {
        const bx = ix + idx * (bw + 0.12);
        slide.addShape(pptx.ShapeType.roundRect, {
          x: bx,
          y: iy + 0.35,
          w: bw,
          h: 1.45,
          rectRadius: 0.07,
          fill: { color: b.color },
          line: { color: b.color, width: 0 },
          objectName: `ZOOM_Band_${idx}`,
        });
        slide.addText(
          [
            { text: b.title + '\n', options: { fontFace: 'Calibri', fontSize: 11, bold: true, color: PALETTE.white } },
            { text: b.sub, options: { fontFace: 'Consolas', fontSize: 9.5, color: PALETTE.white } },
          ],
          {
            x: bx + 0.06,
            y: iy + 0.42,
            w: bw - 0.12,
            h: 1.3,
            align: 'center',
            valign: 'middle',
            margin: 0,
            objectName: `FADE_BandTxt_${idx}`,
          }
        );
      });
      slide.addShape(pptx.ShapeType.line, {
        x: ix + 0.1,
        y: iy + 2.15,
        w: iw - 0.2,
        h: 0,
        line: { color: PALETTE.ink, width: 2.0, endArrowType: 'triangle' },
        objectName: 'WIPE_FreqArrow',
      });
      slide.addText('Increasing frequency (ν)  →  Increasing photon energy (E)  ·  Decreasing wavelength (λ)', {
        x: ix + 0.1,
        y: iy + 2.28,
        w: iw - 0.2,
        h: 0.3,
        fontFace: 'Calibri',
        fontSize: 11,
        bold: true,
        color: PALETTE.ink,
        align: 'center',
        margin: 0,
        objectName: 'FADE_FreqCaption',
      });
      break;
    }

    case 5: {
      // Accurate Franck-Condon Morse Potential Energy Wells
      // Axes
      slide.addShape(pptx.ShapeType.line, {
        x: ix + 0.35,
        y: iy + 0.1,
        w: 0,
        h: ih - 0.35,
        line: { color: PALETTE.muted, width: 1.2 },
        objectName: 'FADE_FC_Y',
      });
      slide.addShape(pptx.ShapeType.line, {
        x: ix + 0.35,
        y: iy + ih - 0.25,
        w: iw - 0.5,
        h: 0,
        line: { color: PALETTE.muted, width: 1.2, endArrowType: 'triangle' },
        objectName: 'WIPE_FC_X',
      });
      // S0 Ground Well (left-shifted minimum)
      const wCurve = iw * 0.58;
      const hWell = ih * 0.38;
      slide.addShape(('custGeom' as PptxGenJS.ShapeType), {
        x: ix + 0.65,
        y: iy + ih * 0.48,
        w: wCurve,
        h: hWell,
        line: { color: PALETTE.blue, width: 2.5 },
        points: [
          { x: 0, y: 0, moveTo: true },
          { x: wCurve * 0.42, y: hWell, curve: { type: 'cubic', x1: wCurve * 0.1, y1: hWell * 0.72, x2: wCurve * 0.24, y2: hWell } },
          { x: wCurve, y: hWell * 0.15, curve: { type: 'cubic', x1: wCurve * 0.64, y1: hWell, x2: wCurve * 0.82, y2: hWell * 0.22 } },
        ],
        objectName: 'WIPE_FC_S0Well',
      });
      // S0 vibrational levels
      [0.86, 0.68, 0.5].forEach((frac, idx) => {
        slide.addShape(pptx.ShapeType.line, {
          x: ix + 0.65 + wCurve * (0.22 - idx * 0.05),
          y: iy + ih * 0.48 + hWell * frac,
          w: wCurve * (0.4 + idx * 0.1),
          h: 0,
          line: { color: PALETTE.blue, width: 1.0, dashType: 'dash' },
          objectName: `FADE_FC_S0v_${idx}`,
        });
      });

      // S1* Excited Well (displaced right!)
      slide.addShape(('custGeom' as PptxGenJS.ShapeType), {
        x: ix + 1.45,
        y: iy + 0.15,
        w: wCurve,
        h: hWell,
        line: { color: PALETTE.cyan, width: 2.5 },
        points: [
          { x: 0, y: 0, moveTo: true },
          { x: wCurve * 0.42, y: hWell, curve: { type: 'cubic', x1: wCurve * 0.1, y1: hWell * 0.72, x2: wCurve * 0.24, y2: hWell } },
          { x: wCurve, y: hWell * 0.15, curve: { type: 'cubic', x1: wCurve * 0.64, y1: hWell, x2: wCurve * 0.82, y2: hWell * 0.22 } },
        ],
        objectName: 'WIPE_FC_S1Well',
      });
      // S1 vibrational levels
      [0.86, 0.68, 0.5, 0.34].forEach((frac, idx) => {
        slide.addShape(pptx.ShapeType.line, {
          x: ix + 1.45 + wCurve * (0.22 - idx * 0.04),
          y: iy + 0.15 + hWell * frac,
          w: wCurve * (0.4 + idx * 0.08),
          h: 0,
          line: { color: PALETTE.cyan, width: 1.0, dashType: 'dash' },
          objectName: `FADE_FC_S1v_${idx}`,
        });
      });

      // Vertical Franck-Condon absorption arrow (fixed nuclear coordinate R_e)
      const fcArrowX = ix + 0.65 + wCurve * 0.42;
      slide.addShape(pptx.ShapeType.line, {
        x: fcArrowX,
        y: iy + 0.15 + hWell * 0.5,
        w: 0,
        h: ih * 0.48 + hWell * 0.86 - (0.15 + hWell * 0.5),
        line: { color: PALETTE.amber, width: 2.6, beginArrowType: 'triangle' },
        objectName: 'WIPE_FC_VerticalArrow',
      });

      // Vibrational relaxation arrow down to S1 v'=0
      slide.addShape(pptx.ShapeType.line, {
        x: fcArrowX + 0.15,
        y: iy + 0.15 + hWell * 0.52,
        w: 0.75,
        h: hWell * 0.32,
        line: { color: PALETTE.emerald, width: 1.8, dashType: 'sysDot', endArrowType: 'triangle' },
        objectName: 'WIPE_FC_RelaxArrow',
      });

      slide.addText('Vertical Absorption\n(~10⁻¹⁵ s)', {
        x: fcArrowX - 1.38,
        y: iy + ih * 0.42,
        w: 1.32,
        h: 0.46,
        fontFace: 'Calibri',
        fontSize: 9.5,
        bold: true,
        color: PALETTE.amber,
        align: 'right',
        margin: 0,
        objectName: 'FADE_FC_AbsLbl',
      });
      slide.addText('Vibrational\nRelaxation', {
        x: fcArrowX + 0.96,
        y: iy + 0.15 + hWell * 0.52,
        w: 1.15,
        h: 0.46,
        fontFace: 'Calibri',
        fontSize: 9.5,
        bold: true,
        color: PALETTE.emerald,
        margin: 0,
        objectName: 'FADE_FC_VRLbl',
      });
      slide.addText('S₀ (Ground)', {
        x: ix + 0.65,
        y: iy + ih * 0.82,
        w: 1.2,
        h: 0.25,
        fontFace: 'Calibri',
        fontSize: 10.5,
        bold: true,
        color: PALETTE.blue,
        margin: 0,
        objectName: 'FADE_FC_S0Lbl',
      });
      slide.addText('S₁* (Excited)', {
        x: ix + 1.45 + wCurve * 0.6,
        y: iy + 0.15,
        w: 1.4,
        h: 0.25,
        fontFace: 'Calibri',
        fontSize: 10.5,
        bold: true,
        color: PALETTE.cyan,
        margin: 0,
        objectName: 'FADE_FC_S1Lbl',
      });
      slide.addText('Nuclear Coordinate (R)', {
        x: ix + iw * 0.35,
        y: iy + ih - 0.18,
        w: 2.2,
        h: 0.22,
        fontFace: 'Calibri',
        fontSize: 9.5,
        color: PALETTE.muted,
        margin: 0,
        objectName: 'FADE_FC_XLbl',
      });
      break;
    }

    case 7: {
      // Publication-Grade Jablonski Diagram
      const sX = ix + 0.35;
      const sW = 2.0;
      const tX = ix + 3.15;
      const tW = 1.8;

      // S0, S1, S2 levels
      const yS2 = iy + 0.25;
      const yS1 = iy + 1.35;
      const yT1 = iy + 1.85;
      const yS0 = iy + ih - 0.35;

      // Ground State S0 + vibronic rungs
      slide.addShape(pptx.ShapeType.line, {
        x: sX,
        y: yS0,
        w: sW + 2.8,
        h: 0,
        line: { color: PALETTE.blue, width: 3.0 },
        objectName: 'WIPE_Jab_S0',
      });
      [0.14, 0.26].forEach((dy, i) => {
        slide.addShape(pptx.ShapeType.line, {
          x: sX,
          y: yS0 - dy,
          w: sW,
          h: 0,
          line: { color: PALETTE.border, width: 1.0 },
          objectName: `FADE_Jab_S0v_${i}`,
        });
      });

      // S1 + rungs
      slide.addShape(pptx.ShapeType.line, {
        x: sX,
        y: yS1,
        w: sW,
        h: 0,
        line: { color: PALETTE.cyan, width: 2.8 },
        objectName: 'WIPE_Jab_S1',
      });
      [0.14, 0.28].forEach((dy, i) => {
        slide.addShape(pptx.ShapeType.line, {
          x: sX,
          y: yS1 - dy,
          w: sW,
          h: 0,
          line: { color: PALETTE.border, width: 1.0 },
          objectName: `FADE_Jab_S1v_${i}`,
        });
      });

      // S2 + rung
      slide.addShape(pptx.ShapeType.line, {
        x: sX,
        y: yS2,
        w: sW,
        h: 0,
        line: { color: PALETTE.cyan, width: 2.8 },
        objectName: 'WIPE_Jab_S2',
      });

      // T1 + rungs
      slide.addShape(pptx.ShapeType.line, {
        x: tX,
        y: yT1,
        w: tW,
        h: 0,
        line: { color: PALETTE.amber, width: 2.8 },
        objectName: 'WIPE_Jab_T1',
      });
      [0.14, 0.28].forEach((dy, i) => {
        slide.addShape(pptx.ShapeType.line, {
          x: tX,
          y: yT1 - dy,
          w: tW,
          h: 0,
          line: { color: PALETTE.border, width: 1.0 },
          objectName: `FADE_Jab_T1v_${i}`,
        });
      });

      // Labels for states
      slide.addText('S₀', { x: sX - 0.35, y: yS0 - 0.14, w: 0.34, h: 0.25, fontFace: 'Calibri', fontSize: 12, bold: true, color: PALETTE.blue, margin: 0, objectName: 'FADE_Jab_S0L' });
      slide.addText('S₁', { x: sX - 0.35, y: yS1 - 0.14, w: 0.34, h: 0.25, fontFace: 'Calibri', fontSize: 12, bold: true, color: PALETTE.cyan, margin: 0, objectName: 'FADE_Jab_S1L' });
      slide.addText('S₂', { x: sX - 0.35, y: yS2 - 0.14, w: 0.34, h: 0.25, fontFace: 'Calibri', fontSize: 12, bold: true, color: PALETTE.cyan, margin: 0, objectName: 'FADE_Jab_S2L' });
      slide.addText('T₁', { x: tX + tW + 0.06, y: yT1 - 0.14, w: 0.34, h: 0.25, fontFace: 'Calibri', fontSize: 12, bold: true, color: PALETTE.amber, margin: 0, objectName: 'FADE_Jab_T1L' });

      // Absorption arrows
      slide.addShape(pptx.ShapeType.line, {
        x: sX + 0.42,
        y: yS2,
        w: 0,
        h: yS0 - yS2,
        line: { color: PALETTE.amber, width: 2.4, beginArrowType: 'triangle' },
        objectName: 'WIPE_Jab_Abs',
      });
      slide.addText('Absorption\n(hν)', {
        x: sX + 0.02,
        y: (yS0 + yS1) / 2 - 0.15,
        w: 0.82,
        h: 0.45,
        fontFace: 'Calibri',
        fontSize: 9.5,
        bold: true,
        color: PALETTE.amber,
        margin: 0,
        objectName: 'FADE_Jab_AbsL',
      });

      // Internal Conversion S2 -> S1 (dashed)
      slide.addShape(pptx.ShapeType.line, {
        x: sX + 0.88,
        y: yS2 + 0.04,
        w: 0,
        h: yS1 - yS2 - 0.34,
        line: { color: PALETTE.emerald, width: 2.0, dashType: 'sysDot', endArrowType: 'triangle' },
        objectName: 'WIPE_Jab_IC',
      });
      slide.addText('IC / VR', {
        x: sX + 0.94,
        y: (yS2 + yS1) / 2 - 0.2,
        w: 0.75,
        h: 0.24,
        fontFace: 'Calibri',
        fontSize: 9.5,
        bold: true,
        color: PALETTE.emerald,
        margin: 0,
        objectName: 'FADE_Jab_ICL',
      });

      // Fluorescence S1 -> S0
      slide.addShape(pptx.ShapeType.line, {
        x: sX + 1.35,
        y: yS1 + 0.03,
        w: 0,
        h: yS0 - yS1 - 0.05,
        line: { color: PALETTE.blue, width: 2.4, endArrowType: 'triangle' },
        objectName: 'WIPE_Jab_Fluor',
      });
      slide.addText('Fluorescence\n(~10⁻⁹ s)', {
        x: sX + 1.42,
        y: (yS0 + yS1) / 2 - 0.15,
        w: 1.05,
        h: 0.45,
        fontFace: 'Calibri',
        fontSize: 9.5,
        bold: true,
        color: PALETTE.blue,
        margin: 0,
        objectName: 'FADE_Jab_FluorL',
      });

      // Intersystem Crossing S1 -> T1
      slide.addShape(pptx.ShapeType.line, {
        x: sX + sW + 0.05,
        y: yS1,
        w: tX - (sX + sW) - 0.1,
        h: yT1 - yS1 - 0.28,
        line: { color: PALETTE.amber, width: 2.0, dashType: 'dash', endArrowType: 'triangle' },
        objectName: 'WIPE_Jab_ISC',
      });
      slide.addText('ISC', {
        x: sX + sW + 0.25,
        y: yS1 - 0.22,
        w: 0.5,
        h: 0.22,
        fontFace: 'Calibri',
        fontSize: 9.5,
        bold: true,
        color: PALETTE.amber,
        align: 'center',
        margin: 0,
        objectName: 'FADE_Jab_ISCL',
      });

      // Phosphorescence T1 -> S0
      slide.addShape(pptx.ShapeType.line, {
        x: tX + 0.85,
        y: yT1 + 0.03,
        w: 0,
        h: yS0 - yT1 - 0.05,
        line: { color: PALETTE.crimson, width: 2.4, endArrowType: 'triangle' },
        objectName: 'WIPE_Jab_Phos',
      });
      slide.addText('Phosphorescence\n(~10⁻³–10⁰ s)', {
        x: tX + 0.94,
        y: (yS0 + yT1) / 2 - 0.15,
        w: 1.25,
        h: 0.45,
        fontFace: 'Calibri',
        fontSize: 9.5,
        bold: true,
        color: PALETTE.crimson,
        margin: 0,
        objectName: 'FADE_Jab_PhosL',
      });
      break;
    }

    case 11: {
      // Potential Energy Surface & Conical Intersection
      slide.addShape(pptx.ShapeType.line, {
        x: ix + 0.35,
        y: iy + 0.1,
        w: 0,
        h: ih - 0.35,
        line: { color: PALETTE.muted, width: 1.2 },
        objectName: 'FADE_PES_Y',
      });
      slide.addShape(pptx.ShapeType.line, {
        x: ix + 0.35,
        y: iy + ih - 0.25,
        w: iw - 0.5,
        h: 0,
        line: { color: PALETTE.muted, width: 1.2, endArrowType: 'triangle' },
        objectName: 'WIPE_PES_X',
      });
      const cw = iw - 0.9;
      // S0 curve with thermal barrier + product well
      slide.addShape(('custGeom' as PptxGenJS.ShapeType), {
        x: ix + 0.55,
        y: iy + ih * 0.45,
        w: cw,
        h: ih * 0.42,
        line: { color: PALETTE.blue, width: 2.6 },
        points: [
          { x: 0, y: ih * 0.34, moveTo: true },
          { x: cw * 0.42, y: ih * 0.02, curve: { type: 'cubic', x1: cw * 0.18, y1: ih * 0.34, x2: cw * 0.28, y2: ih * 0.02 } },
          { x: cw * 0.72, y: ih * 0.38, curve: { type: 'cubic', x1: cw * 0.54, y1: ih * 0.02, x2: cw * 0.6, y2: ih * 0.38 } },
          { x: cw, y: ih * 0.3, curve: { type: 'cubic', x1: cw * 0.84, y1: ih * 0.38, x2: cw * 0.92, y2: ih * 0.3 } },
        ],
        objectName: 'WIPE_PES_S0',
      });
      // S1 curve funneling down to conical intersection near S0 peak!
      slide.addShape(('custGeom' as PptxGenJS.ShapeType), {
        x: ix + 0.55,
        y: iy + 0.16,
        w: cw,
        h: ih * 0.48,
        line: { color: PALETTE.cyan, width: 2.6 },
        points: [
          { x: 0, y: ih * 0.12, moveTo: true },
          { x: cw * 0.44, y: ih * 0.32, curve: { type: 'cubic', x1: cw * 0.2, y1: ih * 0.08, x2: cw * 0.32, y2: ih * 0.32 } },
          { x: cw * 0.88, y: ih * 0.08, curve: { type: 'cubic', x1: cw * 0.58, y1: ih * 0.32, x2: cw * 0.72, y2: ih * 0.08 } },
        ],
        objectName: 'WIPE_PES_S1',
      });
      // Conical intersection highlight
      slide.addShape(pptx.ShapeType.ellipse, {
        x: ix + 0.55 + cw * 0.44 - 0.16,
        y: iy + ih * 0.47 - 0.16,
        w: 0.32,
        h: 0.32,
        fill: { color: PALETTE.amberTint },
        line: { color: PALETTE.amber, width: 1.8 },
        objectName: 'ZOOM_PES_CI',
      });
      // Photoexcitation arrow
      slide.addShape(pptx.ShapeType.line, {
        x: ix + 0.88,
        y: iy + 0.16 + ih * 0.14,
        w: 0,
        h: ih * 0.48,
        line: { color: PALETTE.amber, width: 2.4, beginArrowType: 'triangle' },
        objectName: 'WIPE_PES_Exc',
      });
      slide.addText('Photoexcitation', {
        x: ix + 0.46,
        y: iy + 0.02,
        w: 1.35,
        h: 0.24,
        fontFace: 'Calibri',
        fontSize: 9.5,
        bold: true,
        color: PALETTE.amber,
        margin: 0,
        objectName: 'FADE_PES_ExcL',
      });
      slide.addText('Conical Intersection (CI)', {
        x: ix + 0.55 + cw * 0.44 - 0.9,
        y: iy + ih * 0.47 - 0.46,
        w: 2.0,
        h: 0.24,
        fontFace: 'Calibri',
        fontSize: 10,
        bold: true,
        color: PALETTE.amber,
        align: 'center',
        margin: 0,
        objectName: 'FADE_PES_CIL',
      });
      slide.addText('Excited-State Surface', {
        x: ix + 0.55 + cw * 0.62,
        y: iy + 0.16,
        w: 1.8,
        h: 0.24,
        fontFace: 'Calibri',
        fontSize: 10,
        bold: true,
        color: PALETTE.cyan,
        margin: 0,
        objectName: 'FADE_PES_S1L',
      });
      slide.addText('Ground-State Surface', {
        x: ix + 0.55,
        y: iy + ih * 0.82,
        w: 1.8,
        h: 0.24,
        fontFace: 'Calibri',
        fontSize: 10,
        bold: true,
        color: PALETTE.blue,
        margin: 0,
        objectName: 'FADE_PES_S0L',
      });
      break;
    }

    case 15: {
      // Semiconductor Band-Gap Model
      const bX = ix + 0.6;
      const bW = iw - 1.5;
      // CB box
      slide.addShape(pptx.ShapeType.rect, {
        x: bX,
        y: iy + 0.22,
        w: bW,
        h: 0.72,
        fill: { color: PALETTE.blueTint },
        line: { color: PALETTE.blue, width: 1.4 },
        objectName: 'ZOOM_SC_CB',
      });
      slide.addText('Conduction Band (CB)  ·  Reduction (e⁻)', {
        x: bX + 0.1,
        y: iy + 0.3,
        w: bW - 0.2,
        h: 0.56,
        fontFace: 'Calibri',
        fontSize: 12,
        bold: true,
        color: PALETTE.blue,
        align: 'center',
        valign: 'middle',
        margin: 0,
        objectName: 'FADE_SC_CBTxt',
      });
      // VB box
      slide.addShape(pptx.ShapeType.rect, {
        x: bX,
        y: iy + ih - 0.98,
        w: bW,
        h: 0.72,
        fill: { color: PALETTE.cyanTint },
        line: { color: PALETTE.cyan, width: 1.4 },
        objectName: 'ZOOM_SC_VB',
      });
      slide.addText('Valence Band (VB)  ·  Oxidation (h⁺)', {
        x: bX + 0.1,
        y: iy + ih - 0.9,
        w: bW - 0.2,
        h: 0.56,
        fontFace: 'Calibri',
        fontSize: 12,
        bold: true,
        color: PALETTE.cyan,
        align: 'center',
        valign: 'middle',
        margin: 0,
        objectName: 'FADE_SC_VBTxt',
      });
      // Excitation arrow
      slide.addShape(pptx.ShapeType.line, {
        x: bX + bW * 0.35,
        y: iy + 0.98,
        w: 0,
        h: ih - 2.0,
        line: { color: PALETTE.amber, width: 2.6, beginArrowType: 'triangle' },
        objectName: 'WIPE_SC_Exc',
      });
      slide.addText('hν ≥ E_g', {
        x: bX + bW * 0.08,
        y: iy + ih / 2 - 0.16,
        w: 1.0,
        h: 0.3,
        fontFace: 'Consolas',
        fontSize: 11,
        bold: true,
        color: PALETTE.amber,
        align: 'right',
        margin: 0,
        objectName: 'FADE_SC_Eg',
      });
      // Recombination arrow
      slide.addShape(pptx.ShapeType.line, {
        x: bX + bW * 0.68,
        y: iy + 0.98,
        w: 0,
        h: ih - 2.0,
        line: { color: PALETTE.crimson, width: 1.8, dashType: 'dash', endArrowType: 'triangle' },
        objectName: 'WIPE_SC_Rec',
      });
      slide.addText('Recombination\n(loss)', {
        x: bX + bW * 0.72,
        y: iy + ih / 2 - 0.22,
        w: 1.2,
        h: 0.44,
        fontFace: 'Calibri',
        fontSize: 9.5,
        color: PALETTE.crimson,
        margin: 0,
        objectName: 'FADE_SC_RecL',
      });
      // e- and h+ badges
      slide.addText('e⁻', { x: bX + bW + 0.12, y: iy + 0.38, w: 0.45, h: 0.38, fontFace: 'Consolas', fontSize: 14, bold: true, color: PALETTE.blue, margin: 0, objectName: 'ZOOM_SC_e' });
      slide.addText('h⁺', { x: bX + bW + 0.12, y: iy + ih - 0.82, w: 0.45, h: 0.38, fontFace: 'Consolas', fontSize: 14, bold: true, color: PALETTE.cyan, margin: 0, objectName: 'ZOOM_SC_h' });
      break;
    }

    default: {
      // Clean schematic visual tailored for each remaining slide's diagram slot
      renderAdditionalNativeDiagram(pptx, slide, def, { x: ix, y: iy, w: iw, h: ih });
      break;
    }
  }
}

function renderAdditionalNativeDiagram(
  pptx: PptxGenJS,
  slide: PptxGenJS.Slide,
  def: SlideDefinition,
  box: { x: number; y: number; w: number; h: number }
) {
  const { x: ix, y: iy, w: iw, h: ih } = box;

  if (def.id === 6) {
    // Slide 6: S0, S1, S2 & T1 energy ladders
    const leftX = ix + 0.4;
    const rightX = ix + iw * 0.54;
    const lw = iw * 0.36;

    const levels = [
      { x: leftX, y: iy + ih - 0.22, lbl: 'S₀ (↑↓)', col: PALETTE.blue },
      { x: leftX, y: iy + ih * 0.46, lbl: 'S₁ (↑↓)', col: PALETTE.cyan },
      { x: leftX, y: iy + 0.18, lbl: 'S₂ (↑↓)', col: PALETTE.cyan },
      { x: rightX, y: iy + ih - 0.22, lbl: 'S₀ (↑↓)', col: PALETTE.blue },
      { x: rightX, y: iy + ih * 0.56, lbl: 'T₁ (↑↑)', col: PALETTE.amber },
      { x: rightX, y: iy + ih * 0.32, lbl: 'S₁ (↑↓)', col: PALETTE.cyan },
    ];
    levels.forEach((lv, i) => {
      slide.addShape(pptx.ShapeType.line, {
        x: lv.x,
        y: lv.y,
        w: lw,
        h: 0,
        line: { color: lv.col, width: 3.0 },
        objectName: `WIPE_StateLvl_${i}`,
      });
      slide.addText(lv.lbl, {
        x: lv.x + lw + 0.08,
        y: lv.y - 0.14,
        w: 0.95,
        h: 0.28,
        fontFace: 'Consolas',
        fontSize: 10.5,
        bold: true,
        color: lv.col,
        margin: 0,
        objectName: `FADE_StateLbl_${i}`,
      });
    });
  } else if (def.id === 9) {
    // Photoisomerization cis <-> trans & Photodissociation schematic
    const halfH = (ih - 0.16) / 2;
    slide.addShape(pptx.ShapeType.roundRect, {
      x: ix,
      y: iy,
      w: iw,
      h: halfH,
      rectRadius: 0.05,
      fill: { color: PALETTE.cyanTint },
      line: { color: PALETTE.cyan, width: 0.9 },
      objectName: 'RISE_Ex1_Box',
    });
    slide.addText('Photoisomerization:  cis-Isomer  +  hν  →  [π→π* Twisted S₁*]  →  trans-Isomer', {
      x: ix + 0.15,
      y: iy + 0.08,
      w: iw - 0.3,
      h: halfH - 0.16,
      fontFace: 'Calibri',
      fontSize: 11,
      bold: true,
      color: PALETTE.ink,
      valign: 'middle',
      margin: 0,
      objectName: 'FADE_Ex1_Txt',
    });

    slide.addShape(pptx.ShapeType.roundRect, {
      x: ix,
      y: iy + halfH + 0.16,
      w: iw,
      h: halfH,
      rectRadius: 0.05,
      fill: { color: PALETTE.amberTint },
      line: { color: PALETTE.amber, width: 0.9 },
      objectName: 'RISE_Ex2_Box',
    });
    slide.addText('Photodissociation:  A—B  +  hν  →  (A—B)* [Reduced Bond Order]  →  A•  +  B•', {
      x: ix + 0.15,
      y: iy + halfH + 0.24,
      w: iw - 0.3,
      h: halfH - 0.16,
      fontFace: 'Calibri',
      fontSize: 11,
      bold: true,
      color: PALETTE.ink,
      valign: 'middle',
      margin: 0,
      objectName: 'FADE_Ex2_Txt',
    });
  } else if (def.id === 10) {
    // Energy budget waterfall bars
    const bars = [
      { label: 'Absorbed Photon Energy (hν)', w: iw * 0.92, col: PALETTE.amber },
      { label: 'After Vibrational Relaxation / IC', w: iw * 0.68, col: PALETTE.cyan },
      { label: 'Available Reactive State Energy', w: iw * 0.54, col: PALETTE.blue },
      { label: 'Product Stored Energy (ΔG > 0 or ΔG‡)', w: iw * 0.38, col: PALETTE.emerald },
    ];
    bars.forEach((b, i) => {
      const by = iy + i * 0.55;
      slide.addText(b.label, {
        x: ix,
        y: by,
        w: iw,
        h: 0.2,
        fontFace: 'Calibri',
        fontSize: 9.5,
        bold: true,
        color: PALETTE.body,
        margin: 0,
        objectName: `FADE_BudgetL_${i}`,
      });
      slide.addShape(pptx.ShapeType.roundRect, {
        x: ix,
        y: by + 0.21,
        w: b.w,
        h: 0.22,
        rectRadius: 0.04,
        fill: { color: b.col },
        line: { color: b.col, width: 0 },
        objectName: `WIPE_BudgetB_${i}`,
      });
    });
  } else if (def.id === 12) {
    // Quantum yield regimes bar
    const rows = [
      { lbl: 'Φ < 1', desc: 'Competing relaxation / quenching', w: iw * 0.45, col: PALETTE.crimson },
      { lbl: 'Φ = 1', desc: 'Ideal 1:1 primary photochemical step', w: iw * 0.7, col: PALETTE.cyan },
      { lbl: 'Φ > 1', desc: 'Photoinitiated radical chain propagation', w: iw * 0.96, col: PALETTE.emerald },
    ];
    rows.forEach((r, i) => {
      const ry = iy + i * 0.62;
      slide.addText(`${r.lbl}   —   ${r.desc}`, {
        x: ix,
        y: ry,
        w: iw,
        h: 0.22,
        fontFace: 'Calibri',
        fontSize: 10,
        bold: true,
        color: PALETTE.ink,
        margin: 0,
        objectName: `FADE_QYL_${i}`,
      });
      slide.addShape(pptx.ShapeType.roundRect, {
        x: ix,
        y: ry + 0.24,
        w: r.w,
        h: 0.22,
        rectRadius: 0.04,
        fill: { color: r.col },
        line: { color: r.col, width: 0 },
        objectName: `WIPE_QYB_${i}`,
      });
    });
  } else if (def.id === 14) {
    // Photosynthetic Z-Scheme Redox Ladder
    const pts = [
      { x: ix + 0.2, y: iy + ih - 0.55, w: 1.0, lbl: 'H₂O → O₂\n+0.82 V', col: PALETTE.blue },
      { x: ix + 1.15, y: iy + 0.22, w: 1.0, lbl: 'P680*\n−0.8 V', col: PALETTE.cyan },
      { x: ix + 2.35, y: iy + ih * 0.52, w: 1.1, lbl: 'Cyt b₆f / PC\n+0.35 V', col: PALETTE.amber },
      { x: ix + 3.65, y: iy + 0.08, w: 1.0, lbl: 'P700*\n−1.2 V', col: PALETTE.cyan },
      { x: ix + 4.75, y: iy + ih * 0.34, w: 1.0, lbl: 'NADPH\n−0.32 V', col: PALETTE.emerald },
    ];
    pts.forEach((p, i) => {
      slide.addShape(pptx.ShapeType.roundRect, {
        x: p.x,
        y: p.y,
        w: p.w,
        h: 0.46,
        rectRadius: 0.05,
        fill: { color: PALETTE.white },
        line: { color: p.col, width: 1.3 },
        objectName: `ZOOM_Z_${i}`,
      });
      slide.addText(p.lbl, {
        x: p.x + 0.04,
        y: p.y + 0.03,
        w: p.w - 0.08,
        h: 0.4,
        fontFace: 'Consolas',
        fontSize: 8.5,
        bold: true,
        color: p.col,
        align: 'center',
        valign: 'middle',
        margin: 0,
        objectName: `FADE_ZT_${i}`,
      });
    });
  } else if (def.id === 16) {
    // PV Junction schematic
    const layers = [
      { x: ix + 0.15, w: 1.1, title: 'Front\nContact', col: PALETTE.muted, fill: PALETTE.slateTint },
      { x: ix + 1.35, w: 1.5, title: 'n-Type\n(e⁻ transport)', col: PALETTE.blue, fill: PALETTE.blueTint },
      { x: ix + 2.95, w: 1.5, title: 'p-Type\n(h⁺ transport)', col: PALETTE.cyan, fill: PALETTE.cyanTint },
      { x: ix + 4.55, w: 1.1, title: 'Back\nContact', col: PALETTE.emerald, fill: PALETTE.emeraldTint },
    ];
    layers.forEach((l, i) => {
      slide.addShape(pptx.ShapeType.rect, {
        x: l.x,
        y: iy + 0.35,
        w: l.w,
        h: ih - 0.7,
        fill: { color: l.fill },
        line: { color: l.col, width: 1.2 },
        objectName: `ZOOM_PV_${i}`,
      });
      slide.addText(l.title, {
        x: l.x + 0.05,
        y: iy + 0.4,
        w: l.w - 0.1,
        h: ih - 0.8,
        fontFace: 'Calibri',
        fontSize: 10.5,
        bold: true,
        color: PALETTE.ink,
        align: 'center',
        valign: 'middle',
        margin: 0,
        objectName: `FADE_PVT_${i}`,
      });
    });
  } else if (def.id === 17) {
    // Photochemical Synthesis Reaction Schematic
    slide.addShape(pptx.ShapeType.roundRect, {
      x: ix + 0.2,
      y: iy + 0.2,
      w: iw - 0.4,
      h: ih - 0.4,
      rectRadius: 0.06,
      fill: { color: PALETTE.blueTint },
      line: { color: PALETTE.blue, width: 1.0 },
      objectName: 'ZOOM_SynthBox',
    });
    slide.addText(
      'R₁=R₂  +  R₃=R₄  +  hν (Sensitizer)  →  [Excited Triplet / Exciplex]  →  Cyclobutane / Photoredox Product',
      {
        x: ix + 0.4,
        y: iy + 0.35,
        w: iw - 0.8,
        h: ih - 0.7,
        fontFace: 'Calibri',
        fontSize: 11.5,
        bold: true,
        color: PALETTE.ink,
        align: 'center',
        valign: 'middle',
        margin: 0,
        objectName: 'FADE_SynthTxt',
      }
    );
  } else if (def.id === 18) {
    // Tropospheric Ozone Cycle
    const nodes = [
      { x: ix + 0.15, title: 'NO₂ + hν', col: PALETTE.amber, fill: PALETTE.amberTint },
      { x: ix + 2.05, title: 'NO + O(³P)', col: PALETTE.blue, fill: PALETTE.blueTint },
      { x: ix + 3.95, title: 'O₃ + M', col: PALETTE.cyan, fill: PALETTE.cyanTint },
    ];
    nodes.forEach((n, i) => {
      slide.addShape(pptx.ShapeType.roundRect, {
        x: n.x,
        y: iy + 0.38,
        w: 1.65,
        h: 0.78,
        rectRadius: 0.06,
        fill: { color: n.fill },
        line: { color: n.col, width: 1.2 },
        objectName: `ZOOM_Atm_${i}`,
      });
      slide.addText(n.title, {
        x: n.x + 0.05,
        y: iy + 0.42,
        w: 1.55,
        h: 0.7,
        fontFace: 'Consolas',
        fontSize: 11,
        bold: true,
        color: PALETTE.ink,
        align: 'center',
        valign: 'middle',
        margin: 0,
        objectName: `FADE_AtmT_${i}`,
      });
      if (i < 2) {
        slide.addShape(pptx.ShapeType.line, {
          x: n.x + 1.68,
          y: iy + 0.77,
          w: 0.34,
          h: 0,
          line: { color: PALETTE.amber, width: 2.0, endArrowType: 'triangle' },
          objectName: `WIPE_AtmA_${i}`,
        });
      }
    });
  } else if (def.id === 19) {
    // PDT Type I & II branching
    slide.addShape(pptx.ShapeType.roundRect, {
      x: ix + 0.2,
      y: iy + ih * 0.28,
      w: 1.45,
      h: 0.68,
      rectRadius: 0.06,
      fill: { color: PALETTE.amberTint },
      line: { color: PALETTE.amber, width: 1.2 },
      objectName: 'ZOOM_PDT_PS',
    });
    slide.addText('³PS* (Triplet)', {
      x: ix + 0.24,
      y: iy + ih * 0.28 + 0.05,
      w: 1.37,
      h: 0.58,
      fontFace: 'Calibri',
      fontSize: 11,
      bold: true,
      color: PALETTE.ink,
      align: 'center',
      valign: 'middle',
      margin: 0,
      objectName: 'FADE_PDT_PST',
    });
    slide.addShape(pptx.ShapeType.roundRect, {
      x: ix + 2.25,
      y: iy + 0.08,
      w: iw - 2.45,
      h: 0.54,
      rectRadius: 0.05,
      fill: { color: PALETTE.blueTint },
      line: { color: PALETTE.blue, width: 1.0 },
      objectName: 'RISE_PDT_T1',
    });
    slide.addText('Type I: e⁻ / H• transfer → O₂•⁻, •OH radicals', {
      x: ix + 2.35,
      y: iy + 0.12,
      w: iw - 2.65,
      h: 0.46,
      fontFace: 'Calibri',
      fontSize: 10.5,
      bold: true,
      color: PALETTE.blue,
      valign: 'middle',
      margin: 0,
      objectName: 'FADE_PDT_T1T',
    });
    slide.addShape(pptx.ShapeType.roundRect, {
      x: ix + 2.25,
      y: iy + ih - 0.62,
      w: iw - 2.45,
      h: 0.54,
      rectRadius: 0.05,
      fill: { color: PALETTE.cyanTint },
      line: { color: PALETTE.cyan, width: 1.0 },
      objectName: 'RISE_PDT_T2',
    });
    slide.addText('Type II: Energy transfer → ¹O₂ (Singlet Oxygen)', {
      x: ix + 2.35,
      y: iy + ih - 0.58,
      w: iw - 2.65,
      h: 0.46,
      fontFace: 'Calibri',
      fontSize: 10.5,
      bold: true,
      color: PALETTE.cyan,
      valign: 'middle',
      margin: 0,
      objectName: 'FADE_PDT_T2T',
    });
  } else if (def.id === 20) {
    // PEC Water Splitting Band Alignment
    slide.addShape(pptx.ShapeType.line, {
      x: ix + 0.3,
      y: iy + 0.25,
      w: iw - 0.6,
      h: 0,
      line: { color: PALETTE.blue, width: 2.2, dashType: 'dash' },
      objectName: 'WIPE_PEC_H2',
    });
    slide.addText('E°(H⁺/H₂) = 0.00 V vs. NHE  (Photocathode: H₂ evolution)', {
      x: ix + 0.3,
      y: iy + 0.02,
      w: iw - 0.6,
      h: 0.22,
      fontFace: 'Consolas',
      fontSize: 9.2,
      bold: true,
      color: PALETTE.blue,
      margin: 0,
      objectName: 'FADE_PEC_H2L',
    });
    slide.addShape(pptx.ShapeType.line, {
      x: ix + 0.3,
      y: iy + ih - 0.32,
      w: iw - 0.6,
      h: 0,
      line: { color: PALETTE.cyan, width: 2.2, dashType: 'dash' },
      objectName: 'WIPE_PEC_O2',
    });
    slide.addText('E°(O₂/H₂O) = +1.23 V vs. NHE  (Photoanode: O₂ evolution)', {
      x: ix + 0.3,
      y: iy + ih - 0.26,
      w: iw - 0.6,
      h: 0.22,
      fontFace: 'Consolas',
      fontSize: 9.2,
      bold: true,
      color: PALETTE.cyan,
      margin: 0,
      objectName: 'FADE_PEC_O2L',
    });
    slide.addShape(pptx.ShapeType.line, {
      x: ix + iw / 2,
      y: iy + 0.3,
      w: 0,
      h: ih - 0.68,
      line: { color: PALETTE.amber, width: 2.4, beginArrowType: 'triangle', endArrowType: 'triangle' },
      objectName: 'WIPE_PEC_Gap',
    });
    slide.addText('ΔE° = 1.23 V + η (overpotential)', {
      x: ix + iw / 2 + 0.14,
      y: iy + ih / 2 - 0.15,
      w: 2.5,
      h: 0.3,
      fontFace: 'Consolas',
      fontSize: 9.5,
      bold: true,
      color: PALETTE.amber,
      margin: 0,
      objectName: 'FADE_PEC_GapL',
    });
  }
}

export async function buildPpsxUint8Array(options?: PpsxExportOptions): Promise<Uint8Array> {
  const pace = options?.paceMultiplier ?? 1.0;
  const transitionOverride = options?.transitionOverride ?? 'auto';
  const loopShow = options?.loopShow ?? false;

  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_WIDE';
  pptx.author = 'Saba Noor';
  pptx.company = 'MPhil Physical Chemistry';
  pptx.subject = 'Energetics of Photochemical Reactions';
  pptx.title = 'Energetics of Photochemical Reactions — MPhil Seminar';

  const animConfigs: SlideAnimationConfig[] = [];

  for (const def of SLIDES) {
    const slide = pptx.addSlide();
    const durationMs = Math.round(def.durationSec * 1000 * pace);
    const transition: TransitionKind =
      transitionOverride === 'auto' ? def.transition : transitionOverride;

    animConfigs.push({
      slideNumber: def.id,
      durationMs,
      transition,
      loopShow,
    });

    // SLIDE 1: Hero Title Slide (Observatory Navy)
    if (def.layout === 'title') {
      slide.background = { color: PALETTE.navy };

      // Static architectural vertical accent & coordinate grid
      slide.addShape(pptx.ShapeType.rect, {
        x: 0,
        y: 0,
        w: 0.12,
        h: 7.5,
        fill: { color: PALETTE.amberBright },
        line: { color: PALETTE.amberBright, width: 0 },
        objectName: 'STATIC_TitleRibbon',
      });
      slide.addShape(pptx.ShapeType.rect, {
        x: 9.3,
        y: 0,
        w: 4.033,
        h: 7.5,
        fill: { color: PALETTE.navyPanel },
        line: { color: PALETTE.navyBorder, width: 0.75 },
        objectName: 'STATIC_HeroPanel',
      });

      // Right-hand quantum energy-level & transition visual
      const rx = 9.95;
      [5.6, 3.85, 2.2].forEach((ly, i) => {
        slide.addShape(pptx.ShapeType.line, {
          x: rx,
          y: ly,
          w: 2.75,
          h: 0,
          line: {
            color: i === 0 ? PALETTE.blue : i === 1 ? PALETTE.cyanLight : PALETTE.amberBright,
            width: 3.0,
          },
          objectName: `WIPE_HeroLvl_${i}`,
        });
      });
      slide.addShape(pptx.ShapeType.line, {
        x: rx + 0.75,
        y: 2.25,
        w: 0,
        h: 3.3,
        line: { color: PALETTE.amberBright, width: 2.6, beginArrowType: 'triangle' },
        objectName: 'WIPE_HeroAbs',
      });
      slide.addShape(pptx.ShapeType.line, {
        x: rx + 1.95,
        y: 3.9,
        w: 0,
        h: 1.65,
        line: { color: PALETTE.cyanLight, width: 2.4, endArrowType: 'triangle' },
        objectName: 'WIPE_HeroEmit',
      });
      slide.addText('S₂*\n\n\nS₁*\n\n\nS₀', {
        x: rx + 2.82,
        y: 2.02,
        w: 0.48,
        h: 3.8,
        fontFace: 'Consolas',
        fontSize: 12,
        bold: true,
        color: PALETTE.bgLight,
        margin: 0,
        objectName: 'FADE_HeroManifold',
      });

      // Title typography
      slide.addText(def.kicker.toUpperCase(), {
        x: 0.85,
        y: 0.85,
        w: 8.0,
        h: 0.32,
        fontFace: 'Calibri',
        fontSize: 11.5,
        bold: true,
        charSpacing: 2.4,
        color: PALETTE.amberBright,
        margin: 0,
        objectName: 'FADE_TitleKicker',
      });

      slide.addText('ENERGETICS OF\nPHOTOCHEMICAL REACTIONS', {
        x: 0.85,
        y: 1.45,
        w: 8.1,
        h: 1.55,
        fontFace: 'Calibri',
        fontSize: 38,
        bold: true,
        color: PALETTE.white,
        lineSpacingMultiple: 1.12,
        margin: 0,
        objectName: 'RISE_MainTitle',
      });

      slide.addShape(pptx.ShapeType.rect, {
        x: 0.85,
        y: 3.22,
        w: 1.4,
        h: 0.06,
        fill: { color: PALETTE.cyanLight },
        line: { color: PALETTE.cyanLight, width: 0 },
        objectName: 'WIPE_TitleBar',
      });

      slide.addText(def.subtitle || '', {
        x: 0.85,
        y: 3.52,
        w: 7.8,
        h: 0.45,
        fontFace: 'Calibri',
        fontSize: 20,
        color: PALETTE.bgLight,
        margin: 0,
        objectName: 'RISE_Subtitle',
      });

      slide.addText(def.callout?.text || '', {
        x: 0.85,
        y: 4.18,
        w: 7.8,
        h: 0.68,
        fontFace: 'Calibri',
        fontSize: 13.5,
        color: 'CBD5E1',
        lineSpacingMultiple: 1.25,
        margin: 0,
        objectName: 'FADE_Tagline',
      });

      slide.addShape(pptx.ShapeType.line, {
        x: 0.85,
        y: 5.35,
        w: 7.6,
        h: 0,
        line: { color: PALETTE.amberBright, width: 1.2 },
        objectName: 'WIPE_MetaRule',
      });

      slide.addText(
        [
          {
            text: `Presented by: ${def.metadata?.presenter}   |   Roll No.: ${def.metadata?.rollNo}\n`,
            options: { fontFace: 'Calibri', fontSize: 12.5, bold: true, color: PALETTE.white },
          },
          {
            text: `Presented to: ${def.metadata?.supervisor}`,
            options: { fontFace: 'Calibri', fontSize: 12, color: 'CBD5E1' },
          },
        ],
        {
          x: 0.85,
          y: 5.5,
          w: 7.8,
          h: 0.65,
          lineSpacingMultiple: 1.25,
          margin: 0,
          objectName: 'RISE_Presenter',
        }
      );

      slide.addText('ACADEMIC PRESENTATION  ·  01 / 22', {
        x: 0.85,
        y: 6.75,
        w: 7.8,
        h: 0.3,
        fontFace: 'Consolas',
        fontSize: 10,
        bold: true,
        color: PALETTE.amberBright,
        margin: 0,
        objectName: 'STATIC_TitleFooter',
      });
      continue;
    }

    // Standard Content Chrome
    addContentChrome(pptx, slide, def);

    // SLIDE 4: Equation & Electromagnetic Scale
    if (def.layout === 'equation-scale') {
      // Left: primary equation + variables + key relationship
      slide.addShape(pptx.ShapeType.roundRect, {
        x: 0.65,
        y: 1.35,
        w: 5.65,
        h: 1.15,
        rectRadius: 0.06,
        fill: { color: PALETTE.navy },
        line: { color: PALETTE.navy, width: 0 },
        objectName: 'ZOOM_EqPrimary',
      });
      slide.addText(def.equation?.formula || '', {
        x: 0.85,
        y: 1.45,
        w: 5.25,
        h: 0.95,
        fontFace: 'Consolas',
        fontSize: 28,
        bold: true,
        color: PALETTE.white,
        align: 'center',
        valign: 'middle',
        margin: 0,
        objectName: 'FADE_EqPrimaryTxt',
      });

      const varLines: PptxGenJS.TextProps[] = (def.equation?.variables || []).map((v, i, arr) => ({
        text: `${v.symbol}  =  ${v.meaning}`,
        options: {
          fontFace: 'Calibri',
          fontSize: 13.5,
          color: PALETTE.body,
          paraSpaceAfter: 6,
          breakLine: i < arr.length - 1,
        },
      }));
      slide.addText(varLines, {
        x: 0.72,
        y: 2.75,
        w: 5.5,
        h: 1.75,
        valign: 'top',
        margin: 0,
        objectName: 'RISE_EqVars',
      });

      if (def.callout) {
        addCalloutBox(pptx, slide, def.callout.label, def.callout.text, def.callout.accent, {
          x: 0.65,
          y: 4.85,
          w: 5.65,
          h: 1.45,
        });
      }

      // Right: EM Spectrum Diagram + Molar Photon Energy
      renderSlideDiagram(pptx, slide, def, { x: 6.55, y: 1.35, w: 6.13, h: 3.45 });

      if (def.secondaryEquation) {
        slide.addShape(pptx.ShapeType.roundRect, {
          x: 6.55,
          y: 5.05,
          w: 6.13,
          h: 1.25,
          rectRadius: 0.06,
          fill: { color: PALETTE.blueTint },
          line: { color: PALETTE.blue, width: 1.0 },
          objectName: 'ZOOM_MolarEq',
        });
        slide.addText(
          [
            {
              text: (def.secondaryEquation.caption || '') + '\n',
              options: { fontFace: 'Calibri', fontSize: 11.5, bold: true, color: PALETTE.blue },
            },
            {
              text: def.secondaryEquation.formula,
              options: { fontFace: 'Consolas', fontSize: 22, bold: true, color: PALETTE.ink },
            },
          ],
          {
            x: 6.7,
            y: 5.15,
            w: 5.83,
            h: 1.05,
            align: 'center',
            valign: 'middle',
            margin: 0,
            objectName: 'FADE_MolarEqTxt',
          }
        );
      }
      continue;
    }

    // SLIDE 6: Singlet & Triplet States Schematic
    if (def.layout === 'states-schematic') {
      const cards = def.cards || [];
      const cw = (12.03 - 0.4) / 3;
      cards.forEach((c, idx) => {
        addCardBox(
          pptx,
          slide,
          c,
          { x: 0.65 + idx * (cw + 0.2), y: 1.32, w: cw, h: 1.72 },
          `RISE_StateCard_${idx}`
        );
      });

      renderSlideDiagram(pptx, slide, def, { x: 0.65, y: 3.22, w: 12.03, h: 2.55 });

      if (def.callout) {
        addCalloutBox(pptx, slide, def.callout.label, def.callout.text, def.callout.accent, {
          x: 0.65,
          y: 5.92,
          w: 12.03,
          h: 0.92,
        });
      }
      continue;
    }

    // SLIDE 7: Diagram Left, Points + Note Right (Jablonski)
    if (def.layout === 'diagram-points') {
      renderSlideDiagram(pptx, slide, def, { x: 0.65, y: 1.32, w: 6.75, h: 5.48 });
      if (def.points) {
        addBulletsList(slide, def.points, { x: 7.68, y: 1.42, w: 5.0, h: 3.65 }, 13.5);
      }
      if (def.callout) {
        addCalloutBox(pptx, slide, def.callout.label, def.callout.text, def.callout.accent, {
          x: 7.68,
          y: 5.32,
          w: 5.0,
          h: 1.48,
        });
      }
      continue;
    }

    // SLIDE 8 & 13: 6-Card Grid + Bottom Callout
    if (def.layout === 'grid-6') {
      const cards = def.cards || [];
      const cw = (12.03 - 0.4) / 3;
      const ch = 2.12;
      cards.forEach((c, idx) => {
        const col = idx % 3;
        const row = Math.floor(idx / 3);
        addCardBox(
          pptx,
          slide,
          c,
          {
            x: 0.65 + col * (cw + 0.2),
            y: 1.32 + row * (ch + 0.22),
            w: cw,
            h: ch,
          },
          `RISE_GridCard_${idx}`
        );
      });
      if (def.callout) {
        addCalloutBox(pptx, slide, def.callout.label, def.callout.text, def.callout.accent, {
          x: 0.65,
          y: 5.95,
          w: 12.03,
          h: 0.9,
        });
      }
      continue;
    }

    // SLIDE 10: Equation + Points Left, 3 Cards + Diagram Right
    if (def.layout === 'cards-3-diagram') {
      if (def.equation) {
        slide.addShape(pptx.ShapeType.roundRect, {
          x: 0.65,
          y: 1.32,
          w: 5.75,
          h: 0.85,
          rectRadius: 0.06,
          fill: { color: PALETTE.navy },
          line: { color: PALETTE.navy, width: 0 },
          objectName: 'ZOOM_Eq10',
        });
        slide.addText(def.equation.formula, {
          x: 0.75,
          y: 1.38,
          w: 5.55,
          h: 0.73,
          fontFace: 'Consolas',
          fontSize: 21,
          bold: true,
          color: PALETTE.white,
          align: 'center',
          valign: 'middle',
          margin: 0,
          objectName: 'FADE_Eq10Txt',
        });
      }
      if (def.points) {
        addBulletsList(slide, def.points, { x: 0.65, y: 2.38, w: 5.75, h: 4.4 }, 13);
      }

      const cards = def.cards || [];
      cards.forEach((c, idx) => {
        addCardBox(
          pptx,
          slide,
          c,
          { x: 6.65, y: 1.32 + idx * 1.08, w: 6.03, h: 0.96 },
          `RISE_Card10_${idx}`
        );
      });

      renderSlideDiagram(pptx, slide, def, { x: 6.65, y: 4.58, w: 6.03, h: 2.25 });
      continue;
    }

    // SLIDES 5, 11, 15: Points Left, Large Diagram + Optional Callout Right
    if (def.layout === 'points-diagram') {
      if (def.points) {
        addBulletsList(slide, def.points, { x: 0.65, y: 1.4, w: 5.3, h: 5.35 }, 13.5);
      }
      const hasCallout = Boolean(def.callout);
      renderSlideDiagram(pptx, slide, def, {
        x: 6.2,
        y: 1.32,
        w: 6.48,
        h: hasCallout ? 4.35 : 5.48,
      });
      if (def.callout) {
        addCalloutBox(pptx, slide, def.callout.label, def.callout.text, def.callout.accent, {
          x: 6.2,
          y: 5.82,
          w: 6.48,
          h: 0.98,
        });
      }
      continue;
    }

    // SLIDES 3, 9, 14, 16, 17, 19: Flow Pipeline + Points Left + Cards/Diagrams Right
    if (def.layout === 'flow-points-diagram') {
      if (def.flowSteps) {
        addFlowPipeline(pptx, slide, def.flowSteps, { x: 0.65, y: 1.3, w: 12.03, h: 0.92 });
      }
      if (def.points) {
        addBulletsList(slide, def.points, { x: 0.65, y: 2.42, w: 5.8, h: 4.42 }, 12.5);
      }

      let curY = 2.42;
      if (def.equation) {
        slide.addShape(pptx.ShapeType.roundRect, {
          x: 6.68,
          y: curY,
          w: 6.0,
          h: 0.65,
          rectRadius: 0.05,
          fill: { color: PALETTE.navy },
          line: { color: PALETTE.navy, width: 0 },
          objectName: 'ZOOM_FlowEq',
        });
        slide.addText(def.equation.formula, {
          x: 6.78,
          y: curY + 0.04,
          w: 5.8,
          h: 0.57,
          fontFace: 'Consolas',
          fontSize: 15,
          bold: true,
          color: PALETTE.white,
          align: 'center',
          valign: 'middle',
          margin: 0,
          objectName: 'FADE_FlowEqTxt',
        });
        curY += 0.78;
      }

      if (def.cards && def.cards.length > 0) {
        if (def.cards.length === 2) {
          const cw = (6.0 - 0.16) / 2;
          def.cards.forEach((c, idx) => {
            addCardBox(
              pptx,
              slide,
              c,
              { x: 6.68 + idx * (cw + 0.16), y: curY, w: cw, h: 1.18 },
              `RISE_FlowCard_${idx}`
            );
          });
          curY += 1.3;
        } else {
          addCardBox(
            pptx,
            slide,
            def.cards[0],
            { x: 6.68, y: curY, w: 6.0, h: 1.05 },
            'RISE_FlowCard_0'
          );
          curY += 1.17;
        }
      }

      const remainingH = 6.84 - curY - (def.callout ? 1.02 : 0);
      if (remainingH >= 1.4) {
        renderSlideDiagram(pptx, slide, def, { x: 6.68, y: curY, w: 6.0, h: remainingH - 0.1 });
        curY += remainingH;
      }

      if (def.callout) {
        addCalloutBox(pptx, slide, def.callout.label, def.callout.text, def.callout.accent, {
          x: 6.68,
          y: 5.82,
          w: 6.0,
          h: 0.98,
        });
      }
      continue;
    }

    // SLIDES 2, 12, 18, 20: Points/Eq Left, Cards + Diagram + Callout Right
    if (def.layout === 'points-cards-diagram') {
      let leftY = 1.34;
      if (def.equation) {
        slide.addShape(pptx.ShapeType.roundRect, {
          x: 0.65,
          y: leftY,
          w: 5.75,
          h: 0.88,
          rectRadius: 0.06,
          fill: { color: PALETTE.navy },
          line: { color: PALETTE.navy, width: 0 },
          objectName: 'ZOOM_LeftEq',
        });
        slide.addText(def.equation.formula, {
          x: 0.78,
          y: leftY + 0.06,
          w: 5.49,
          h: 0.76,
          fontFace: 'Consolas',
          fontSize: 13.5,
          bold: true,
          color: PALETTE.white,
          align: 'center',
          valign: 'middle',
          margin: 0,
          objectName: 'FADE_LeftEqTxt',
        });
        leftY += 1.05;
      }

      if (def.points) {
        addBulletsList(slide, def.points, { x: 0.65, y: leftY, w: 5.75, h: 6.84 - leftY }, 12.8);
      }

      let rightY = 1.34;
      const cards = def.cards || [];
      const cardH = cards.length >= 3 ? 0.88 : 1.12;
      cards.forEach((c, idx) => {
        addCardBox(
          pptx,
          slide,
          c,
          { x: 6.65, y: rightY, w: 6.03, h: cardH },
          `RISE_RightCard_${idx}`
        );
        rightY += cardH + 0.12;
      });

      const diagH = 5.75 - rightY;
      if (diagH >= 1.35) {
        renderSlideDiagram(pptx, slide, def, { x: 6.65, y: rightY, w: 6.03, h: diagH });
      }

      if (def.callout) {
        addCalloutBox(pptx, slide, def.callout.label, def.callout.text, def.callout.accent, {
          x: 6.65,
          y: 5.86,
          w: 6.03,
          h: 0.96,
        });
      }
      continue;
    }

    // SLIDE 21: Comparative Analysis Table + Take-Home Message
    if (def.layout === 'table-summary') {
      const rows: PptxGenJS.TableRow[] = [
        [
          {
            text: 'APPLICATION',
            options: { fill: { color: PALETTE.navy }, color: PALETTE.white, bold: true, fontFace: 'Calibri', fontSize: 11 },
          },
          {
            text: 'KEY ENERGY PROCESS',
            options: { fill: { color: PALETTE.navy }, color: PALETTE.white, bold: true, fontFace: 'Calibri', fontSize: 11 },
          },
          {
            text: 'MAIN OUTCOME',
            options: { fill: { color: PALETTE.navy }, color: PALETTE.white, bold: true, fontFace: 'Calibri', fontSize: 11 },
          },
        ],
        ...(def.tableRows || []).map((r, i) => {
          const rowFill = i % 2 === 0 ? PALETTE.white : PALETTE.panelLight;
          return [
            { text: r.application, options: { fill: { color: rowFill }, color: PALETTE.ink, bold: true, fontFace: 'Calibri', fontSize: 11.5 } },
            { text: r.keyProcess, options: { fill: { color: rowFill }, color: PALETTE.body, fontFace: 'Calibri', fontSize: 11.5 } },
            { text: r.mainOutcome, options: { fill: { color: rowFill }, color: PALETTE.cyan, bold: true, fontFace: 'Calibri', fontSize: 11.5 } },
          ];
        }),
      ];

      slide.addTable(rows, {
        x: 0.65,
        y: 1.34,
        w: 12.03,
        colW: [2.9, 5.2, 3.93],
        rowH: 0.52,
        border: { type: 'solid', color: PALETTE.border, pt: 0.75 },
        valign: 'middle',
        margin: [4, 10, 4, 10],
        objectName: 'RISE_CompTable',
      });

      if (def.callout) {
        addCalloutBox(pptx, slide, def.callout.label, def.callout.text, def.callout.accent, {
          x: 0.65,
          y: 5.75,
          w: 12.03,
          h: 1.05,
        });
      }
      continue;
    }

    // SLIDE 22: Selected References
    if (def.layout === 'references') {
      const refs = def.references || [];
      refs.forEach((ref, idx) => {
        const ry = 1.32 + idx * 0.61;
        slide.addShape(pptx.ShapeType.roundRect, {
          x: 0.65,
          y: ry,
          w: 12.03,
          h: 0.52,
          rectRadius: 0.04,
          fill: { color: idx % 2 === 0 ? PALETTE.white : PALETTE.panelLight },
          line: { color: PALETTE.borderLight, width: 0.75 },
          objectName: `RISE_RefRow_${idx}`,
        });

        slide.addText(
          [
            {
              text: `[${String(idx + 1).padStart(2, '0')} · ${ref.category}]  `,
              options: { fontFace: 'Consolas', fontSize: 9.5, bold: true, color: PALETTE.cyan },
            },
            {
              text: ref.citation,
              options: { fontFace: 'Calibri', fontSize: 11.2, color: PALETTE.ink },
            },
          ],
          {
            x: 0.82,
            y: ry + 0.04,
            w: 11.7,
            h: 0.44,
            valign: 'middle',
            margin: 0,
            objectName: `FADE_RefTxt_${idx}`,
          }
        );
      });

      if (def.callout) {
        addCalloutBox(pptx, slide, def.callout.label, def.callout.text, def.callout.accent, {
          x: 0.65,
          y: 5.82,
          w: 12.03,
          h: 0.96,
        });
      }
    }
  }

  const rawBuffer = (await pptx.write({ outputType: 'uint8array' })) as Uint8Array;
  return convertPptxBufferToAnimatedPpsx(rawBuffer, animConfigs, {
    loopShow,
    format: options?.format ?? 'ppsx',
  });
}
