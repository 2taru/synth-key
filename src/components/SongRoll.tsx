import { useEffect, useRef } from 'react';
import { isBlackKey, keyGeometry } from '../audio/notes';
import type { SeqNote } from '../audio/sequence';
import { roundRectPath } from './roundRect';

interface Props {
  notes: SeqNote[];
  /** Current song time in seconds (negative during the lead-in). */
  getTime: () => number;
  low: number;
  high: number;
}

const SPEED = 130; // px per second
const HEIGHT = 220;
const WHITE_RGB = '108,140,255';
const BLACK_RGB = '139,92,246';

/** Falling-note ("Synthesia") view: notes descend and reach the keyboard line
 *  exactly at their scheduled time. */
export function SongRoll({ notes, getTime, low, high }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const geomRef = useRef(keyGeometry(low, high));
  const notesRef = useRef(notes);
  const timeRef = useRef(getTime);

  useEffect(() => {
    geomRef.current = keyGeometry(low, high);
  }, [low, high]);
  useEffect(() => {
    notesRef.current = notes;
  }, [notes]);
  useEffect(() => {
    timeRef.current = getTime;
  }, [getTime]);

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
      const t = timeRef.current();
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      const geom = geomRef.current;
      const lookahead = h / SPEED + 1;
      for (const n of notesRef.current) {
        if (n.start - t > lookahead) continue; // too far in the future
        if (t - (n.start + n.duration) > 0.5) continue; // already gone
        const g = geom.get(n.midi);
        if (!g) continue; // outside the visible window

        const bottom = h + (t - n.start) * SPEED;
        const top = h + (t - (n.start + n.duration)) * SPEED;
        const drawTop = Math.max(0, top);
        const drawBottom = Math.min(h, bottom);
        if (drawBottom <= 0 || drawTop >= h) continue;

        const black = isBlackKey(n.midi);
        const rgb = black ? BLACK_RGB : WHITE_RGB;
        const active = t >= n.start && t <= n.start + n.duration;
        const alpha = active ? 0.97 : 0.45 + 0.5 * (n.velocity / 127);
        const x = g.left * w + 1;
        const bw = Math.max(2, g.width * w - 2);

        ctx.fillStyle = `rgba(${rgb},${alpha})`;
        roundRectPath(ctx, x, drawTop, bw, Math.max(3, drawBottom - drawTop), 3);
        ctx.fill();
      }

      ctx.fillStyle = 'rgba(255,255,255,0.18)';
      ctx.fillRect(0, h - 1, w, 1);

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return <canvas ref={canvasRef} className="waterfall songroll" style={{ height: HEIGHT }} />;
}
