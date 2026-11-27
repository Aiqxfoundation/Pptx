import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import type { SlideCard, SlideDefinition } from '../data/slidesData';
import { SlideDiagram } from './diagrams/SlideDiagrams';

interface SlideCanvasProps {
  slide: SlideDefinition;
}

const ACCENT_MAP: Record<
  SlideCard['accent'],
  { topBar: string; bgTint: string; border: string; tagText: string }
> = {
  blue: {
    topBar: 'bg-blue-700',
    bgTint: 'bg-blue-50/70',
    border: 'border-blue-200',
    tagText: 'text-blue-700',
  },
  cyan: {
    topBar: 'bg-cyan-600',
    bgTint: 'bg-cyan-50/70',
    border: 'border-cyan-200',
    tagText: 'text-cyan-700',
  },
  amber: {
    topBar: 'bg-amber-600',
    bgTint: 'bg-amber-50/70',
    border: 'border-amber-200',
    tagText: 'text-amber-700',
  },
  emerald: {
    topBar: 'bg-emerald-600',
    bgTint: 'bg-emerald-50/70',
    border: 'border-emerald-200',
    tagText: 'text-emerald-700',
  },
  crimson: {
    topBar: 'bg-red-600',
    bgTint: 'bg-red-50/70',
    border: 'border-red-200',
    tagText: 'text-red-700',
  },
  slate: {
    topBar: 'bg-slate-600',
    bgTint: 'bg-slate-100',
    border: 'border-slate-300',
    tagText: 'text-slate-700',
  },
};

const CardBlock: React.FC<{ card: SlideCard; delay: number; compact?: boolean }> = ({
  card,
  delay,
  compact = false,
}) => {
  const style = ACCENT_MAP[card.accent];
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: [0.16, 1, 0.3, 1] }}
      className="relative bg-white border border-slate-200 rounded-lg overflow-hidden flex flex-col justify-start"
    >
      <div className={`h-1 w-full ${style.topBar}`} />
      <div className={compact ? 'px-3.5 py-2.5' : 'px-4 py-3'}>
        <div className="text-[13px] font-semibold text-slate-900 leading-snug">{card.title}</div>
        {card.tag && (
          <div className={`text-[10px] font-mono-tech font-medium mt-0.5 ${style.tagText}`}>
            {card.tag}
          </div>
        )}
        <p className="text-[11.5px] text-slate-600 leading-relaxed mt-1">{card.body}</p>
      </div>
    </motion.div>
  );
};

const CalloutBlock: React.FC<{
  label: string;
  text: string;
  accent: SlideCard['accent'];
  delay: number;
}> = ({ label, text, accent, delay }) => {
  const style = ACCENT_MAP[accent];
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: [0.16, 1, 0.3, 1] }}
      className={`rounded-lg border px-4 py-2.5 ${style.bgTint} ${style.border}`}
    >
      <div className={`text-[10px] font-semibold tracking-wider uppercase ${style.tagText}`}>
        {label}
      </div>
      <p className="text-[12px] text-slate-900 leading-snug mt-0.5">{text}</p>
    </motion.div>
  );
};

const DiagramPanel: React.FC<{
  slideId: number;
  title?: string;
  caption?: string;
  delay: number;
  className?: string;
}> = ({ slideId, title, caption, delay, className = '' }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.98 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] }}
    className={`bg-white border border-slate-200 rounded-lg px-3.5 py-2.5 flex flex-col justify-between ${className}`}
  >
    {title && (
      <div className="text-[10px] font-semibold tracking-wider uppercase text-cyan-700 shrink-0">
        {title}
      </div>
    )}
    <div className="flex-1 min-h-0 flex items-center justify-center py-1">
      <SlideDiagram slideId={slideId} />
    </div>
    {caption && (
      <div className="text-[10px] italic text-slate-500 leading-tight shrink-0">{caption}</div>
    )}
  </motion.div>
);

