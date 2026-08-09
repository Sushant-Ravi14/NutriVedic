import React, { useRef, useState, useEffect } from 'react';
import { useFreshness } from '../../../hooks/useFreshness';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { Card } from '../../ui/Card';

export const FoodIcon = ({ className = 'w-5 h-5', fill = 'currentColor' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    height="20px"
    viewBox="0 -960 960 960"
    width="20px"
    fill={fill}
    className={className}
  >
    <path d="M640-80q-100 0-170-70t-70-170q0-100 70-170t170-70q100 0 170 70t70 170q0 100-70 170T640-80Zm0-80q66 0 113-47t47-113q0-66-47-113t-113-47q-66 0-113 47t-47 113q0 66 47 113t113 47Zm-480 0q-33 0-56.5-23.5T80-240v-304q0-8 1.5-16t4.5-16l80-184h-6q-17 0-28.5-11.5T120-800v-40q0-17 11.5-28.5T160-880h280q17 0 28.5 11.5T480-840v40q0 17-11.5 28.5T440-760h-6l66 152q-19 10-36 21t-32 25l-84-198h-96l-92 216v304h170q5 21 13.5 41.5T364-160H160Zm480-440q-42 0-71-29t-29-71q0-42 29-71t71-29v200q0-42 29-71t71-29q42 0 71 29t29 71H640Z" />
  </svg>
);

const dataURLtoBlob = (dataurl) => {
  const arr = dataurl.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
};

export const FreshnessDetector = ({ onAddToInventory }) => {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  const [itemName, setItemName] = useState('Fresh Produce');
  const [result, setResult] = useState(null);
  const [cameraError, setCameraError] = useState(null);
  const [capturedSnapshot, setCapturedSnapshot] = useState(null);

  const { analyzeImage, isAnalyzing } = useFreshness();

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
        console.warn('Freshness real-time camera access error:', err);
        if (active) {
          setCameraError('Real-time camera access unavailable.');
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

  const handleCaptureAndAnalyze = async () => {
    if (!videoRef.current) return;
    const video = videoRef.current;

    const canvas = canvasRef.current || document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const img = new Image();
    img.src = canvas.toDataURL('image/jpeg');
    setCapturedSnapshot(img.src);

    img.onload = async () => {
      try {
        const blob = dataURLtoBlob(canvas.toDataURL('image/jpeg'));
        const res = await analyzeImage(blob);
        setResult(res);
        if (res.itemName) {
          setItemName(res.itemName);
        }
      } catch (err) {
        console.error('Freshness analysis failed:', err);
        setCapturedSnapshot(null);
        setResult(null);
      }
    };
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const objectUrl = URL.createObjectURL(file);
    setCapturedSnapshot(objectUrl);
    
    analyzeImage(file).then(res => {
      setResult(res);
      if (res.itemName) setItemName(res.itemName);
    }).catch(err => {
      console.error('Upload analysis failed:', err);
      setCapturedSnapshot(null);
      setResult(null);
    });
    if (e.target) e.target.value = '';
  };

  const handleSave = () => {
    if (onAddToInventory) {
      onAddToInventory();
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Real-time Camera Viewfinder - Exact same size as Camera Section (max-h-[300px]) */}
      <div className="relative w-full aspect-video max-h-[300px] bg-black rounded-card overflow-hidden border border-border flex items-center justify-center">
        {capturedSnapshot ? (
          <img src={capturedSnapshot} alt="Captured produce" className="w-full h-full object-cover" />
        ) : cameraError ? (
          <div className="p-4 text-center text-muted font-mono text-xs flex flex-col items-center gap-2">
            <FoodIcon fill="#9e9e9e" className="w-8 h-8" />
            <span>{cameraError}</span>
          </div>
        ) : (
          <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
        )}

        <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-xs p-1.5 rounded-md text-white flex items-center gap-1.5 font-mono text-[10px]">
          <FoodIcon fill="#ffffff" className="w-4 h-4" />
          <span>PRODUCE SCANNER</span>
        </div>
      </div>

      {/* Action Buttons & Inputs */}
      <div className="flex gap-2 w-full">
        {capturedSnapshot && (
          <Button
            variant="secondary"
            onClick={() => {
              setCapturedSnapshot(null);
              setResult(null);
            }}
            className="shrink-0"
          >
            Retake
          </Button>
        )}
        <Button
          variant="primary"
          fullWidth
          onClick={handleCaptureAndAnalyze}
          disabled={isAnalyzing || Boolean(cameraError)}
          className="flex items-center justify-center gap-2"
        >
          <FoodIcon fill="#ffffff" className="w-5 h-5 shrink-0" />
          <span>{isAnalyzing ? 'Analyzing...' : 'Capture'}</span>
        </Button>
        <Button
          variant="secondary"
          fullWidth
          onClick={() => fileInputRef.current?.click()}
          disabled={isAnalyzing}
          className="shrink-0"
        >
          Upload Photo
        </Button>
        <input 
          type="file" 
          accept="image/*" 
          className="hidden" 
          ref={fileInputRef} 
          onChange={handleFileUpload} 
        />
      </div>

      <div>
        <label htmlFor="produce-item-name" className="font-mono text-[10px] uppercase tracking-[1.5px] text-label block mb-1">
          ITEM NAME
        </label>
        <input
          id="produce-item-name"
          type="text"
          value={itemName}
          onChange={(e) => setItemName(e.target.value)}
          className="h-[38px] w-full px-3 bg-white border border-border rounded-lg font-sans text-xs text-black focus:outline-none focus:border-black"
        />
      </div>

      {/* Freshness Result Display */}
      {result ? (
        <div className="flex flex-col gap-4 border-t border-border pt-4 mt-1">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif text-xl text-black font-bold leading-tight">{itemName}</h2>
              <span className="font-mono text-[11px] text-muted block mt-0.5">
                Freshness Score: {result.score}%
              </span>
            </div>
            <Badge variant={result.freshnessClass === 'Fresh' ? 'positive' : 'negative'}>
              {result.freshnessClass}
            </Badge>
          </div>

          {/* Freshness Gradient Meter */}
          <div className="flex flex-col gap-1">
            <div className="w-full h-2.5 rounded-full bg-gradient-to-r from-red-500 via-amber-400 to-emerald-600 relative">
              <div
                className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-black border-2 border-white shadow transition-all duration-500"
                style={{ left: `calc(${Math.min(result.score, 95)}% - 7px)` }}
              />
            </div>
            <div className="flex justify-between font-mono text-[9px] text-label uppercase mt-0.5">
              <span>Stale</span>
              <span>Ripe</span>
              <span>Fresh</span>
            </div>
          </div>

          {/* 2x2 Info Grid */}
          <div className="grid grid-cols-2 gap-2">
            <Card className="p-2.5">
              <span className="font-mono text-[9px] uppercase text-label block">SHELF LIFE</span>
              <span className="font-serif text-base font-bold text-black leading-tight block mt-0.5">{result.shelfLifeDays} Days</span>
            </Card>
            <Card className="p-2.5">
              <span className="font-mono text-[9px] uppercase text-label block">BEST CONSUMED</span>
              <span className="font-serif text-base font-bold text-black leading-tight block mt-0.5">
                {result.shelfLifeDays > 2 ? 'This Week' : 'Within 48h'}
              </span>
            </Card>
            <Card className="p-2.5">
              <span className="font-mono text-[9px] uppercase text-label block">NUTRITION</span>
              <span className="font-sans text-[11px] text-muted leading-tight block mt-0.5">Peak vitamins</span>
            </Card>
            <Card className="p-2.5">
              <span className="font-mono text-[9px] uppercase text-label block">ADVICE</span>
              <span className="font-sans text-[11px] text-muted leading-tight block truncate mt-0.5">{result.recommendation}</span>
            </Card>
          </div>

          {result.healthNote && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex gap-2">
              <span className="text-amber-600 text-base shrink-0">💡</span>
              <p className="font-sans text-xs text-amber-800 leading-relaxed">{result.healthNote}</p>
            </div>
          )}

          <Button variant="primary" fullWidth onClick={handleSave} className="mt-1">
            Add to inventory
          </Button>
        </div>
      ) : (
        <div className="p-3 border border-dashed border-border rounded-lg bg-surface text-center">
          <span className="font-mono text-[11px] text-muted">
            Tap Capture or Upload Photo to test freshness
          </span>
        </div>
      )}
    </div>
  );
};
