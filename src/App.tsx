import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Film,
  FileSpreadsheet,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  RotateCcw,
  Share2,
} from 'lucide-react';
import { SLIDES, type TransitionKind } from './data/slidesData';
import { SlideCanvas } from './components/SlideCanvas';
import { buildPpsxUint8Array } from './lib/ppsxBuilder';
import { exportPresentationVideo, type ExportedVideoResult } from './lib/videoExporter';

type SidebarTab = 'index' | 'export' | 'notes';

export function App() {
  const initialPresentMode =
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('present') === '1';

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [paceMultiplier, setPaceMultiplier] = useState<number>(1.0);
  const [transitionOverride, setTransitionOverride] = useState<'auto' | TransitionKind>('auto');
  const [loopShow, setLoopShow] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>('export');
  const [isExporting, setIsExporting] = useState(false);
  const [exportMessage, setExportMessage] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [presentOnly, setPresentOnly] = useState(initialPresentMode);

  // Video export state for WhatsApp mobile
  const [videoRes, setVideoRes] = useState<'1080p' | '720p'>('1080p');
  const [videoProgress, setVideoProgress] = useState<{
    active: boolean;
    pct: number;
    slideNum: number;
  }>({ active: false, pct: 0, slideNum: 1 });
  const [renderedVideo, setRenderedVideo] = useState<ExportedVideoResult | null>(null);
  const videoAbortRef = useRef<AbortController | null>(null);

  const stageRef = useRef<HTMLDivElement>(null);
  const indexListRef = useRef<HTMLDivElement>(null);

  const currentSlide = SLIDES[currentIndex];
  const slideDurationMs = useMemo(
    () => Math.round(currentSlide.durationSec * 1000 * paceMultiplier),
    [currentSlide.durationSec, paceMultiplier]
  );

  const totalShowDurationSec = useMemo(
    () => Math.round(SLIDES.reduce((acc, s) => acc + s.durationSec * paceMultiplier, 0)),
    [paceMultiplier]
  );

  const goToSlide = useCallback((idx: number) => {
    const clamped = Math.max(0, Math.min(SLIDES.length - 1, idx));
    setCurrentIndex(clamped);
    setElapsedMs(0);
  }, []);

  const nextSlide = useCallback(() => {
    setElapsedMs(0);
    if (currentIndex + 1 < SLIDES.length) {
      setCurrentIndex(currentIndex + 1);
    } else if (loopShow) {
      setCurrentIndex(0);
    } else {
      setIsPlaying(false);
    }
  }, [currentIndex, loopShow]);

  const prevSlide = useCallback(() => {
    setElapsedMs(0);
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : 0));
  }, []);

  useEffect(() => {
    if (!isPlaying) return;
    const tickMs = 50;
    const timer = window.setInterval(() => {
      setElapsedMs((prev) => Math.min(prev + tickMs, slideDurationMs));
    }, tickMs);
    return () => window.clearInterval(timer);
  }, [isPlaying, slideDurationMs]);

  useEffect(() => {
    if (isPlaying && elapsedMs >= slideDurationMs) {
      nextSlide();
    }
  }, [isPlaying, elapsedMs, slideDurationMs, nextSlide]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) return;
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        e.preventDefault();
        nextSlide();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        prevSlide();
      } else if (e.key === ' ') {
        e.preventDefault();
        setIsPlaying((p) => !p);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [nextSlide, prevSlide]);

  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  const toggleFullscreen = async () => {
    if (!stageRef.current) return;
    if (!document.fullscreenElement) {
      await stageRef.current.requestFullscreen().catch(() => undefined);
    } else {
      await document.exitFullscreen().catch(() => undefined);
    }
  };

  const triggerBlobDownload = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  };

  const handleDownloadDeck = async (format: 'ppsx' | 'pptx') => {
    setIsExporting(true);
    setExportMessage(null);
    try {
      const bytes = await buildPpsxUint8Array({
        paceMultiplier,
        transitionOverride,
        loopShow,
        format,
      });
      const mime =
        format === 'ppsx'
          ? 'application/vnd.openxmlformats-officedocument.presentationml.slideshow'
          : 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
      const filename =
        format === 'ppsx'
          ? 'Energetics_of_Photochemical_Reactions_MPhil.ppsx'
          : 'Energetics_of_Photochemical_Reactions_MPhil_Canva.pptx';
      triggerBlobDownload(new Blob([bytes.buffer as ArrayBuffer], { type: mime }), filename);
      setExportMessage(
        format === 'ppsx'
          ? `Downloaded .PPSX (${(bytes.byteLength / 1024).toFixed(0)} KB) — opens directly in full-screen auto-play slideshow on laptop.`
          : `Downloaded .PPTX (${(bytes.byteLength / 1024).toFixed(0)} KB) — ready to upload into Canva or edit in PowerPoint.`
      );
    } catch (err) {
      setExportMessage(err instanceof Error ? err.message : 'Failed to build presentation.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleRenderVideo = async () => {
    if (videoProgress.active) {
      videoAbortRef.current?.abort();
      return;
    }
    const controller = new AbortController();
    videoAbortRef.current = controller;
    setRenderedVideo(null);
    setExportMessage(null);
    setVideoProgress({ active: true, pct: 0, slideNum: 1 });

    try {
      const result = await exportPresentationVideo({
        paceMultiplier,
        transitionOverride,
        resolution: videoRes,
        fps: 24,
        signal: controller.signal,
        onProgress: (pct, slideNum) => setVideoProgress({ active: true, pct, slideNum }),
      });
      setRenderedVideo(result);
      triggerBlobDownload(result.blob, result.filename);
      setExportMessage(
        `Rendered ${videoRes} MP4 video (${(result.blob.size / (1024 * 1024)).toFixed(1)} MB) — ready to send directly on WhatsApp.`
      );
    } catch (err) {
      setExportMessage(err instanceof Error ? err.message : 'Video rendering failed.');
    } finally {
      setVideoProgress({ active: false, pct: 0, slideNum: 1 });
    }
  };

  const handleShareToWhatsApp = async () => {
    const shareUrl = `${window.location.origin}/?present=1`;

    // If we have a rendered MP4 and the mobile device supports file sharing via Web Share API
    if (renderedVideo && typeof navigator !== 'undefined' && 'share' in navigator) {
      const videoFile = new File([renderedVideo.blob], renderedVideo.filename, {
        type: renderedVideo.mimeType,
      });
      if (navigator.canShare && navigator.canShare({ files: [videoFile] })) {
        try {
          await navigator.share({
            title: 'Energetics of Photochemical Reactions — MPhil Seminar',
            text: 'MPhil Physical Chemistry Presentation (Full-Size Auto-Play Video)',
            files: [videoFile],
          });
          return;
        } catch {
          // User cancelled or file share unsupported; fall back to WhatsApp link below
        }
      }
    }

    // Also try sharing .ppsx/.pptx file if supported on mobile, or open WhatsApp with presentation link
    const message = encodeURIComponent(
      `Energetics of Photochemical Reactions (MPhil Physical Chemistry Seminar — 22 Animated Slides)\nWatch full-screen auto-play presentation:\n${shareUrl}`
    );
    const waHref = `https://wa.me/?text=${message}`;
    const link = document.createElement('a');
    link.href = waHref;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const scrollToSection = (tab: SidebarTab) => {
    setSidebarTab(tab);
    indexListRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  const progressPct = Math.min(100, (elapsedMs / slideDurationMs) * 100);
  const activeTransition =
    transitionOverride === 'auto' ? currentSlide.transition : transitionOverride;

  // Clean Mobile Full-Screen Auto-Play Mode (?present=1)
  if (presentOnly) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-2 sm:p-4">
        <div className="w-full max-w-6xl">
          <div
            ref={stageRef}
            className="relative rounded-lg overflow-hidden border border-slate-800 bg-black"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide.id}
                initial={{ opacity: 0, x: activeTransition === 'push' ? 24 : 0 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: activeTransition === 'push' ? -24 : 0 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="w-full"
              >
                <SlideCanvas slide={currentSlide} />
              </motion.div>
            </AnimatePresence>
            <div className="h-1 w-full bg-slate-800">
              <div
                className="h-full bg-cyan-500 transition-[width] duration-75 ease-linear"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsPlaying((p) => !p)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white text-slate-900 font-semibold cursor-pointer"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isPlaying ? 'Pause' : 'Play'}</span>
              </button>
              <button
                type="button"
                onClick={prevSlide}
                disabled={currentIndex === 0}
                className="p-1.5 rounded-md bg-slate-800 text-white disabled:opacity-40 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={nextSlide}
                disabled={currentIndex === SLIDES.length - 1 && !loopShow}
                className="p-1.5 rounded-md bg-slate-800 text-white disabled:opacity-40 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={toggleFullscreen}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-800 text-white cursor-pointer"
              >
                {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                <span>Fullscreen</span>
              </button>
            </div>
            <div className="flex items-center gap-3 font-mono-tech">
              <span>
                {String(currentSlide.id).padStart(2, '0')} / {SLIDES.length}
              </span>
              <button
                type="button"
                onClick={() => setPresentOnly(false)}
                className="font-sans text-cyan-400 hover:underline cursor-pointer"
              >
                Open Studio &amp; Downloads
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Three-Zone Top Bar Contract */}
      <header className="bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between gap-8 shrink-0">
        <a
          href="#stage"
          onClick={(e) => {
            e.preventDefault();
            goToSlide(0);
          }}
          className="text-base font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0"
        >
          Photochemistry MPhil Studio
        </a>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <button
            type="button"
            onClick={() => {
              setIsPlaying(true);
              goToSlide(0);
            }}
            className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Auto-Play Deck
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('index')}
            className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Slide Index
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('export')}
            className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            WhatsApp &amp; Export
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('notes')}
            className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Presenter Notes
          </button>
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => handleDownloadDeck('ppsx')}
            disabled={isExporting}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#0A1628] rounded-lg hover:bg-slate-800 disabled:opacity-60 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isExporting ? 'Compiling...' : 'Download .PPSX'}</span>
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-6 py-5 flex flex-col lg:flex-row gap-6">
        {/* Left/Center: 16:9 Presentation Stage & Transport Controls */}
        <section id="stage" className="flex-1 min-w-0 flex flex-col gap-3.5">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-800">Saba Noor (CHEM71F26S088)</span>
              <span aria-hidden="true">·</span>
              <span>Supervisor: Sir Touqeer Ahmad</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono-tech">22 Animated Slides</span>
            </div>
            <div className="flex items-center gap-2 font-mono-tech">
              <span>Transition: {activeTransition}</span>
              <span aria-hidden="true">·</span>
              <span>
                Total Show: {Math.floor(totalShowDurationSec / 60)}m{' '}
                {String(totalShowDurationSec % 60).padStart(2, '0')}s
              </span>
            </div>
          </div>

          <div
            ref={stageRef}
            className={`relative rounded-xl border border-slate-200 bg-slate-950 overflow-hidden ${
              isFullscreen ? 'flex items-center justify-center p-4 bg-black' : ''
            }`}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide.id}
                initial={{ opacity: 0, x: activeTransition === 'push' ? 24 : 0 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: activeTransition === 'push' ? -24 : 0 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="w-full"
              >
                <SlideCanvas slide={currentSlide} />
              </motion.div>
            </AnimatePresence>

            <div className="h-1 w-full bg-slate-200/80">
              <div
                className="h-full bg-cyan-600 transition-[width] duration-75 ease-linear"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg px-4 py-2.5 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsPlaying((p) => !p)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-md bg-[#0A1628] text-white hover:bg-slate-800 transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isPlaying ? 'Pause' : 'Auto-Play'}</span>
              </button>

              <button
                type="button"
                onClick={prevSlide}
                disabled={currentIndex === 0}
                aria-label="Previous slide"
                className="p-1.5 rounded-md border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-40 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={nextSlide}
                disabled={currentIndex === SLIDES.length - 1 && !loopShow}
                aria-label="Next slide"
                className="p-1.5 rounded-md border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-40 transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => {
                  goToSlide(0);
                  setIsPlaying(true);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restart</span>
              </button>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono-tech text-slate-600">
              <span>
                Slide {String(currentSlide.id).padStart(2, '0')} / {SLIDES.length}
              </span>
              <span aria-hidden="true">·</span>
              <span>
                {(elapsedMs / 1000).toFixed(1)}s / {(slideDurationMs / 1000).toFixed(1)}s
              </span>
              <button
                type="button"
                onClick={toggleFullscreen}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-sans font-medium rounded-md border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                {isFullscreen ? (
                  <Minimize2 className="w-3.5 h-3.5" />
                ) : (
                  <Maximize2 className="w-3.5 h-3.5" />
                )}
                <span>{isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}</span>
              </button>
            </div>
          </div>

          {exportMessage && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-lg px-4 py-2.5 text-xs flex items-center justify-between gap-4">
              <span>{exportMessage}</span>
              <a
                href="/Energetics_of_Photochemical_Reactions_MPhil.ppsx"
                download="Energetics_of_Photochemical_Reactions_MPhil.ppsx"
                className="font-semibold underline whitespace-nowrap shrink-0"
              >
                Direct .PPSX Link
              </a>
            </div>
          )}
        </section>

        {/* Right Sidebar Console */}
        <aside
          ref={indexListRef}
          className="w-full lg:w-[360px] shrink-0 bg-white border border-slate-200 rounded-xl flex flex-col overflow-hidden max-h-[720px]"
        >
          {/* Segmented Control */}
          <div className="p-2 border-b border-slate-200 bg-slate-50 grid grid-cols-3 gap-1">
            {(
              [
                { id: 'index', label: 'Slides (22)' },
                { id: 'export', label: 'Export & Share' },
                { id: 'notes', label: 'Notes' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSidebarTab(tab.id)}
                className={`px-2 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  sidebarTab === tab.id
                    ? 'bg-white text-slate-900 border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-3.5">
            {sidebarTab === 'index' && (
              <div className="space-y-1">
                {SLIDES.map((s, idx) => {
                  const active = idx === currentIndex;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => goToSlide(idx)}
                      className={`w-full text-left px-3 py-2 rounded-lg border transition-colors flex items-start gap-2.5 cursor-pointer ${
                        active
                          ? 'bg-cyan-50/70 border-cyan-300 text-slate-900'
                          : 'bg-white border-transparent hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span
                        className={`font-mono-tech text-[11px] font-semibold mt-0.5 shrink-0 ${
                          active ? 'text-cyan-700' : 'text-slate-400'
                        }`}
                      >
                        {String(s.id).padStart(2, '0')}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-semibold truncate">{s.title}</div>
                        <div className="text-[10.5px] text-slate-500 font-mono-tech mt-0.5">
                          {(s.durationSec * paceMultiplier).toFixed(1)}s ·{' '}
                          {transitionOverride === 'auto' ? s.transition : transitionOverride}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {sidebarTab === 'export' && (
              <div className="space-y-4">
                {/* Section 1: WhatsApp Mobile Video (Full-Size Canvas Render) */}
                <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3 space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-900">
                      WhatsApp Mobile Video (.MP4)
                    </span>
                    <span className="text-[11px] font-mono-tech text-cyan-700">16:9 Full Size</span>
                  </div>
                  <p className="text-[11.5px] text-slate-600 leading-relaxed">
                    Renders all 22 slides, animations, and transitions from Canvas into a single H.264
                    MP4 video that plays full-size directly inside WhatsApp on mobile.
                  </p>

                  <div className="grid grid-cols-2 gap-1.5">
                    {(
                      [
                        { id: '1080p', label: '1080p Full HD' },
                        { id: '720p', label: '720p WhatsApp HD' },
                      ] as const
                    ).map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setVideoRes(opt.id)}
                        disabled={videoProgress.active}
                        className={`px-2 py-1.5 text-xs font-medium rounded-md border transition-colors cursor-pointer ${
                          videoRes === opt.id
                            ? 'bg-[#0A1628] text-white border-[#0A1628]'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>

                  {videoProgress.active && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] font-mono-tech text-slate-700">
                        <span>Rendering Slide {videoProgress.slideNum} / 22</span>
                        <span>{videoProgress.pct}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-cyan-600 transition-all duration-150"
                          style={{ width: `${videoProgress.pct}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-2">
                    <button
                      type="button"
                      onClick={handleRenderVideo}
                      className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-white bg-cyan-700 rounded-lg hover:bg-cyan-800 transition-colors cursor-pointer"
                    >
                      <Film className="w-3.5 h-3.5" />
                      <span>
                        {videoProgress.active
                          ? 'Cancel Video Render'
                          : renderedVideo
                            ? 'Re-Render & Download .MP4'
                            : 'Render & Download .MP4 Video'}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={handleShareToWhatsApp}
                      className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-emerald-900 bg-emerald-100 border border-emerald-300 rounded-lg hover:bg-emerald-200 transition-colors cursor-pointer"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>
                        {renderedVideo
                          ? 'Share Video / Link to WhatsApp'
                          : 'Share Full-Screen Link on WhatsApp'}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Section 2: Canva (.PPTX) & PowerPoint Auto-Show (.PPSX) */}
                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-900">
                    Canva &amp; PowerPoint Files
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDownloadDeck('pptx')}
                    disabled={isExporting}
                    className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-slate-800 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-60 transition-colors cursor-pointer"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-cyan-700" />
                    <span>Download .PPTX (For Canva &amp; Mobile)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDownloadDeck('ppsx')}
                    disabled={isExporting}
                    className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-white bg-[#0A1628] rounded-lg hover:bg-slate-800 disabled:opacity-60 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download .PPSX (Laptop Full-Screen Show)</span>
                  </button>
                </div>

                {/* Section 3: Timing & Transition Controls */}
                <div className="pt-2 border-t border-slate-200 space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                      Auto-Advance Pacing
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { label: '0.75× Fast', val: 0.75 },
                        { label: '1.0× Standard', val: 1.0 },
                        { label: '1.4× Lecture', val: 1.4 },
                      ].map((opt) => (
                        <button
                          key={opt.val}
                          type="button"
                          onClick={() => setPaceMultiplier(opt.val)}
                          className={`px-2 py-1.5 text-xs font-medium rounded-md border transition-colors cursor-pointer ${
                            paceMultiplier === opt.val
                              ? 'bg-[#0A1628] text-white border-[#0A1628]'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="transition-select"
                      className="block text-xs font-semibold text-slate-800 mb-1"
                    >
                      Slide Transition Profile
                    </label>
                    <select
                      id="transition-select"
                      value={transitionOverride}
                      onChange={(e) =>
                        setTransitionOverride(e.target.value as 'auto' | TransitionKind)
                      }
                      className="w-full rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-cyan-600"
                    >
                      <option value="auto">Editorial Mix (Recommended)</option>
                      <option value="fade">Smooth Cross-Fade</option>
                      <option value="push">Dynamic Horizontal Push</option>
                      <option value="wipe">Directional Wipe</option>
                      <option value="split">Center Split Reveal</option>
                    </select>
                  </div>

                  <label className="flex items-center justify-between gap-3 py-1.5 cursor-pointer">
                    <span className="text-xs font-medium text-slate-700">
                      Loop continuously until Esc
                    </span>
                    <input
                      type="checkbox"
                      checked={loopShow}
                      onChange={(e) => setLoopShow(e.target.checked)}
                      className="h-4 w-4 accent-cyan-700"
                    />
                  </label>
                </div>
              </div>
            )}

            {sidebarTab === 'notes' && (
              <div className="space-y-3 p-1">
                <div className="text-xs font-mono-tech text-cyan-700 font-semibold">
                  SLIDE {String(currentSlide.id).padStart(2, '0')} ·{' '}
                  {currentSlide.kicker.toUpperCase()}
                </div>
                <h3 className="text-sm font-bold text-slate-900">{currentSlide.title}</h3>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {currentSlide.presenterNote}
                </p>
                <div className="pt-3 border-t border-slate-200 space-y-1.5 text-[11px] font-mono-tech text-slate-500">
                  <div>Duration: {(slideDurationMs / 1000).toFixed(1)}s</div>
                  <div>Transition: {activeTransition}</div>
                  <div>Layout: {currentSlide.layout}</div>
                </div>
              </div>
            )}
          </div>
        </aside>
      </main>
    </div>
  );
}

export default App;
