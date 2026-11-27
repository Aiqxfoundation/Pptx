import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronLeft, ChevronRight, Download, Maximize2, Minimize2 } from 'lucide-react';
import { SLIDES } from './data/slidesData';
import { SlideCanvas } from './components/SlideCanvas';
import { buildPpsxUint8Array } from './lib/ppsxBuilder';

export function App() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [exportMessage, setExportMessage] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const currentSlide = SLIDES[currentIndex];

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(Math.max(0, Math.min(SLIDES.length - 1, index)));
  }, []);

  const previousSlide = useCallback(() => {
    setCurrentIndex((index) => Math.max(0, index - 1));
  }, []);

  const nextSlide = useCallback(() => {
    setCurrentIndex((index) => Math.min(SLIDES.length - 1, index + 1));
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (
        event.target instanceof Element &&
        event.target.closest('button, a, input, select, textarea, [contenteditable="true"], #presentation-stage')
      ) return;
      if (event.key === 'ArrowRight' || event.key === 'PageDown' || event.key === ' ') {
        event.preventDefault();
        nextSlide();
      } else if (event.key === 'ArrowLeft' || event.key === 'PageUp') {
        event.preventDefault();
        previousSlide();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextSlide, previousSlide]);

  useEffect(() => {
    const syncFullscreen = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', syncFullscreen);
    return () => document.removeEventListener('fullscreenchange', syncFullscreen);
  }, []);

  const toggleFullscreen = async () => {
    const stage = document.getElementById('presentation-stage');
    if (!stage) return;
    if (!document.fullscreenElement) {
      await stage.requestFullscreen().catch(() => undefined);
    } else {
      await document.exitFullscreen().catch(() => undefined);
    }
  };

  const downloadPresentation = async () => {
    setIsExporting(true);
    setExportMessage(null);
    try {
      const bytes = await buildPpsxUint8Array({ format: 'pptx' });
      const blob = new Blob([bytes.buffer as ArrayBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'Energetics_of_Photochemical_Reactions_MPhil.pptx';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      setExportMessage('Your PowerPoint presentation has been downloaded.');
    } catch (error) {
      setExportMessage(error instanceof Error ? error.message : 'Unable to create the PowerPoint file.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f7f8] text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between gap-4 px-4 py-4 sm:px-8">
          <a
            href="#presentation"
            onClick={(event) => {
              event.preventDefault();
              goToSlide(0);
            }}
            className="min-w-0"
          >
            <span className="block truncate text-sm font-semibold tracking-tight sm:text-base">
              Photochemistry · MPhil Seminar
            </span>
            <span className="mt-0.5 block text-xs text-slate-500">Energetics of photochemical reactions</span>
          </a>
          <button
            type="button"
            onClick={downloadPresentation}
            disabled={isExporting}
            className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-[#10263d] px-3.5 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#1a3a57] disabled:cursor-wait disabled:opacity-60 sm:px-4 sm:text-sm"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            {isExporting ? 'Preparing…' : 'Download PPTX'}
          </button>
        </div>
      </header>

      <main id="presentation" className="mx-auto flex w-full max-w-[1440px] flex-col gap-5 px-3 py-5 sm:gap-6 sm:px-8 sm:py-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-teal-700">Academic presentation</p>
            <h1 className="mt-1 text-lg font-semibold tracking-tight sm:text-xl">Saba Noor</h1>
            <p className="mt-1 text-xs text-slate-500 sm:text-sm">Supervisor: Sir Touqeer Ahmad</p>
          </div>
          <p className="text-xs font-medium tabular-nums text-slate-500 sm:text-sm">
            {String(currentSlide.id).padStart(2, '0')} <span className="px-1 text-slate-300">/</span> {String(SLIDES.length).padStart(2, '0')}
          </p>
        </div>

        <section aria-label="Presentation slides" className="mx-auto w-full max-w-[1120px]">
          <div
            id="presentation-stage"
            role="group"
            aria-label={`Slide ${currentSlide.id}: ${currentSlide.title}`}
            aria-live="polite"
            className={`group relative overflow-hidden rounded-xl bg-[#0b1726] shadow-[0_20px_60px_-30px_rgba(15,23,42,0.45)] ${isFullscreen ? 'flex h-screen items-center justify-center rounded-none p-5' : ''}`}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide.id}
                initial={{ opacity: 0, x: currentSlide.transition === 'push' ? 24 : 0 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: currentSlide.transition === 'push' ? -24 : 0 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="w-full"
              >
                <SlideCanvas slide={currentSlide} />
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="mt-3 flex items-center justify-between gap-3 sm:mt-4">
            <button
              type="button"
              onClick={previousSlide}
              disabled={currentIndex === 0}
              className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 sm:px-4 sm:text-sm"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              Previous
            </button>
            <div className="flex items-center gap-2 text-xs text-slate-500 sm:text-sm">
              <span className="hidden sm:inline">Use arrow keys to navigate</span>
              <span className="sm:hidden">Arrow keys</span>
              <button
                type="button"
                onClick={toggleFullscreen}
                aria-label={isFullscreen ? 'Exit full screen' : 'Enter full screen'}
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50"
              >
                {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </button>
            </div>
            <button
              type="button"
              onClick={nextSlide}
              disabled={currentIndex === SLIDES.length - 1}
              className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-[#10263d] px-3 text-xs font-semibold text-white transition-colors hover:bg-[#1a3a57] disabled:cursor-not-allowed disabled:opacity-40 sm:px-4 sm:text-sm"
            >
              Next slide
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          <div className="mt-4 h-1 overflow-hidden rounded-full bg-slate-200" aria-hidden="true">
            <div
              className="h-full rounded-full bg-teal-600 transition-[width] duration-300"
              style={{ width: `${((currentIndex + 1) / SLIDES.length) * 100}%` }}
            />
          </div>

          <details className="mt-5 rounded-xl border border-slate-200 bg-white">
            <summary className="cursor-pointer list-none px-4 py-3 text-sm font-semibold text-slate-700 marker:hidden">
              Browse all slides <span className="ml-1 text-xs font-normal text-slate-400">({SLIDES.length})</span>
            </summary>
            <nav aria-label="Choose a slide" className="grid max-h-72 grid-cols-1 gap-1 overflow-y-auto border-t border-slate-100 p-2 sm:grid-cols-2 lg:grid-cols-3">
              {SLIDES.map((slide, index) => (
                <button
                  key={slide.id}
                  type="button"
                  aria-current={index === currentIndex ? 'step' : undefined}
                  onClick={() => goToSlide(index)}
                  className={`flex min-w-0 items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
                    index === currentIndex ? 'bg-teal-50 text-teal-950' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="font-mono text-xs tabular-nums text-slate-400">{String(slide.id).padStart(2, '0')}</span>
                  <span className="truncate text-xs font-medium">{slide.title}</span>
                </button>
              ))}
            </nav>
          </details>

          {exportMessage && (
            <p role="status" className="mt-3 text-center text-xs text-slate-600">{exportMessage}</p>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
