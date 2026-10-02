import React, { useEffect, useRef } from 'react';
import { Mixer } from '@beatwave/audio-engine';

interface WaveformBarProps {
  mixer: Mixer | null;
  activeBankId: string;
  onSelectBank: (bankId: 'A' | 'B' | 'C' | 'D') => void;
}

export const WaveformBar: React.FC<WaveformBarProps> = ({
  mixer,
  activeBankId,
  onSelectBank
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas || !mixer) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const buffer = new Float32Array(256);

    const render = () => {
      mixer.getWaveformData(buffer);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#38bdf8';
      ctx.beginPath();

      const sliceWidth = canvas.width / buffer.length;
      let x = 0;

      for (let i = 0; i < buffer.length; i++) {
        const v = buffer[i];
        const y = (v + 1) * (canvas.height / 2);

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
        x += sliceWidth;
      }

      ctx.stroke();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [mixer]);

  return (
    <div className="h-12 px-6 glass-panel border-t border-white/10 flex items-center justify-between z-20 text-xs">
      {/* Bank Selectors */}
      <div className="flex items-center gap-1.5">
        <span className="text-slate-400 font-mono text-[11px] mr-1">BANK</span>
        {(['A', 'B', 'C', 'D'] as const).map((b) => (
          <button
            key={b}
            onClick={() => onSelectBank(b)}
            className={`w-7 h-7 rounded font-mono font-semibold transition ${
              activeBankId === b
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-[0_0_8px_rgba(56,189,248,0.3)]'
                : 'bg-white/5 text-slate-400 hover:text-white border border-white/5'
            }`}
          >
            {b}
          </button>
        ))}
      </div>

      {/* Realtime Waveform Canvas */}
      <div className="flex items-center gap-3 w-64 h-8 bg-black/40 rounded px-2 border border-white/5">
        <canvas ref={canvasRef} width={240} height={32} className="w-full h-full opacity-80" />
      </div>

      {/* Latency Note */}
      <div className="text-[11px] text-slate-500 font-mono hidden sm:block">
        Native Web Audio Engine • Sub-1ms clock jitter
      </div>
    </div>
  );
};
