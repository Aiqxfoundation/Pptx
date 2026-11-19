import JSZip from 'jszip';
import type { TransitionKind } from '../data/slidesData';

export interface SlideAnimationConfig {
  slideNumber: number;
  durationMs: number;
  transition: TransitionKind;
  loopShow?: boolean;
}

interface TargetShape {
  id: string;
  name: string;
  animStyle: 'fade' | 'rise' | 'wipe' | 'zoom';
}

function buildTransitionXml(transition: TransitionKind, durationMs: number): string {
  const safeDuration = Math.max(2500, Math.round(durationMs));
  let inner = '<p:fade thruBlk="0"/>';
  switch (transition) {
    case 'fade':
      inner = '<p:fade thruBlk="0"/>';
      break;
    case 'push':
      inner = '<p:push dir="l"/>';
      break;
    case 'wipe':
      inner = '<p:wipe dir="r"/>';
      break;
    case 'cover':
      inner = '<p:cover dir="l"/>';
      break;
    case 'split':
      inner = '<p:split orient="horz" dir="out"/>';
      break;
  }
  return `<p:transition spd="med" advClick="1" advTm="${safeDuration}">${inner}</p:transition>`;
}

function extractAnimatableShapes(slideXml: string): TargetShape[] {
  const regex =
    /<p:(?:nvSpPr|nvPicPr|nvGraphicFramePr|nvCxnSpPr)>\s*<p:cNvPr\s+id="(\d+)"\s+name="([^"]*)"/g;
  const shapes: TargetShape[] = [];
  let match: RegExpExecArray | null;
  while ((match = regex.exec(slideXml)) !== null) {
    const id = match[1];
    const name = match[2] || '';
    if (name.startsWith('STATIC_')) continue;
    let animStyle: TargetShape['animStyle'] = 'fade';
    if (name.startsWith('WIPE_')) animStyle = 'wipe';
    else if (name.startsWith('ZOOM_')) animStyle = 'zoom';
    else if (name.startsWith('RISE_')) animStyle = 'rise';
    shapes.push({ id, name, animStyle });
  }
  return shapes;
}

function buildShapeEffectNode(
  shape: TargetShape,
  delayMs: number,
  nextId: () => number
): string {
  const parId = nextId();
  const setId = nextId();
  const animId = nextId();

  let presetID = '10'; // Fade
  let presetSubtype = '0';
  let effectXml = `<p:animEffect transition="in" filter="fade"><p:cBhvr><p:cTn id="${animId}" dur="480"/><p:tgtEl><p:spTgt spid="${shape.id}"/></p:tgtEl></p:cBhvr></p:animEffect>`;

  if (shape.animStyle === 'wipe') {
    presetID = '22'; // Wipe
    presetSubtype = '8'; // From left
    effectXml = `<p:animEffect transition="in" filter="wipe(left)"><p:cBhvr><p:cTn id="${animId}" dur="550"/><p:tgtEl><p:spTgt spid="${shape.id}"/></p:tgtEl></p:cBhvr></p:animEffect>`;
  } else if (shape.animStyle === 'zoom') {
    const scaleId = nextId();
    presetID = '23'; // Zoom
    presetSubtype = '0';
    effectXml =
      `<p:animEffect transition="in" filter="fade"><p:cBhvr><p:cTn id="${animId}" dur="450"/><p:tgtEl><p:spTgt spid="${shape.id}"/></p:tgtEl></p:cBhvr></p:animEffect>` +
      `<p:animScale><p:cBhvr><p:cTn id="${scaleId}" dur="480" fill="hold"/><p:tgtEl><p:spTgt spid="${shape.id}"/></p:tgtEl></p:cBhvr><p:from x="94000" y="94000"/><p:to x="100000" y="100000"/></p:animScale>`;
  } else if (shape.animStyle === 'rise') {
    const moveId = nextId();
    presetID = '2'; // Fly In (subtle)
    presetSubtype = '4';
    effectXml =
      `<p:animEffect transition="in" filter="fade"><p:cBhvr><p:cTn id="${animId}" dur="420"/><p:tgtEl><p:spTgt spid="${shape.id}"/></p:tgtEl></p:cBhvr></p:animEffect>` +
      `<p:anim calcmode="lin" valueType="num"><p:cBhvr override="childStyle"><p:cTn id="${moveId}" dur="450" fill="hold"/><p:tgtEl><p:spTgt spid="${shape.id}"/></p:tgtEl><p:attrNameLst><p:attrName>ppt_y</p:attrName></p:attrNameLst></p:cBhvr><p:tavLst><p:tav tm="0"><p:val><p:strVal val="#ppt_y+0.025"/></p:val></p:tav><p:tav tm="100000"><p:val><p:strVal val="#ppt_y"/></p:val></p:tav></p:tavLst></p:anim>`;
  }

  return `<p:par><p:cTn id="${parId}" presetID="${presetID}" presetClass="entr" presetSubtype="${presetSubtype}" fill="hold" nodeType="withEffect"><p:stCondLst><p:cond delay="${delayMs}"/></p:stCondLst><p:childTnLst><p:set><p:cBhvr><p:cTn id="${setId}" dur="1" fill="hold"><p:stCondLst><p:cond delay="0"/></p:stCondLst></p:cTn><p:tgtEl><p:spTgt spid="${shape.id}"/></p:tgtEl><p:attrNameLst><p:attrName>style.visibility</p:attrName></p:attrNameLst></p:cBhvr><p:to><p:strVal val="visible"/></p:to></p:set>${effectXml}</p:childTnLst></p:cTn></p:par>`;
}

