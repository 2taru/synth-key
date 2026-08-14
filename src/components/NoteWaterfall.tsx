import { useEffect, useRef } from 'react';
import type { AudioEngine } from '../audio/audioEngine';
import { isBlackKey, keyGeometry } from '../audio/notes';
import { hexToRgb } from '../settings';
import { roundRectPath } from './roundRect';

interface Props {
  engine: AudioEngine;
  low: number;
  high: number;
  whiteColor: string;
  blackColor: string;
  /** Rise speed in px per second. */
  speed: number;
}

interface Segment {
  left: number; // fraction 0..1
  width: number; // fraction 0..1
  black: boolean;
  velocity: number; // 0..127
  start: number; // performance.now() ms
  end: number | null; // null while still held
}

/**
 * A live "piano roll": every note played rises from the keyboard line and
 * scrolls up, its length tracking how long the note is held and its brightness
 * its velocity. Subscribes straight to the engine's note events.
 */
export function NoteWaterfall({ engine, low, high, whiteColor, blackColor, speed }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const segmentsRef = useRef<Segment[]>([]);
  const activeRef = useRef<Map<number, Segment>>(new Map());
  const geomRef = useRef(keyGeometry(low, high));
  const colorsRef = useRef({ white: hexToRgb(whiteColor), black: hexToRgb(blackColor) });
  const speedRef = useRef(speed);

  useEffect(() => {
    geomRef.current = keyGeometry(low, high);
  }, [low, high]);
  useEffect(() => {
    colorsRef.current = { white: hexToRgb(whiteColor), black: hexToRgb(blackColor) };
  }, [whiteColor, blackColor]);
  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  // Collect note events into rising segments.
  useEffect(() => {
    const onNote = (midi: number, on: boolean, velocity: number) => {
      const now = performance.now();
      if (on) {
        const existing = activeRef.current.get(midi);
        if (existing) existing.end = now; // retrigger closes the old bar
        const g = geomRef.current.get(midi);
        if (!g) return; // outside the visible window
        const seg: Segment = {
          left: g.left,
          width: g.width,
          black: isBlackKey(midi),
          velocity,
          start: now,
          end: null,
        };
        activeRef.current.set(midi, seg);
        segmentsRef.current.push(seg);
      } else {
        const seg = activeRef.current.get(midi);
        if (seg) {
          seg.end = now;
          activeRef.current.delete(midi);
        }
      }
    };
    return engine.addNoteListener(onNote);
  }, [engine]);

  // Canvas sizing + animation loop.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let dpr = 1;
    const resize = () => {
      dpr = window.devicePixelRatio || 1;
      canvas.width = Math.max(1, Math.round(canvas.clientWidth * dpr));
      canvas.height = Math.max(1, Math.round(canvas.clientHeight * dpr));
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    let raf = 0;
    const draw = () => {
      const now = performance.now();
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      const speed = speedRef.current;
      const kept: Segment[] = [];
      for (const s of segmentsRef.current) {
        const end = s.end ?? now;
        const bottom = h - ((now - end) * speed) / 1000;
        if (bottom < 0) continue; // fully scrolled off the top
        kept.push(s);

        const top = h - ((now - s.start) * speed) / 1000;
        const y = Math.max(0, top);
        const barH = Math.max(3, bottom - y);
        const x = s.left * w + 1;
        const bw = Math.max(2, s.width * w - 2);
        const rgb = s.black ? colorsRef.current.black : colorsRef.current.white;
        const alpha = 0.4 + 0.6 * (s.velocity / 127);

        ctx.fillStyle = `rgba(${rgb},${alpha})`;
        roundRectPath(ctx, x, y, bw, barH, 3);
        ctx.fill();

        // Bright cap at the keyboard line while the note is still held.
        if (s.end === null) {
          ctx.fillStyle = `rgba(${rgb},1)`;
          roundRectPath(ctx, x, h - 4, bw, 4, 2);
          ctx.fill();
        }
      }
      segmentsRef.current = kept;

      // Hit line at the keyboard edge.
      ctx.fillStyle = 'rgba(255,255,255,0.14)';
      ctx.fillRect(0, h - 1, w, 1);

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return <canvas ref={canvasRef} className="waterfall" />;
}
