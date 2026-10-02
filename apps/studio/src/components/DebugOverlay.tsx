import React from 'react';
import { TelemetryMetrics } from '@beatwave/protocol';

interface DebugOverlayProps {
  metrics: TelemetryMetrics;
  onClose: () => void;
}

export const DebugOverlay: React.FC<DebugOverlayProps> = ({ metrics, onClose }) => {
  return (
    <div className="absolute top-16 right-4 w-72 glass-panel p-3.5 rounded-xl border border-white/10 text-[11px] font-mono shadow-2xl z-50">
      <div className="flex justify-between items-center pb-2 mb-2 border-b border-white/10">
        <span className="font-bold text-cyan-400">TELEMETRY & HUD</span>
        <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
      </div>

      <div className="space-y-1.5">
        <div className="flex justify-between">
          <span className="text-slate-400">Camera FPS:</span>
          <span className="text-emerald-400">{metrics.cameraFps.toFixed(1)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Inference FPS:</span>
          <span className="text-emerald-400">{metrics.inferenceFps.toFixed(1)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Inference Latency:</span>
          <span className="text-amber-300">{metrics.inferenceLatencyMs.toFixed(1)} ms</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Dropped Frames:</span>
          <span className={metrics.droppedFrames > 0 ? 'text-amber-400' : 'text-slate-300'}>
            {metrics.droppedFrames}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Hand Confidence:</span>
          <span className="text-cyan-300">{(metrics.handConfidence * 100).toFixed(0)}%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Render FPS:</span>
          <span className="text-emerald-400">{metrics.renderFps.toFixed(0)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Audio Jitter (p50):</span>
          <span className="text-cyan-300">{metrics.audioScheduleJitterMs.toFixed(2)} ms</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Active Voices:</span>
          <span className="text-white">{metrics.activeVoices}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">AudioContext:</span>
          <span className="text-emerald-400">{metrics.audioContextState}</span>
        </div>

        {/* StrikeNet Advisory status */}
        <div className="pt-2 mt-2 border-t border-white/10">
          <div className="flex justify-between items-center">
            <span className="text-purple-300">StrikeNet Advisory:</span>
            <span className="text-slate-400 text-[10px]">EXPERIMENTAL</span>
          </div>
          <div className="flex justify-between mt-1 text-[10px]">
            <span className="text-slate-400">Intent P(strike):</span>
            <span className="text-purple-300 font-bold">
              {(metrics.strikeConfidence * 100).toFixed(0)}%
            </span>
          </div>
          <div className="flex justify-between text-[10px]">
            <span className="text-slate-400">Predicted ETA:</span>
            <span className="text-purple-300">
              {metrics.strikeNetAdvisoryMs ? `${metrics.strikeNetAdvisoryMs.toFixed(0)} ms` : '--'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
