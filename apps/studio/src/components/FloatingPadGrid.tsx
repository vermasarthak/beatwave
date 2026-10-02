import React from 'react';
import { PadBank, PadLifecycleState } from '@beatwave/protocol';
import { GlassPad } from './GlassPad.js';

interface FloatingPadGridProps {
  bank: PadBank;
  padStates: Map<number, { state: PadLifecycleState; compression: number; hoverProximity: number }>;
  onPointerTrigger: (padIndex: number) => void;
  onPointerRelease: (padIndex: number) => void;
}

const SHORTCUT_KEYS = [
  '1', '2', '3', '4',
  'Q', 'W', 'E', 'R',
  'A', 'S', 'D', 'F',
  'Z', 'X', 'C', 'V'
];

export const FloatingPadGrid: React.FC<FloatingPadGridProps> = ({
  bank,
  padStates,
  onPointerTrigger,
  onPointerRelease
}) => {
  return (
    <div className="relative w-full max-w-[620px] aspect-square p-6 perspective-launchpad">
      {/* Outer floating chassis border */}
      <div className="w-full h-full rounded-3xl p-4 glass-panel border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.7)] flex flex-col justify-between">
        {/* 4x4 Pad Grid */}
        <div className="grid grid-cols-4 grid-rows-4 gap-3.5 w-full h-full">
          {bank.pads.map((pad, idx) => {
            const st = padStates.get(pad.padIndex) || {
              state: 'OUTSIDE',
              compression: 0,
              hoverProximity: 0
            };
            return (
              <GlassPad
                key={pad.id}
                pad={pad}
                state={st.state}
                compression={st.compression}
                hoverProximity={st.hoverProximity}
                shortcutKey={SHORTCUT_KEYS[idx] || ''}
                onPointerDown={onPointerTrigger}
                onPointerUp={onPointerRelease}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};
