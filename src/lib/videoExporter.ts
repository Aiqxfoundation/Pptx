import { ArrayBufferTarget, Muxer } from 'mp4-muxer';
import { SLIDES, type TransitionKind } from '../data/slidesData';
import { renderCompositeSlideFrame } from './canvasSlideRenderer';

export interface VideoExportOptions {
  paceMultiplier: number;
  transitionOverride: 'auto' | TransitionKind;
  resolution?: '1080p' | '720p';
  fps?: number;
  signal?: AbortSignal;
  onProgress?: (pct: number, slideIndex: number, totalSlides: number) => void;
}

export interface ExportedVideoResult {
  blob: Blob;
  filename: string;
  mimeType: string;
  durationSec: number;
}

async function pickSupportedAvcCodec(width: number, height: number, bitrate: number, fps: number) {
  const candidates = ['avc1.42E028', 'avc1.4d002a', 'avc1.42E01E', 'avc1.640028'];
  for (const codec of candidates) {
    try {
      const support = await VideoEncoder.isConfigSupported({
        codec,
        width,
        height,
        bitrate,
        framerate: fps,
      });
      if (support.supported) return codec;
    } catch {
      // try next codec
    }
  }
  return null;
}

export async function exportPresentationVideo(
  options: VideoExportOptions
): Promise<ExportedVideoResult> {
  const res = options.resolution ?? '1080p';
  const width = res === '1080p' ? 1920 : 1280;
  const height = res === '1080p' ? 1080 : 720;
  const fps = options.fps ?? 24;
  const frameIntervalUs = Math.round(1_000_000 / fps);
  const bitrate = res === '1080p' ? 4_500_000 : 2_400_000;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context is unavailable.');

  const scale = width / 1920;

  const slideTimings = SLIDES.map((s) => ({
    slide: s,
    durationMs: Math.round(s.durationSec * 1000 * options.paceMultiplier),
    transition:
      options.transitionOverride === 'auto' ? s.transition : options.transitionOverride,
  }));
  const totalDurationMs = slideTimings.reduce((acc, item) => acc + item.durationMs, 0);
  const totalFrames = Math.ceil((totalDurationMs / 1000) * fps);

  // Path A: Fast WebCodecs H.264 + mp4-muxer (universal WhatsApp MP4)
  if (typeof VideoEncoder !== 'undefined' && typeof VideoFrame !== 'undefined') {
    const codec = await pickSupportedAvcCodec(width, height, bitrate, fps);
    if (codec) {
      const target = new ArrayBufferTarget();
      const muxer = new Muxer({
        target,
        video: {
          codec: 'avc',
          width,
          height,
        },
        fastStart: 'in-memory',
      });

      let encoderError: Error | null = null;
      const encoder = new VideoEncoder({
        output: (chunk, meta) => muxer.addVideoChunk(chunk, meta),
        error: (err) => {
          encoderError = err instanceof Error ? err : new Error(String(err));
        },
      });

      encoder.configure({
        codec,
        width,
        height,
        bitrate,
        framerate: fps,
      });

      let slideCursor = 0;
      let slideStartMs = 0;

      for (let f = 0; f < totalFrames; f++) {
        if (options.signal?.aborted) {
          encoder.close();
          throw new Error('Video export cancelled.');
        }
        if (encoderError) throw encoderError;

        const currentTimeMs = (f * 1000) / fps;
        while (
          slideCursor < slideTimings.length - 1 &&
          currentTimeMs >= slideStartMs + slideTimings[slideCursor].durationMs
        ) {
          slideStartMs += slideTimings[slideCursor].durationMs;
          slideCursor++;
        }

        const cur = slideTimings[slideCursor];
        const prev = slideCursor > 0 ? slideTimings[slideCursor - 1] : null;
        const elapsedInSlideMs = currentTimeMs - slideStartMs;

        ctx.save();
        ctx.setTransform(scale, 0, 0, scale, 0, 0);
        renderCompositeSlideFrame(
          ctx,
          cur.slide,
          elapsedInSlideMs,
          prev ? prev.slide : null,
          prev ? prev.durationMs : 0,
          cur.transition,
          450
        );
        ctx.restore();

        const frame = new VideoFrame(canvas, {
          timestamp: f * frameIntervalUs,
          duration: frameIntervalUs,
        });
        const keyFrame = f % (fps * 2) === 0;
        encoder.encode(frame, { keyFrame });
        frame.close();

        // Backpressure control & UI progress yield every 6 frames
        if (f % 6 === 0) {
          if (encoder.encodeQueueSize > 12) {
            await new Promise((r) => setTimeout(r, 4));
          } else {
            await new Promise((r) => setTimeout(r, 0));
          }
          options.onProgress?.(
            Math.min(99, Math.round((f / totalFrames) * 100)),
            slideCursor + 1,
            SLIDES.length
          );
        }
      }

      await encoder.flush();
      encoder.close();
      muxer.finalize();

      options.onProgress?.(100, SLIDES.length, SLIDES.length);

      const mp4Blob = new Blob([target.buffer], { type: 'video/mp4' });
      return {
        blob: mp4Blob,
        filename: `Energetics_of_Photochemical_Reactions_MPhil_${res}.mp4`,
        mimeType: 'video/mp4',
        durationSec: Math.round(totalDurationMs / 1000),
      };
    }
  }

  // Path B: Fallback MediaRecorder if WebCodecs H.264 is unavailable
  const mimeType =
    MediaRecorder.isTypeSupported('video/mp4;codecs=avc1')
      ? 'video/mp4'
      : MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm'
        : 'video/webm';

  const stream = canvas.captureStream(fps);
  const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: bitrate });
  const chunks: BlobPart[] = [];
  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };

  const done = new Promise<Blob>((resolve) => {
    recorder.onstop = () => resolve(new Blob(chunks, { type: mimeType }));
  });

  recorder.start(250);
  const startWall = performance.now();

  await new Promise<void>((resolve, reject) => {
    const step = () => {
      if (options.signal?.aborted) {
        recorder.stop();
        reject(new Error('Video export cancelled.'));
        return;
      }
      const elapsedWall = performance.now() - startWall;
      if (elapsedWall >= totalDurationMs) {
        recorder.stop();
        resolve();
        return;
      }

      let acc = 0;
      let idx = 0;
      for (let i = 0; i < slideTimings.length; i++) {
        if (elapsedWall < acc + slideTimings[i].durationMs || i === slideTimings.length - 1) {
          idx = i;
          break;
        }
        acc += slideTimings[i].durationMs;
      }
      const cur = slideTimings[idx];
      const prev = idx > 0 ? slideTimings[idx - 1] : null;
      ctx.save();
      ctx.setTransform(scale, 0, 0, scale, 0, 0);
      renderCompositeSlideFrame(
        ctx,
        cur.slide,
        elapsedWall - acc,
        prev ? prev.slide : null,
        prev ? prev.durationMs : 0,
        cur.transition,
        450
      );
      ctx.restore();

      options.onProgress?.(
        Math.min(99, Math.round((elapsedWall / totalDurationMs) * 100)),
        idx + 1,
        SLIDES.length
      );
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });

  const blob = await done;
  options.onProgress?.(100, SLIDES.length, SLIDES.length);
  const ext = mimeType.includes('mp4') ? 'mp4' : 'webm';
  return {
    blob,
    filename: `Energetics_of_Photochemical_Reactions_MPhil_${res}.${ext}`,
    mimeType,
    durationSec: Math.round(totalDurationMs / 1000),
  };
}
