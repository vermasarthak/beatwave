import React, { useImperativeHandle, forwardRef, useRef } from 'react';
import { Point3D } from '@beatwave/protocol';

export interface HandCursorHandle {
  update: (
    fingertip: Point3D | null,
    pinchDistance: number,
    confidence: number,
    isStriking: boolean
  ) => void;
}

export const HandCursor = forwardRef<HandCursorHandle, {}>((_, ref) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const coreRef = useRef<HTMLDivElement | null>(null);
  const haloRef = useRef<HTMLDivElement | null>(null);
  const rippleRef = useRef<HTMLDivElement | null>(null);

  useImperativeHandle(ref, () => ({
    update: (fingertip, pinchDistance, confidence, isStriking) => {
      const container = containerRef.current;
      if (!container) return;

      if (!fingertip || confidence < 0.25) {
        container.style.display = 'none';
        return;
      }

      container.style.display = 'block';
      container.style.left = `${(fingertip.x * 100).toFixed(2)}%`;
      container.style.top = `${(fingertip.y * 100).toFixed(2)}%`;

      const depthScale = Math.max(0.6, Math.min(1.8, 1.0 - fingertip.z * 5));
      container.style.transform = `translate(-50%, -50%) scale(${depthScale})`;

      const isPinching = pinchDistance < 0.055;
      if (haloRef.current) {
        haloRef.current.className = `w-9 h-9 rounded-full border flex items-center justify-center transition-all ${
          isStriking
            ? 'border-cyan-300 scale-125 shadow-[0_0_20px_#38bdf8] bg-cyan-400/30'
            : isPinching
            ? 'border-amber-400 scale-90 shadow-[0_0_15px_#f59e0b] bg-amber-400/20'
            : 'border-white/40 shadow-[0_0_12px_rgba(255,255,255,0.2)] bg-white/5'
        }`;
      }
      if (coreRef.current) {
        coreRef.current.className = `w-2.5 h-2.5 rounded-full transition-all ${
          isStriking
            ? 'bg-white shadow-[0_0_10px_#ffffff]'
            : isPinching
            ? 'bg-amber-300 shadow-[0_0_8px_#f59e0b]'
            : 'bg-cyan-400 shadow-[0_0_8px_#38bdf8]'
        }`;
      }
      if (rippleRef.current) {
        rippleRef.current.style.display = isStriking ? 'block' : 'none';
      }
    }
  }));

  return (
    <div
      ref={containerRef}
      style={{ display: 'none' }}
      className="pointer-events-none absolute z-40 -translate-x-1/2 -translate-y-1/2 will-change-transform"
    >
      <div ref={haloRef} className="w-9 h-9 rounded-full border flex items-center justify-center transition-all">
        <div ref={coreRef} className="w-2.5 h-2.5 rounded-full transition-all" />
      </div>
      <div
        ref={rippleRef}
        style={{ display: 'none' }}
        className="absolute inset-0 rounded-full border border-cyan-400 animate-ping opacity-75"
      />
    </div>
  );
});

HandCursor.displayName = 'HandCursor';
