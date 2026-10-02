import React from 'react';
import { PadConfig, PadLifecycleState } from '@beatwave/protocol';

interface GlassPadProps {
  pad: PadConfig;
  state: PadLifecycleState;
  compression: number; // 0..1
  hoverProximity: number; // 0..1
  onPointerDown: (index: number) => void;
  onPointerUp: (index: number) => void;
  shortcutKey: string;
}

export const GlassPad: React.FC<GlassPadProps> = ({
  pad,
  state,
  compression,
  hoverProximity,
  onPointerDown,
  onPointerUp,
  shortcutKey
}) => {
  const isHovered = state === 'HOVER';
  const isArmed = state === 'ARMED';
  const isStruck = state === 'STRIKE' || state === 'HELD';

  // Dynamic spring translation along Z
  const zTranslate = isStruck ? -24 * compression : isArmed ? -6 : isHovered ? -2 : 0;
  const brightnessBoost = isStruck ? 0.35 : isArmed ? 0.2 : isHovered ? 0.08 * hoverProximity : 0;

  return (
    <div
      onPointerDown={() => onPointerDown(pad.padIndex)}
      onPointerUp={() => onPointerUp(pad.padIndex)}
      style={{
        transform: `translateZ(${zTranslate}px)`,
        backgroundColor: `rgba(255, 255, 255, ${0.04 + brightnessBoost})`
      }}
      className={`relative rounded-xl p-3 flex flex-col justify-between cursor-pointer border select-none transition-all duration-75 ${
        isStruck
          ? 'pad-strike border-cyan-400'
          : isArmed
          ? 'pad-armed border-amber-400/80'
          : isHovered
          ? 'pad-hover border-cyan-400/40'
          : 'pad-glass border-white/10'
      }`}
    >
      {/* Top row: Pad index & keyboard shortcut */}
      <div className="flex justify-between items-center text-[11px] font-mono text-slate-400">
        <span className="font-semibold text-slate-300">{pad.padIndex + 1}</span>
        <span className="bg-white/5 px-1.5 py-0.5 rounded text-[10px] text-slate-400 border border-white/5">
          {shortcutKey}
        </span>
      </div>

      {/* Center: Pad Label */}
      <div className="my-auto text-center">
        <span
          className={`text-xs font-medium tracking-wide transition-colors ${
            isStruck ? 'text-white font-bold' : isArmed ? 'text-amber-200' : 'text-slate-200'
          }`}
        >
          {pad.label}
        </span>
      </div>

      {/* Bottom: Action summary & status ring */}
      <div className="flex justify-between items-center text-[10px] text-slate-400">
        <span className="truncate max-w-[80px] font-mono">
          {pad.action.type === 'SampleTrigger' ? pad.action.sampleId.replace('proc_', '') : pad.action.type}
        </span>
        {/* Glow indicator dot */}
        <div
          className={`w-2 h-2 rounded-full transition-all ${
            isStruck
              ? 'bg-cyan-300 shadow-[0_0_8px_#38bdf8]'
              : isArmed
              ? 'bg-amber-400 shadow-[0_0_6px_#f59e0b]'
              : isHovered
              ? 'bg-cyan-500/60'
              : 'bg-white/10'
          }`}
        />
      </div>
    </div>
  );
};
