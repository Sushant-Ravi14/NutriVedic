import React, { useRef, useState, useEffect } from 'react';
import { Button } from '../../ui/Button';

export const CameraIcon = ({ className = 'w-6 h-6', fill = 'currentColor' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    height="24px"
    viewBox="0 -960 960 960"
    width="24px"
    fill={fill}
    className={className}
  >
    <path d="M480-260q75 0 127.5-52.5T660-440q0-75-52.5-127.5T480-620q-75 0-127.5 52.5T300-440q0 75 52.5 127.5T480-260Zm0-80q-42 0-71-29t-29-71q0-42 29-71t71-29q42 0 71 29t29 71q0 42-29 71t-71 29ZM160-120q-33 0-56.5-23.5T80-200v-480q0-33 23.5-56.5T160-760h126l74-80h240l74 80h126q33 0 56.5 23.5T880-680v480q0 33-23.5 56.5T800-120H160Zm0-80h640v-480H638l-73-80H395l-73 80H160v480Zm320-240Z" />
  </svg>
);

export const FoodScanner = ({ onImageSelect, isLoading }) => {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [cameraError, setCameraError] = useState(null);

  useEffect(() => {
    let active = true;

    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
        });
        if (active) {
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        }
      } catch (err) {
        console.warn('Real-time camera access error:', err);
        if (active) {
          setCameraError('Real-time camera access unavailable or permission denied.');
        }
      }
    }

    startCamera();

    return () => {
      active = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const handleCapture = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (blob && onImageSelect) {
        const file = new File([blob], 'realtime-scan.jpg', { type: 'image/jpeg' });
        onImageSelect(file);
      }
    }, 'image/jpeg', 0.9);
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div className="relative w-full aspect-video max-h-[300px] bg-black rounded-card overflow-hidden border border-border flex items-center justify-center">
        {cameraError ? (
          <div className="p-4 text-center text-muted font-mono text-xs flex flex-col items-center gap-2">
            <CameraIcon fill="#9e9e9e" className="w-8 h-8" />
            <span>{cameraError}</span>
          </div>
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        )}

        {/* Viewfinder crosshair overlay */}
        <div className="absolute inset-4 border border-white/30 rounded-lg pointer-events-none flex items-center justify-center">
          <span className="font-mono text-[10px] text-white/70 bg-black/50 px-2 py-1 rounded">
            ALIGN MEAL IN FRAME
          </span>
        </div>
      </div>

      <Button
        variant="primary"
        fullWidth
        onClick={handleCapture}
        disabled={isLoading || Boolean(cameraError)}
        className="flex items-center justify-center gap-2"
      >
        <CameraIcon fill="#ffffff" className="w-5 h-5" />
        {isLoading ? 'Analyzing Real-Time Photo...' : 'Capture Real-Time Photo'}
      </Button>
    </div>
  );
};
