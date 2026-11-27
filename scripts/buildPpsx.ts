import fs from 'fs';
import path from 'path';
import JSZip from 'jszip';
import { buildPpsxUint8Array } from '../src/lib/ppsxBuilder';

async function main() {
  const bytes = await buildPpsxUint8Array({ paceMultiplier: 1.0, transitionOverride: 'auto', loopShow: false });

  const outPath = path.resolve(process.cwd(), 'public', 'Energetics_of_Photochemical_Reactions_MPhil.ppsx');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, bytes);

  // Rigorous OOXML verification
  const zip = await JSZip.loadAsync(bytes);
  const ct = await zip.file('[Content_Types].xml')?.async('string');
  if (!ct || !ct.includes('presentationml.slideshow.main+xml')) {
    throw new Error('Missing .ppsx slideshow.main+xml content type');
  }
  const presProps = await zip.file('ppt/presProps.xml')?.async('string');
  if (!presProps || !presProps.includes('useTimings="1"') || !presProps.includes('<p:present/>')) {
    throw new Error('Missing full-screen auto-timing showPr in ppt/presProps.xml');
  }

  let totalAnimations = 0;
  for (let i = 1; i <= 22; i++) {
    const slideXml = await zip.file(`ppt/slides/slide${i}.xml`)?.async('string');
    if (!slideXml) throw new Error(`Missing slide${i}.xml`);
    if (!slideXml.includes('<p:transition ') || !slideXml.includes('advClick="1"') || slideXml.includes('advTm="')) {
      throw new Error(`Slide ${i} must advance on click and must not use timed auto-advance`);
    }
    if (!slideXml.includes('<p:timing>') || !slideXml.includes('nodeType="withEffect"')) {
      throw new Error(`Slide ${i} missing auto-triggered p:timing animations`);
    }
    // Check cTn id uniqueness per slide
    const cTnIds = [...slideXml.matchAll(/<p:cTn\s+id="(\d+)"/g)].map((m) => m[1]);
    const uniqueIds = new Set(cTnIds);
    if (uniqueIds.size !== cTnIds.length) {
      throw new Error(`Duplicate cTn id detected on slide ${i}`);
    }
    const effectCount = (slideXml.match(/nodeType="withEffect"/g) || []).length;
    totalAnimations += effectCount;
  }

  console.log(`Generated & verified ${outPath} (${(bytes.byteLength / 1024).toFixed(1)} KB)`);
  console.log(`All 22 slides verified: slideshow.main+xml, showPr useTimings="1", click-driven transitions, ${totalAnimations} staggered animations.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
