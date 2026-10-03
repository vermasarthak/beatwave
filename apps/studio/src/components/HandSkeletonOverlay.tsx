import React, { useImperativeHandle, forwardRef, useRef, useEffect } from 'react';
import { Point3D } from '@beatwave/protocol';

export interface HandSkeletonHandle {
  update: (landmarks: Point3D[] | null, confidence: number) => void;
  clear: () => void;
}

const BONE_CONNECTIONS: [number, number][] = [
  // Thumb
  [0, 1], [1, 2], [2, 3], [3, 4],
  // Index
  [0, 5], [5, 6], [6, 7], [7, 8],
  // Middle
  [0, 9], [9, 10], [10, 11], [11, 12],
  // Ring
  [0, 13], [13, 14], [14, 15], [15, 16],
  // Pinky
  [0, 17], [17, 18], [18, 19], [19, 20],
  // Knuckle arch
  [5, 9], [9, 13], [13, 17]
];

interface HandSkeletonOverlayProps {
  visible?: boolean;
}

export const HandSkeletonOverlay = forwardRef<HandSkeletonHandle, HandSkeletonOverlayProps>(
  ({ visible = true }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
      const resize = () => {
        if (!canvasRef.current) return;
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      };
      resize();
      window.addEventListener('resize', resize);
      return () => window.removeEventListener('resize', resize);
    }, []);

    useImperativeHandle(ref, () => ({
      update: (landmarks, confidence) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (!visible || !landmarks || landmarks.length < 21 || confidence < 0.3) {
          return;
        }

        const width = canvas.width;
        const height = canvas.height;

        // Draw glowing neon bone lines
        ctx.save();
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.7)'; // Cyber Cyan
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 10;

        for (const [i, j] of BONE_CONNECTIONS) {
          const p1 = landmarks[i];
          const p2 = landmarks[j];
          if (!p1 || !p2) continue;

          ctx.beginPath();
          ctx.moveTo(p1.x * width, p1.y * height);
          ctx.lineTo(p2.x * width, p2.y * height);
          ctx.stroke();
        }

        // Draw glowing joint nodes
        for (let i = 0; i < landmarks.length; i++) {
          const pt = landmarks[i];
          const x = pt.x * width;
          const y = pt.y * height;
          const isFingertip = i === 4 || i === 8 || i === 12 || i === 16 || i === 20;
          const isIndexTip = i === 8;

          ctx.beginPath();
          if (isIndexTip) {
            // Index fingertip is highlighted in gold/amber
            ctx.fillStyle = '#fbbf24';
            ctx.shadowColor = '#f59e0b';
            ctx.shadowBlur = 15;
            ctx.arc(x, y, 6, 0, Math.PI * 2);
          } else if (isFingertip) {
            ctx.fillStyle = '#67e8f9';
            ctx.shadowColor = '#38bdf8';
            ctx.shadowBlur = 10;
            ctx.arc(x, y, 4.5, 0, Math.PI * 2);
          } else {
            ctx.fillStyle = '#ffffff';
            ctx.shadowColor = '#38bdf8';
            ctx.shadowBlur = 6;
            ctx.arc(x, y, 2.5, 0, Math.PI * 2);
          }
          ctx.fill();
        }

        ctx.restore();
      },
      clear: () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx?.clearRect(0, 0, canvas.width, canvas.height);
      }
    }));

    return (
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 z-30 w-full h-full"
      />
    );
  }
);

HandSkeletonOverlay.displayName = 'HandSkeletonOverlay';
