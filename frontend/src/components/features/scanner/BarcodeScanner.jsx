import React, { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/library';

export const BarcodeScanner = ({ onDetected }) => {
  const videoRef = useRef(null);
  const readerRef = useRef(null);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    const codeReader = new BrowserMultiFormatReader();
    readerRef.current = codeReader;

    codeReader
      .listVideoInputDevices()
      .then((videoInputDevices) => {
        const selectedDeviceId = videoInputDevices[0]?.deviceId;
        return codeReader.decodeFromVideoDevice(
          selectedDeviceId,
          videoRef.current,
          (result, err) => {
            if (result) {
              codeReader.reset();
              if (onDetected) onDetected(result.getText());
            }
          }
        );
      })
      .catch((err) => {
        console.warn('Barcode camera access error:', err);
        setErrorMsg('Camera access unavailable. Use manual barcode input below.');
      });

    return () => {
      if (readerRef.current) {
        readerRef.current.reset();
      }
    };
  }, [onDetected]);

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div className="relative w-full max-w-sm aspect-video bg-black rounded-card overflow-hidden border border-border flex items-center justify-center">
        <video ref={videoRef} className="w-full h-full object-cover" />

        {/* Animated Scan Line Overlay */}
        <div className="absolute inset-0 pointer-events-none border-2 border-white/20 rounded-card">
          <div className="w-full h-[2px] bg-red-500 shadow-[0_0_8px_#ef4444] animate-scan-line" />
        </div>
      </div>

      {errorMsg ? (
        <span className="font-mono text-xs text-negative text-center">{errorMsg}</span>
      ) : (
        <span className="font-mono text-xs text-muted text-center">
          Point camera directly at food barcode
        </span>
      )}
    </div>
  );
};
