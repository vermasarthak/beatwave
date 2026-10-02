import React, { useState } from 'react';
import { CalibrationProfile } from '@beatwave/protocol';

interface CalibrationModalProps {
  profile: CalibrationProfile;
  onSaveProfile: (profile: CalibrationProfile) => void;
  onClose: () => void;
}

export const CalibrationModal: React.FC<CalibrationModalProps> = ({
  profile,
  onSaveProfile,
  onClose
}) => {
  const [dominantHand, setDominantHand] = useState<'Left' | 'Right'>(profile.dominantHand);
  const [sensitivity, setSensitivity] = useState<number>(profile.sensitivity);
  const [hoverDepthZ, setHoverDepthZ] = useState<number>(profile.hoverDepthZ);
  const [strikeDepthThresholdZ, setStrikeDepthThresholdZ] = useState<number>(profile.strikeDepthThresholdZ);
  const [pinchThreshold, setPinchThreshold] = useState<number>(profile.pinchThreshold);

  const handleSave = () => {
    onSaveProfile({
      ...profile,
      dominantHand,
      sensitivity,
      hoverDepthZ,
      strikeDepthThresholdZ,
      pinchThreshold
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-md glass-panel p-6 rounded-2xl border border-white/10 shadow-2xl text-xs space-y-4">
        <div className="flex justify-between items-center pb-2 border-b border-white/10">
          <h2 className="text-sm font-bold text-white tracking-wide">HAND TRACKING CALIBRATION</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
        </div>

        {/* Dominant Hand */}
        <div className="space-y-1">
          <label className="text-slate-300 font-medium">Dominant Hand</label>
          <div className="grid grid-cols-2 gap-2">
            {(['Right', 'Left'] as const).map((hand) => (
              <button
                key={hand}
                type="button"
                onClick={() => setDominantHand(hand)}
                className={`py-2 rounded font-medium transition ${
                  dominantHand === hand
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                    : 'bg-white/5 text-slate-400 hover:bg-white/10 border border-white/5'
                }`}
              >
                {hand} Hand
              </button>
            ))}
          </div>
        </div>

        {/* Sensitivity */}
        <div className="space-y-1">
          <div className="flex justify-between text-slate-300">
            <span>Air-Tap Sensitivity</span>
            <span className="font-mono text-cyan-400">{sensitivity.toFixed(2)}x</span>
          </div>
          <input
            type="range"
            min={0.5}
            max={1.8}
            step={0.05}
            value={sensitivity}
            onChange={(e) => setSensitivity(parseFloat(e.target.value))}
            className="w-full accent-cyan-400 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>Firm / Deliberate</span>
            <span>Light / Hair-trigger</span>
          </div>
        </div>

        {/* Strike Depth Threshold */}
        <div className="space-y-1">
          <div className="flex justify-between text-slate-300">
            <span>Virtual Contact Plane (Z Depth)</span>
            <span className="font-mono text-cyan-400">{strikeDepthThresholdZ.toFixed(3)}</span>
          </div>
          <input
            type="range"
            min={-0.08}
            max={-0.02}
            step={0.005}
            value={strikeDepthThresholdZ}
            onChange={(e) => setStrikeDepthThresholdZ(parseFloat(e.target.value))}
            className="w-full accent-cyan-400 cursor-pointer"
          />
        </div>

        {/* Pinch Threshold */}
        <div className="space-y-1">
          <div className="flex justify-between text-slate-300">
            <span>Pinch Fallback Threshold</span>
            <span className="font-mono text-amber-400">{pinchThreshold.toFixed(3)}</span>
          </div>
          <input
            type="range"
            min={0.03}
            max={0.09}
            step={0.005}
            value={pinchThreshold}
            onChange={(e) => setPinchThreshold(parseFloat(e.target.value))}
            className="w-full accent-amber-400 cursor-pointer"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded bg-white/5 hover:bg-white/10 text-slate-400"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-1.5 rounded bg-cyan-500 hover:bg-cyan-400 text-black font-semibold shadow-[0_0_12px_rgba(56,189,248,0.4)]"
          >
            Save Calibration
          </button>
        </div>
      </div>
    </div>
  );
};