export const SlideCanvas: React.FC<SlideCanvasProps> = ({ slide }) => {
  // Title Slide (Slide 1)
  if (slide.layout === 'title') {
    return (
      <div className="w-full min-h-[420px] aspect-[16/9] bg-[#0A1628] text-slate-50 relative overflow-y-auto overflow-x-hidden flex select-none sm:min-h-0 sm:overflow-hidden">
        <div className="w-1.5 bg-amber-500 shrink-0" />
        <div className="flex-1 px-12 py-10 flex flex-col justify-between">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.1 }}
              className="text-xs font-semibold tracking-[0.2em] uppercase text-amber-400"
            >
              {slide.kicker}
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.2 }}
              className="mt-5 text-4xl md:text-[42px] font-bold tracking-tight text-white leading-[1.12] max-w-2xl"
              style={{ textWrap: 'balance' }}
            >
              ENERGETICS OF PHOTOCHEMICAL REACTIONS
            </motion.h1>
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.4, delay: 0.35 }}
              style={{ transformOrigin: 'left' }}
              className="mt-6 h-1 w-24 bg-sky-400"
            />
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.45 }}
              className="mt-5 text-xl font-medium text-slate-100"
            >
              {slide.subtitle}
            </motion.div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.55 }}
              className="mt-3 text-sm text-slate-300 max-w-xl leading-relaxed"
            >
              {slide.callout?.text}
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.65 }}
            className="border-t border-amber-500/70 pt-4 flex flex-col gap-1"
          >
            <div className="text-sm font-semibold text-white">
              Presented by: {slide.metadata?.presenter}
              <span className="mx-3 text-slate-500">|</span>
              <span className="font-mono-tech text-xs text-sky-300">
                Roll No.: {slide.metadata?.rollNo}
              </span>
            </div>
            <div className="text-xs text-slate-300">
              Presented to: {slide.metadata?.supervisor}
            </div>
            <div className="mt-3 text-[11px] font-mono-tech font-medium tracking-wider text-amber-400">
              ACADEMIC PRESENTATION · 01 / 22
            </div>
          </motion.div>
        </div>

        <div className="w-[30%] bg-[#11223D] border-l border-[#1E3A5F] p-6 flex flex-col justify-center">
          <SlideDiagram slideId={1} />
        </div>
      </div>
    );
  }

  // Standard Academic Content Slides (2–22)
  return (
    <div className="w-full min-h-[420px] aspect-[16/9] bg-[#F8FAFC] text-slate-900 relative overflow-y-auto overflow-x-hidden flex flex-col select-none sm:min-h-0 sm:overflow-hidden">
      {/* Top thin navy bar */}
      <div className="h-1 w-full bg-[#0A1628] shrink-0" />

      {/* Header */}
      <div className="px-8 pt-4 pb-2.5 shrink-0">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.08 }}
          className="text-[10.5px] font-semibold tracking-[0.16em] uppercase text-cyan-700"
        >
          {slide.kicker}
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.14 }}
          className="text-[24px] font-bold text-slate-900 tracking-tight leading-tight mt-0.5"
        >
          {slide.title}
        </motion.h2>
        <div className="mt-2 flex items-center gap-2">
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.35, delay: 0.2 }}
            style={{ transformOrigin: 'left' }}
            className="h-0.5 w-16 bg-amber-600"
          />
          <div className="h-px flex-1 bg-slate-200" />
        </div>
      </div>

      {/* Main Content Stage */}
      <div className="flex-1 min-h-0 px-8 py-2 flex flex-col justify-between gap-2.5">
        {slide.layout === 'equation-scale' && (
          <div className="grid grid-cols-12 gap-5 h-full">
            <div className="col-span-5 flex flex-col justify-between gap-3">
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.35, delay: 0.22 }}
                className="bg-[#0A1628] text-white rounded-lg px-5 py-4 text-center"
              >
                <div className="font-mono-tech text-2xl font-bold tracking-tight">
                  {slide.equation?.formula}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.32 }}
                className="space-y-1.5 px-1"
              >
                {slide.equation?.variables?.map((v) => (
                  <div key={v.symbol} className="text-[13px] text-slate-700 flex items-baseline gap-2">
                    <span className="font-mono-tech font-bold text-slate-900 w-5">{v.symbol}</span>
                    <span className="text-slate-400">=</span>
                    <span>{v.meaning}</span>
                  </div>
                ))}
              </motion.div>

              {slide.callout && (
                <CalloutBlock
                  label={slide.callout.label}
                  text={slide.callout.text}
                  accent={slide.callout.accent}
                  delay={0.44}
                />
              )}
            </div>

            <div className="col-span-7 flex flex-col gap-3 h-full">
              <DiagramPanel
                slideId={slide.id}
                title={slide.diagramTitle}
                caption={slide.diagramCaption}
                delay={0.28}
                className="flex-1 min-h-0"
              />
              {slide.secondaryEquation && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.48 }}
                  className="bg-blue-50/70 border border-blue-200 rounded-lg px-5 py-3 text-center shrink-0"
                >
                  <div className="text-[11px] font-semibold text-blue-700">
                    {slide.secondaryEquation.caption}
                  </div>
                  <div className="font-mono-tech text-xl font-bold text-slate-900 mt-0.5">
                    {slide.secondaryEquation.formula}
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        )}

        {slide.layout === 'states-schematic' && (
          <div className="flex flex-col justify-between gap-2.5 h-full">
            <div className="grid grid-cols-3 gap-3.5 shrink-0">
              {slide.cards?.map((c, idx) => (
                <CardBlock key={c.title} card={c} delay={0.2 + idx * 0.1} compact />
              ))}
            </div>
            <DiagramPanel
              slideId={slide.id}
              title={slide.diagramTitle}
              caption={slide.diagramCaption}
              delay={0.45}
              className="flex-1 min-h-0"
            />
            {slide.callout && (
              <CalloutBlock
                label={slide.callout.label}
                text={slide.callout.text}
                accent={slide.callout.accent}
                delay={0.58}
              />
            )}
          </div>
        )}

        {slide.layout === 'diagram-points' && (
          <div className="grid grid-cols-12 gap-5 h-full">
            <DiagramPanel
              slideId={slide.id}
              title={slide.diagramTitle}
              caption={slide.diagramCaption}
              delay={0.22}
              className="col-span-7 h-full"
            />
            <div className="col-span-5 flex flex-col justify-between gap-3 py-1">
              <ul className="space-y-2.5">
                {slide.points?.map((pt, idx) => (
                  <motion.li
                    key={idx}
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 + idx * 0.08 }}
                    className="flex items-start gap-2.5 text-[13px] text-slate-700 leading-relaxed"
                  >
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-xs bg-cyan-600 shrink-0" />
                    <span>{pt}</span>
                  </motion.li>
                ))}
              </ul>
              {slide.callout && (
                <CalloutBlock
                  label={slide.callout.label}
                  text={slide.callout.text}
                  accent={slide.callout.accent}
                  delay={0.62}
                />
              )}
            </div>
          </div>
        )}

        {slide.layout === 'grid-6' && (
          <div className="flex flex-col justify-between gap-3 h-full">
            <div className="grid grid-cols-3 gap-3.5 flex-1">
              {slide.cards?.map((c, idx) => (
                <CardBlock key={c.title} card={c} delay={0.18 + idx * 0.07} />
              ))}
            </div>
            {slide.callout && (
              <CalloutBlock
                label={slide.callout.label}
                text={slide.callout.text}
                accent={slide.callout.accent}
                delay={0.62}
              />
            )}
          </div>
        )}

        {slide.layout === 'cards-3-diagram' && (
          <div className="grid grid-cols-12 gap-5 h-full">
            <div className="col-span-6 flex flex-col gap-3">
              {slide.equation && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.35, delay: 0.2 }}
                  className="bg-[#0A1628] text-white rounded-lg px-4 py-3 text-center"
                >
                  <div className="font-mono-tech text-lg font-bold">{slide.equation.formula}</div>
                </motion.div>
              )}
              <ul className="space-y-2.5 pt-1">
                {slide.points?.map((pt, idx) => (
                  <motion.li
                    key={idx}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.28 + idx * 0.08 }}
                    className="flex items-start gap-2.5 text-[12.5px] text-slate-700 leading-relaxed"
                  >
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-xs bg-cyan-600 shrink-0" />
                    <span>{pt}</span>
                  </motion.li>
                ))}
              </ul>
            </div>

            <div className="col-span-6 flex flex-col justify-between gap-2 h-full">
              <div className="space-y-2">
                {slide.cards?.map((c, idx) => (
                  <CardBlock key={c.title} card={c} delay={0.25 + idx * 0.08} compact />
                ))}
              </div>
              <DiagramPanel
                slideId={slide.id}
                title={slide.diagramTitle}
                caption={slide.diagramCaption}
                delay={0.5}
                className="flex-1 min-h-0"
              />
            </div>
          </div>
        )}

        {slide.layout === 'points-diagram' && (
          <div className="grid grid-cols-12 gap-5 h-full">
            <div className="col-span-5 py-1">
              <ul className="space-y-2.5">
                {slide.points?.map((pt, idx) => (
                  <motion.li
                    key={idx}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.22 + idx * 0.08 }}
                    className="flex items-start gap-2.5 text-[13px] text-slate-700 leading-relaxed"
                  >
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-xs bg-cyan-600 shrink-0" />
                    <span>{pt}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
            <div className="col-span-7 flex flex-col justify-between gap-2.5 h-full">
              <DiagramPanel
                slideId={slide.id}
                title={slide.diagramTitle}
                caption={slide.diagramCaption}
                delay={0.28}
                className="flex-1 min-h-0"
              />
              {slide.callout && (
                <CalloutBlock
                  label={slide.callout.label}
                  text={slide.callout.text}
                  accent={slide.callout.accent}
                  delay={0.55}
                />
              )}
            </div>
          </div>
        )}

        {slide.layout === 'flow-points-diagram' && (
          <div className="flex flex-col gap-2.5 h-full">
            {slide.flowSteps && (
              <div className="flex items-center gap-1.5 shrink-0">
                {slide.flowSteps.map((step, idx) => {
                  const st = ACCENT_MAP[step.accent];
                  return (
                    <React.Fragment key={step.title}>
                      <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.16 + idx * 0.07 }}
                        className={`flex-1 rounded-lg border px-2.5 py-2 text-center ${st.bgTint} ${st.border}`}
                      >
                        <div className="text-[11px] font-bold text-slate-900 leading-tight">
                          {step.title}
                        </div>
                        {step.subtitle && (
                          <div className={`text-[9.5px] font-mono-tech mt-0.5 ${st.tagText}`}>
                            {step.subtitle}
                          </div>
                        )}
                      </motion.div>
                      {idx < slide.flowSteps!.length - 1 && (
                        <ArrowRight className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            )}

            <div className="grid grid-cols-12 gap-5 flex-1 min-h-0">
              <div className="col-span-6 py-0.5">
                <ul className="space-y-2">
                  {slide.points?.map((pt, idx) => (
                    <motion.li
                      key={idx}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.32 + idx * 0.07 }}
                      className="flex items-start gap-2 text-[12px] text-slate-700 leading-relaxed"
                    >
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-xs bg-cyan-600 shrink-0" />
                      <span>{pt}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>

              <div className="col-span-6 flex flex-col justify-between gap-2 min-h-0">
                {slide.equation && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.36 }}
                    className="bg-[#0A1628] text-white rounded-lg px-3 py-2 text-center font-mono-tech text-[13.5px] font-bold shrink-0"
                  >
                    {slide.equation.formula}
                  </motion.div>
                )}

                {slide.cards && slide.cards.length > 0 && (
                  <div className={`grid gap-2 shrink-0 ${slide.cards.length === 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                    {slide.cards.map((c, idx) => (
                      <CardBlock key={c.title} card={c} delay={0.42 + idx * 0.08} compact />
                    ))}
                  </div>
                )}

                <DiagramPanel
                  slideId={slide.id}
                  title={slide.diagramTitle}
                  caption={slide.diagramCaption}
                  delay={0.5}
                  className="flex-1 min-h-0"
                />

                {slide.callout && (
                  <CalloutBlock
                    label={slide.callout.label}
                    text={slide.callout.text}
                    accent={slide.callout.accent}
                    delay={0.58}
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {slide.layout === 'points-cards-diagram' && (
          <div className="grid grid-cols-12 gap-5 h-full">
            <div className="col-span-6 flex flex-col gap-2.5">
              {slide.equation && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                  className="bg-[#0A1628] text-white rounded-lg px-4 py-2.5 text-center font-mono-tech text-[13px] font-bold"
                >
                  {slide.equation.formula}
                </motion.div>
              )}
              <ul className="space-y-2.5 py-0.5">
                {slide.points?.map((pt, idx) => (
                  <motion.li
                    key={idx}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.25 + idx * 0.07 }}
                    className="flex items-start gap-2 text-[12.5px] text-slate-700 leading-relaxed"
                  >
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-xs bg-cyan-600 shrink-0" />
                    <span>{pt}</span>
                  </motion.li>
                ))}
              </ul>
            </div>

            <div className="col-span-6 flex flex-col justify-between gap-2 min-h-0">
              <div className="space-y-2 shrink-0">
                {slide.cards?.map((c, idx) => (
                  <CardBlock key={c.title} card={c} delay={0.28 + idx * 0.08} compact />
                ))}
              </div>
              <DiagramPanel
                slideId={slide.id}
                title={slide.diagramTitle}
                caption={slide.diagramCaption}
                delay={0.48}
                className="flex-1 min-h-0"
              />
              {slide.callout && (
                <CalloutBlock
                  label={slide.callout.label}
                  text={slide.callout.text}
                  accent={slide.callout.accent}
                  delay={0.58}
                />
              )}
            </div>
          </div>
        )}

        {slide.layout === 'table-summary' && (
          <div className="flex flex-col justify-between gap-3 h-full">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.22 }}
              className="border border-slate-200 rounded-lg overflow-hidden bg-white"
            >
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#0A1628] text-white text-[11px] tracking-wider uppercase">
                    <th className="px-4 py-2 font-semibold">Application</th>
                    <th className="px-4 py-2 font-semibold">Key Energy Process</th>
                    <th className="px-4 py-2 font-semibold">Main Outcome</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-[12px]">
                  {slide.tableRows?.map((r, i) => (
                    <tr key={r.application} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                      <td className="px-4 py-2 font-semibold text-slate-900">{r.application}</td>
                      <td className="px-4 py-2 text-slate-700">{r.keyProcess}</td>
                      <td className="px-4 py-2 font-semibold text-cyan-700">{r.mainOutcome}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>

            {slide.callout && (
              <CalloutBlock
                label={slide.callout.label}
                text={slide.callout.text}
                accent={slide.callout.accent}
                delay={0.48}
              />
            )}
          </div>
        )}

        {slide.layout === 'references' && (
          <div className="flex flex-col justify-between gap-2.5 h-full">
            <div className="space-y-1.5">
              {slide.references?.map((ref, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.16 + idx * 0.05 }}
                  className={`rounded-md border border-slate-200 px-3.5 py-2 text-[11.5px] flex items-baseline gap-2.5 ${
                    idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'
                  }`}
                >
                  <span className="font-mono-tech text-[10px] font-semibold text-cyan-700 shrink-0">
                    [{String(idx + 1).padStart(2, '0')} · {ref.category}]
                  </span>
                  <span className="text-slate-800">{ref.citation}</span>
                </motion.div>
              ))}
            </div>
            {slide.callout && (
              <CalloutBlock
                label={slide.callout.label}
                text={slide.callout.text}
                accent={slide.callout.accent}
                delay={0.55}
              />
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="hidden px-8 py-2 shrink-0 border-t border-slate-200 items-center justify-between text-[10px] text-slate-500 sm:flex">
        <span>MPhil Physical Chemistry · Energetics of Photochemical Reactions</span>
        <span className="font-mono-tech font-semibold">{String(slide.id).padStart(2, '0')} / 22</span>
      </div>
    </div>
  );
};
