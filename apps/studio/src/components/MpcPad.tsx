import React from 'react';
import { PadConfig, PadLifecycleState } from '@beatwave/protocol';

interface MpcPadProps {
  pad: PadConfig;
  state: PadLifecycleState;
  compression: number; // 0..1
  hoverProximity: number; // 0..1
  onPointerDown: (index: number) => void;
  onPointerUp: (index: number) => void;
  shortcutKey: string;
}

export const MpcPadComponent: React.FC<MpcPadProps> = ({
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

  const padColor = pad.color || '#ef4444';
  const padNumStr = (pad.padIndex + 1).toString().padStart(2, '0');

  // Dynamic spring / compression
  const depthCompression = Math.max(compression, isStruck ? 1.0 : isArmed ? 0.6 : 0);
  const yTranslate = isStruck ? 4 : isArmed ? 2 : Math.round(depthCompression * 3);
  const scale = isStruck ? 0.96 : isArmed ? 0.98 : isHovered ? 1.01 : 1.0;

  return (
    <div
      data-pad-index={pad.padIndex}
      onPointerDown={(e) => {
        e.preventDefault();
        onPointerDown(pad.padIndex);
      }}
      onPointerUp={(e) => {
        e.preventDefault();
        onPointerUp(pad.padIndex);
      }}
      style={{
        touchAction: 'manipulation',
        transform: `translateY(${yTranslate}px) scale(${scale})`,
        boxShadow: isStruck
          ? `0 0 30px ${padColor}, inset 0 0 20px ${padColor}bb, 0 1px 2px rgba(0,0,0,0.95)`
          : isArmed
          ? `0 0 16px rgba(245, 158, 11, 0.6), inset 0 0 10px rgba(245, 158, 11, 0.4)`
          : isHovered
          ? `0 0 12px rgba(255, 255, 255, 0.35)`
          : undefined
      }}
      className={`relative rounded-xl p-2.5 flex flex-col justify-between cursor-pointer select-none transition-all duration-75 group mpc-rubber-pad overflow-hidden ${
        isStruck
          ? 'mpc-rubber-pad-strike'
          : isHovered
          ? 'mpc-rubber-pad-hover'
          : ''
      }`}
    >
      {/* 2.5D Strike Impact Ring */}
      {isStruck && (
        <div
          style={{ borderColor: padColor }}
          className="absolute inset-0 rounded-xl border-2 pointer-events-none animate-ping opacity-80"
        />
      )}
      {/* Top row: MPC Pad Number & Keyboard Shortcut */}
      <div className="flex justify-between items-center text-[10px] font-mono leading-none">
        <span className="font-extrabold tracking-wider text-slate-400 group-hover:text-amber-400 transition-colors">
          PAD {padNumStr}
        </span>
        <span className="bg-black/50 px-1.5 py-0.5 rounded text-[9px] text-zinc-300 font-bold border border-white/10 shadow-inner">
          {shortcutKey}
        </span>
      </div>

      {/* Center: Real Vocal Chop / Sample Lyric */}
      <div className="my-auto text-center px-0.5">
        <div
          className={`text-[11px] sm:text-xs font-black tracking-tight leading-tight line-clamp-2 transition-all ${
            isStruck
              ? 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.9)] scale-105'
              : isArmed
              ? 'text-amber-200'
              : isHovered
              ? 'text-white'
              : 'text-zinc-200'
          }`}
        >
          {pad.label}
        </div>
      </div>

      {/* Bottom: Accent LED bar and sample descriptor */}
      <div className="flex justify-between items-center text-[9px]">
        <span className="truncate max-w-[70px] font-mono text-[8px] text-zinc-400 uppercase tracking-widest font-semibold">
          {pad.action.type === 'SampleTrigger' ? pad.action.sampleId.replace(/^(fl_|pow_|run_|hb_|proc_)/, '') : 'SAMPLE'}
        </span>
        
        {/* MPC Strike LED indicator */}
        <div
          style={{
            backgroundColor: isStruck ? '#ef4444' : isArmed ? '#f59e0b' : isHovered ? '#38bdf8' : '#27272a',
            boxShadow: isStruck
              ? '0 0 10px #ef4444, 0 0 4px #fff'
              : isArmed
              ? '0 0 8px #f59e0b'
              : undefined
          }}
          className="w-3.5 h-1.5 rounded-sm border border-black/60 transition-all duration-75"
        />
      </div>
    </div>
  );
};

export const MpcPad = React.memo(MpcPadComponent, (prev, next) => {
  return (
    prev.state === next.state &&
    prev.compression === next.compression &&
    prev.hoverProximity === next.hoverProximity &&
    prev.pad.id === next.pad.id &&
    prev.pad.label === next.pad.label &&
    prev.shortcutKey === next.shortcutKey
  );
});
