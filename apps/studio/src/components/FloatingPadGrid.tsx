import React, { useState, useEffect, useRef, useCallback } from 'react';
import { PadBank, PadLifecycleState, Rect2D } from '@beatwave/protocol';
import { MpcPad } from './MpcPad.js';

interface FloatingPadGridProps {
  bank: PadBank;
  padStates: Map<number, { state: PadLifecycleState; compression: number; hoverProximity: number }>;
  onPointerTrigger: (padIndex: number) => void;
  onPointerRelease: (padIndex: number) => void;
  onPadBoundsMeasured?: (boundsMap: Map<number, Rect2D>) => void;
  bpm?: number;
  kitName?: string;
  album?: string;
  songBackingActive?: boolean;
  onToggleSongBacking?: () => void;
  transportState?: 'playing' | 'stopped' | 'paused';
  onToggleTransport?: () => void;
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
  onPointerRelease,
  onPadBoundsMeasured,
  bpm = 85,
  kitName = 'Runaway',
  album = 'MBDTF',
  songBackingActive = false,
  onToggleSongBacking,
  transportState = 'stopped',
  onToggleTransport
}) => {
  const [lastHit, setLastHit] = useState<{ padIndex: number; label: string; time: number } | null>(null);
  const [activeBankTab, setActiveBankTab] = useState<'A' | 'B' | 'C' | 'D'>('A');
  const gridRef = useRef<HTMLDivElement | null>(null);

  // Automatically measure exact screen coordinates of all 16 pads and sync with GestureRuntime
  const measureBounds = useCallback(() => {
    if (!gridRef.current || !onPadBoundsMeasured) return;
    const padEls = gridRef.current.querySelectorAll<HTMLElement>('[data-pad-index]');
    const boundsMap = new Map<number, Rect2D>();
    const winW = window.innerWidth;
    const winH = window.innerHeight;
    if (winW <= 0 || winH <= 0) return;

    padEls.forEach((el) => {
      const idxAttr = el.getAttribute('data-pad-index');
      if (idxAttr === null) return;
      const padIdx = Number(idxAttr);
      const rect = el.getBoundingClientRect();
      boundsMap.set(padIdx, {
        minX: Math.max(0, rect.left / winW),
        maxX: Math.min(1, rect.right / winW),
        minY: Math.max(0, rect.top / winH),
        maxY: Math.min(1, rect.bottom / winH)
      });
    });

    if (boundsMap.size > 0) {
      onPadBoundsMeasured(boundsMap);
    }
  }, [onPadBoundsMeasured]);

  useEffect(() => {
    measureBounds();
    window.addEventListener('resize', measureBounds);
    const t = setTimeout(measureBounds, 150);
    return () => {
      window.removeEventListener('resize', measureBounds);
      clearTimeout(t);
    };
  }, [measureBounds, bank]);

  // Detect newly struck pad to update LCD screen in realtime
  useEffect(() => {
    for (const [idx, st] of padStates.entries()) {
      if (st.state === 'STRIKE' || st.state === 'HELD') {
        const pad = bank.pads.find((p) => p.padIndex === idx);
        if (pad) {
          setLastHit({ padIndex: idx, label: pad.label, time: Date.now() });
        }
        break;
      }
    }
  }, [padStates, bank]);

  const padNumStr = lastHit ? (lastHit.padIndex + 1).toString().padStart(2, '0') : '--';
  const padLabelStr = lastHit ? `"${lastHit.label}"` : 'READY TO PLAY';

  return (
    <div className="relative w-full max-w-[720px] p-2 perspective-launchpad">
      {/* Akai MPC 2000XL Chassis */}
      <div className="w-full rounded-[28px] p-5 sm:p-6 mpc-chassis border border-stone-300 flex flex-col gap-4 relative overflow-hidden select-none">
        
        {/* Hardware Corner Screws */}
        <div className="absolute top-3 left-3 mpc-screw" />
        <div className="absolute top-3 right-3 mpc-screw" />
        <div className="absolute bottom-3 left-3 mpc-screw" />
        <div className="absolute bottom-3 right-3 mpc-screw" />

        {/* 1. TOP HEADER: Akai Professional Branding & Retro Green Backlit LCD Screen */}
        <div className="flex flex-col sm:flex-row items-stretch justify-between gap-3 pt-1">
          {/* Akai Professional Brand Badge */}
          <div className="flex flex-col justify-center px-1">
            <div className="flex items-baseline gap-2">
              <span className="text-[#a81923] font-black italic tracking-tighter text-2xl font-serif leading-none">
                AKAI
              </span>
              <span className="text-[11px] font-black tracking-widest text-zinc-700 uppercase">
                professional
              </span>
            </div>
            <div className="text-[8px] font-extrabold tracking-widest text-zinc-500 uppercase mt-0.5">
              MIDI PRODUCTION CENTER
            </div>
            <div className="text-xl sm:text-2xl font-black italic tracking-tight text-slate-800 leading-none mt-0.5">
              MPC<span className="text-[#1d4ed8]">2000XL</span>
            </div>
          </div>

          {/* Authentic Retro Green Backlit Dot-Matrix LCD Screen */}
          <div className="flex-1 rounded-xl p-3 border-2 border-stone-400/80 mpc-lcd-screen flex flex-col justify-between shadow-inner min-h-[96px]">
            {/* LCD Row 1: Sequencer & Status */}
            <div className="flex justify-between items-center text-[10px] sm:text-[11px] border-b border-emerald-500/30 pb-1">
              <span className="font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                SQ:01 {transportState === 'playing' || songBackingActive ? '(PLAYING)' : '(STOPPED)'}
              </span>
              <span>TEMPO: {bpm.toFixed(1)} BPM</span>
              <span>TS: 4/4</span>
              <span className="bg-emerald-950/60 px-1 rounded text-[9px] border border-emerald-500/40">BANK {activeBankTab}</span>
            </div>

            {/* LCD Row 2: Active Track / Vocal Stems info */}
            <div className="py-1 flex justify-between items-center">
              <div className="text-xs sm:text-sm font-black tracking-wide truncate max-w-[260px] text-emerald-300">
                KIT: {kitName.toUpperCase()} [{album.toUpperCase()}]
              </div>
              <div className="text-[10px] tracking-wider font-mono opacity-80 hidden sm:block">
                16-BIT / 48.0 kHz
              </div>
            </div>

            {/* LCD Row 3: Live Pad Strike feedback */}
            <div className="flex justify-between items-center text-[10px] sm:text-[11px] pt-1 border-t border-emerald-500/30">
              <div className="truncate max-w-[240px]">
                LAST: <span className="font-bold text-white">PAD {padNumStr}</span> {padLabelStr}
              </div>
              {/* Animated VU Meter */}
              <div className="font-mono text-[9px] tracking-tighter text-emerald-400">
                {lastHit && Date.now() - lastHit.time < 300 ? '■■■■■■■■' : '■■■■□□□□'}
              </div>
            </div>
          </div>
        </div>

        {/* 2. HARDWARE FUNCTION BUTTONS & BANK SELECTORS */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-1 py-0.5 border-y border-stone-300/80 text-[10px] font-bold text-zinc-700">
          {/* MPC Bank Selectors */}
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] font-extrabold text-zinc-500 uppercase tracking-wider mr-1">BANK</span>
            {(['A', 'B', 'C', 'D'] as const).map((b) => (
              <button
                key={b}
                onClick={() => setActiveBankTab(b)}
                className={`px-2.5 py-1 rounded text-[10px] font-black transition-all ${
                  activeBankTab === b
                    ? 'bg-amber-400 text-black shadow-md border border-amber-500'
                    : 'mpc-btn text-zinc-700 hover:text-black'
                }`}
              >
                {b}
              </button>
            ))}
          </div>

          {/* Iconic Hardware Toggles */}
          <div className="flex items-center gap-1.5">
            <button className="mpc-btn px-2.5 py-1 rounded text-[10px] flex items-center gap-1.5 text-zinc-800">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600 shadow-[0_0_5px_#ef4444]" />
              FULL LEVEL
            </button>
            <button className="mpc-btn px-2 py-1 rounded text-[10px] text-zinc-700 hidden sm:inline-block">
              16 LEVELS
            </button>
            <button className="mpc-btn px-2 py-1 rounded text-[10px] text-zinc-700 hidden sm:inline-block">
              NOTE REPEAT
            </button>
            <button
              onClick={onToggleSongBacking}
              className={`px-3 py-1 rounded text-[10px] font-black flex items-center gap-1.5 transition-all ${
                songBackingActive
                  ? 'bg-emerald-600 text-white shadow-[0_0_12px_rgba(16,185,129,0.7)] border border-emerald-400'
                  : 'mpc-btn text-zinc-700 hover:text-black'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${songBackingActive ? 'bg-white animate-ping' : 'bg-zinc-400'}`} />
              SONG STEM LOOP
            </button>
          </div>
        </div>

        {/* 3. 4x4 AUTHENTIC MPC RUBBER PAD GRID */}
        <div className="w-full rounded-2xl p-3 sm:p-4 mpc-pad-well border border-black/80">
          <div ref={gridRef} className="grid grid-cols-4 grid-rows-4 gap-2.5 sm:gap-3.5 w-full aspect-square">
            {bank.pads.map((pad, idx) => {
              const st = padStates.get(pad.padIndex) || {
                state: 'OUTSIDE',
                compression: 0,
                hoverProximity: 0
              };
              return (
                <MpcPad
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

        {/* 4. BOTTOM HARDWARE CONTROL BAR: Transport Controls & Ribbed Data Jog Wheel */}
        <div className="flex items-center justify-between pt-1 px-1">
          {/* MPC Hardware Transport Bar */}
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleTransport}
              title="Record Ready"
              className="mpc-btn px-3 py-1.5 rounded-md flex items-center gap-1.5 font-bold text-xs text-zinc-800"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 shadow-[0_0_8px_#ef4444]" />
              REC
            </button>
            <button
              onClick={onToggleTransport}
              title="Stop"
              className="mpc-btn px-3 py-1.5 rounded-md flex items-center gap-1.5 font-bold text-xs text-zinc-800"
            >
              <span className="w-2 h-2 bg-zinc-800" />
              STOP
            </button>
            <button
              onClick={onToggleTransport}
              title="Play"
              className={`px-3.5 py-1.5 rounded-md flex items-center gap-1.5 font-extrabold text-xs transition-all ${
                transportState === 'playing'
                  ? 'bg-emerald-600 text-white shadow-[0_0_12px_#10b981] border border-emerald-400'
                  : 'mpc-btn text-zinc-800'
              }`}
            >
              <span className={`w-0 h-0 border-y-[4px] border-y-transparent border-l-[7px] ${transportState === 'playing' ? 'border-l-white' : 'border-l-emerald-600'}`} />
              PLAY
            </button>
          </div>

          {/* Ribbed Rotary Data Jog Wheel */}
          <div className="flex items-center gap-3">
            <div className="text-[9px] font-black uppercase tracking-wider text-zinc-500 text-right leading-tight hidden sm:block">
              DATA / JOG<br />WHEEL
            </div>
            <div className="relative w-11 h-11 rounded-full mpc-jog-wheel border-2 border-stone-400 flex items-center justify-center cursor-pointer shadow-md group hover:rotate-12 transition-transform duration-150">
              <div className="w-2.5 h-2.5 rounded-full bg-stone-500/70 shadow-inner absolute top-2 right-2" />
              <div className="text-[10px] text-zinc-600 font-mono font-bold select-none group-hover:text-black">
                ❖
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
