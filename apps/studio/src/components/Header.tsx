import React from 'react';
import {
  Volume2,
  Camera,
  CameraOff,
  Sliders,
  Play,
  Pause,
  Activity,
  Sparkles,
  Maximize2
} from 'lucide-react';
import { SourceType, QuantizeGrid } from '@beatwave/protocol';

interface HeaderProps {
  sourceType: SourceType;
  onSourceChange: (s: SourceType) => void;
  bpm: number;
  onBpmChange: (b: number) => void;
  quantize: QuantizeGrid;
  onQuantizeChange: (q: QuantizeGrid) => void;
  cameraActive: boolean;
  onToggleCamera: () => void;
  onOpenCalibration: () => void;
  onOpenAutoKit: () => void;
  demoActive: boolean;
  onToggleDemo: () => void;
  showDebug: boolean;
  onToggleDebug: () => void;
  transportState: 'playing' | 'stopped' | 'paused';
  onToggleTransport: () => void;
  trackingState: 'idle' | 'tracking' | 'error';
}

export const Header: React.FC<HeaderProps> = ({
  sourceType,
  onSourceChange,
  bpm,
  onBpmChange,
  quantize,
  onQuantizeChange,
  cameraActive,
  onToggleCamera,
  onOpenCalibration,
  onOpenAutoKit,
  demoActive,
  onToggleDemo,
  showDebug,
  onToggleDebug,
  transportState,
  onToggleTransport,
  trackingState
}) => {
  return (
    <header className="h-14 px-4 glass-panel border-b border-white/10 flex items-center justify-between text-xs select-none z-30">
      {/* Brand & Tagline */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 rounded-full bg-cyan-400 shadow-[0_0_10px_#38bdf8]" />
          <span className="font-bold tracking-wider text-sm text-white">BEATWAVE</span>
        </div>
        <span className="hidden md:inline text-slate-400 border-l border-white/10 pl-3 italic text-[11px]">
          Your hands are the controller.
        </span>
      </div>

      {/* Center Controls: Transport, Tempo, Quantize, Source */}
      <div className="flex items-center gap-3">
        {/* Transport Play/Stop */}
        <button
          onClick={onToggleTransport}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition ${
            transportState === 'playing'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/5'
          }`}
          title="Spacebar to toggle"
        >
          {transportState === 'playing' ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          <span>{transportState === 'playing' ? 'STOP' : 'PLAY'}</span>
        </button>

        {/* BPM Selector */}
        <div className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded border border-white/5">
          <span className="text-slate-400">BPM</span>
          <input
            type="number"
            min={40}
            max={240}
            value={bpm}
            onChange={(e) => onBpmChange(Number(e.target.value))}
            className="w-12 bg-transparent text-white font-mono text-center focus:outline-none"
          />
        </div>

        {/* Quantize Mode */}
        <div className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded border border-white/5">
          <span className="text-slate-400">SNAP</span>
          <select
            value={quantize}
            onChange={(e) => onQuantizeChange(e.target.value as QuantizeGrid)}
            className="bg-transparent text-white focus:outline-none cursor-pointer"
          >
            <option value="off" className="bg-[#12151b]">Off</option>
            <option value="1/4" className="bg-[#12151b]">1/4</option>
            <option value="1/8" className="bg-[#12151b]">1/8</option>
            <option value="1/16" className="bg-[#12151b]">1/16</option>
          </select>
        </div>

        {/* Source Dropdown */}
        <div className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded border border-white/5">
          <span className="text-slate-400">SRC</span>
          <select
            value={sourceType}
            onChange={(e) => onSourceChange(e.target.value as SourceType)}
            className="bg-transparent text-cyan-300 font-medium focus:outline-none cursor-pointer"
          >
            <option value="procedural" className="bg-[#12151b]">Procedural 808</option>
            <option value="local" className="bg-[#12151b]">Local Audio</option>
            <option value="spotify" className="bg-[#12151b]">Spotify (Transport)</option>
            <option value="midi_only" className="bg-[#12151b]">MIDI Out Only</option>
          </select>
        </div>
      </div>

      {/* Right Controls: AutoKit, Camera, Calibration, Demo Mode, Debug */}
      <div className="flex items-center gap-2">
        {/* Auto Kit */}
        <button
          onClick={onOpenAutoKit}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5 transition"
          title="Generate 4x4 Kit from Local Audio via Audio Lab"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">Auto Kit</span>
        </button>

        {/* Demo Mode Button */}
        <button
          onClick={onToggleDemo}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded transition font-medium ${
            demoActive
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
              : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/5'
          }`}
          title="Automated Interactive Demo (no camera needed)"
        >
          <Activity className="w-3.5 h-3.5 text-amber-300" />
          <span>Demo</span>
        </button>

        {/* Camera Toggle */}
        <button
          onClick={onToggleCamera}
          className={`p-1.5 rounded border transition ${
            cameraActive
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
              : 'bg-white/5 text-slate-400 border-white/5 hover:text-white'
          }`}
          title={cameraActive ? 'Turn Camera Off' : 'Enable Webcam Tracking'}
        >
          {cameraActive ? <Camera className="w-4 h-4" /> : <CameraOff className="w-4 h-4" />}
        </button>

        {/* Calibration */}
        <button
          onClick={onOpenCalibration}
          className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/5 transition"
          title="Hand Calibration"
        >
          <Sliders className="w-4 h-4" />
        </button>

        {/* Debug HUD Toggle */}
        <button
          onClick={onToggleDebug}
          className={`px-2 py-1 rounded text-[11px] font-mono border transition ${
            showDebug
              ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
              : 'bg-white/5 text-slate-400 border-white/5 hover:text-white'
          }`}
          title="Toggle Latency & ML HUD"
        >
          HUD
        </button>

        {/* Status Dot */}
        <div
          className={`w-2.5 h-2.5 rounded-full ml-1 ${
            trackingState === 'tracking'
              ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]'
              : trackingState === 'error'
              ? 'bg-rose-400'
              : 'bg-slate-600'
          }`}
          title={`Tracking: ${trackingState}`}
        />
      </div>
    </header>
  );
};
