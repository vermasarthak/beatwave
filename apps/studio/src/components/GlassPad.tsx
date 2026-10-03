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

  const padColor = pad.color || '#38bdf8';

  // Dynamic spring translation along Z
  const zTranslate = isStruck ? -24 * compression : isArmed ? -6 : isHovered ? -2 : 0;
  const brightnessBoost = isStruck ? 0.35 : isArmed ? 0.2 : isHovered ? 0.08 * hoverProximity : 0;

  return (
    <div
      onPointerDown={() => onPointerDown(pad.padIndex)}
      onPointerUp={() => onPointerUp(pad.padIndex)}
      style={{
        transform: `translateZ(${zTranslate}px)`,
        backgroundColor: isStruck
          ? `${padColor}44`
          : isArmed
          ? `${padColor}22`
          : `rgba(255, 255, 255, ${0.04 + brightnessBoost})`,
        borderColor: isStruck
          ? padColor
          : isArmed
          ? `${padColor}99`
          : isHovered
          ? `${padColor}66`
          : 'rgba(255, 255, 255, 0.1)',
        boxShadow: isStruck
          ? `0 0 24px ${padColor}88, inset 0 0 16px ${padColor}44`
          : isArmed
          ? `0 0 12px ${padColor}44`
          : undefined
      }}
      className="relative rounded-2xl p-3 flex flex-col justify-between cursor-pointer border select-none transition-all duration-75 group shadow-lg backdrop-blur-md"
    >
      {/* Top row: Pad index & keyboard shortcut */}
      <div className="flex justify-between items-center text-[11px] font-mono">
        <span className="font-semibold text-slate-300 group-hover:text-white transition-colors">
          {pad.padIndex + 1}
        </span>
        <span className="bg-white/10 px-1.5 py-0.5 rounded text-[10px] text-slate-300 border border-white/10 font-bold">
          {shortcutKey}
        </span>
      </div>

      {/* Center: Pad Main Label */}
      <div className="my-auto text-center px-1">
        <div
          className={`text-xs font-semibold tracking-wide transition-colors leading-tight ${
            isStruck ? 'text-white' : isArmed ? 'text-amber-100' : 'text-slate-100'
          }`}
        >
          {pad.label}
        </div>
      </div>

      {/* Bottom: Action summary & status ring */}
      <div className="flex justify-between items-center text-[10px] text-slate-400">
        <span className="truncate max-w-[85px] font-mono text-[9px] text-slate-400 uppercase tracking-wider">
          {pad.action.type === 'SampleTrigger' ? pad.action.sampleId.replace(/^(fl_|pow_|run_|hb_|proc_)/, '') : pad.action.type}
        </span>
        {/* Glow indicator dot */}
        <div
          style={{
            backgroundColor: isStruck || isArmed ? padColor : undefined,
            boxShadow: isStruck ? `0 0 10px ${padColor}` : undefined
          }}
          className={`w-2.5 h-2.5 rounded-full transition-all ${
            !isStruck && !isArmed
              ? isHovered
                ? 'bg-white/60'
                : 'bg-white/15'
              : ''
          }`}
        />
      </div>
    </div>
  );
};
