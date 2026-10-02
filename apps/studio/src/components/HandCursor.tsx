import React from 'react';
import { Point3D } from '@beatwave/protocol';

interface HandCursorProps {
  fingertip: Point3D | null;
  pinchDistance: number;
  confidence: number;
  isStriking: boolean;
}

export const HandCursor: React.FC<HandCursorProps> = ({
  fingertip,
  pinchDistance,
  confidence,
  isStriking
}) => {
  if (!fingertip || confidence < 0.3) return null;

  // Convert normalized [0..1] camera coordinates to percentage
  const leftPercent = `${(fingertip.x * 100).toFixed(2)}%`;
  const topPercent = `${(fingertip.y * 100).toFixed(2)}%`;

  // Scale depth: Z is negative closer to camera/screen
  const depthScale = Math.max(0.6, Math.min(1.8, 1.0 - fingertip.z * 5));
  const isPinching = pinchDistance < 0.055;

  return (
    <div
      className="pointer-events-none absolute z-40 transition-transform duration-75 ease-out -translate-x-1/2 -translate-y-1/2"
      style={{
        left: leftPercent,
        top: topPercent,
        transform: `translate(-50%, -50%) scale(${depthScale})`
      }}
    >
      {/* Outer focus halo */}
      <div
        className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all ${
          isStriking
            ? 'border-cyan-300 scale-125 shadow-[0_0_20px_#38bdf8] bg-cyan-400/30'
            : isPinching
            ? 'border-amber-400 scale-90 shadow-[0_0_15px_#f59e0b] bg-amber-400/20'
            : 'border-white/40 shadow-[0_0_12px_rgba(255,255,255,0.2)] bg-white/5'
        }`}
      >
        {/* Core fingertip marker */}
        <div
          className={`w-2.5 h-2.5 rounded-full transition-all ${
            isStriking
              ? 'bg-white shadow-[0_0_10px_#ffffff]'
              : isPinching
              ? 'bg-amber-300 shadow-[0_0_8px_#f59e0b]'
              : 'bg-cyan-400 shadow-[0_0_8px_#38bdf8]'
          }`}
        />
      </div>

      {/* Ripple ring on strike */}
      {isStriking && (
        <div className="absolute inset-0 rounded-full border border-cyan-400 animate-ping opacity-75" />
      )}
    </div>
  );
};