function buildTimingXml(shapes: TargetShape[], slideDurationMs: number): string {
  if (shapes.length === 0) return '';

  let cTnCounter = 1;
  const nextId = () => cTnCounter++;

  const tmRootId = nextId(); // 1
  const mainSeqId = nextId(); // 2
  const clickGroupId = nextId(); // 3
  const subGroupId = nextId(); // 4

  // Fit all animations comfortably inside the first ~55% of the slide duration so the audience has ample reading time
  const maxAnimWindow = Math.max(1800, Math.min(4800, Math.round(slideDurationMs * 0.52)));
  const stepMs =
    shapes.length > 1 ? Math.min(260, Math.max(110, Math.floor((maxAnimWindow - 200) / (shapes.length - 1)))) : 0;

  const effectNodes = shapes
    .map((shape, index) => buildShapeEffectNode(shape, 160 + index * stepMs, nextId))
    .join('');

  const bldLst = shapes.map((shape) => `<p:bldP spid="${shape.id}" grpId="0"/>`).join('');

  return `<p:timing><p:tnLst><p:par><p:cTn id="${tmRootId}" dur="indefinite" restart="never" nodeType="tmRoot"><p:childTnLst><p:seq concurrent="1" nextAc="seek"><p:cTn id="${mainSeqId}" dur="indefinite" nodeType="mainSeq"><p:childTnLst><p:par><p:cTn id="${clickGroupId}" fill="hold"><p:stCondLst><p:cond delay="0"/></p:stCondLst><p:childTnLst><p:par><p:cTn id="${subGroupId}" fill="hold"><p:stCondLst><p:cond delay="0"/></p:stCondLst><p:childTnLst>${effectNodes}</p:childTnLst></p:cTn></p:par></p:childTnLst></p:cTn></p:par></p:childTnLst></p:cTn><p:prevCondLst><p:cond evt="onPrev" delay="0"><p:tgtEl><p:sldTgt/></p:tgtEl></p:cond></p:prevCondLst><p:nextCondLst><p:cond evt="onNext" delay="0"><p:tgtEl><p:sldTgt/></p:tgtEl></p:cond></p:nextCondLst></p:seq></p:childTnLst></p:cTn></p:par></p:tnLst><p:bldLst>${bldLst}</p:bldLst></p:timing>`;
}

export async function convertPptxBufferToAnimatedPpsx(
  pptxData: ArrayBuffer | Uint8Array,
  configs: SlideAnimationConfig[],
  options?: { loopShow?: boolean; format?: 'ppsx' | 'pptx' }
): Promise<Uint8Array> {
  const zip = await JSZip.loadAsync(pptxData);
  const format = options?.format ?? 'ppsx';

  // 1. Convert main presentation content type to .ppsx (PowerPoint Slide Show) unless .pptx requested for Canva/editing
  if (format === 'ppsx') {
    const ctFile = zip.file('[Content_Types].xml');
    if (ctFile) {
      const ctXml = await ctFile.async('string');
      const updatedCt = ctXml.replace(
        'application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml',
        'application/vnd.openxmlformats-officedocument.presentationml.slideshow.main+xml'
      );
      zip.file('[Content_Types].xml', updatedCt);
    }
  }

  // 2. Configure full-screen automatic Slide Show properties in ppt/presProps.xml
  const loopAttr = options?.loopShow ? '1' : '0';
  const presPropsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><p:presentationPr xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"><p:showPr loop="${loopAttr}" showNarration="0" showAnimation="1" useTimings="1"><p:present/><p:sldAll/></p:showPr></p:presentationPr>`;
  zip.file('ppt/presProps.xml', presPropsXml);

  // 3. Inject <p:transition> (with advTm) and <p:timing> (auto-triggered entrance animations) per slide
  for (const cfg of configs) {
    const slidePath = `ppt/slides/slide${cfg.slideNumber}.xml`;
    const slideFile = zip.file(slidePath);
    if (!slideFile) continue;

    let slideXml = await slideFile.async('string');
    // Remove any existing transition/timing just in case
    slideXml = slideXml.replace(/<p:transition[\s\S]*?<\/p:transition>/g, '');
    slideXml = slideXml.replace(/<p:timing[\s\S]*?<\/p:timing>/g, '');

    const shapes = extractAnimatableShapes(slideXml);
    const transitionXml = buildTransitionXml(cfg.transition, cfg.durationMs);
    const timingXml = buildTimingXml(shapes, cfg.durationMs);

    slideXml = slideXml.replace('</p:sld>', `${transitionXml}${timingXml}</p:sld>`);
    zip.file(slidePath, slideXml);
  }

  return zip.generateAsync({
    type: 'uint8array',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });
}
