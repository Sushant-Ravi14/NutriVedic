import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PageWrapper } from '../components/layout/PageWrapper';
import { FoodScanner } from '../components/features/scanner/FoodScanner';
import { BarcodeScanner } from '../components/features/scanner/BarcodeScanner';
import { ManualSearch } from '../components/features/scanner/ManualSearch';
import { ResultPanel } from '../components/features/scanner/ResultPanel';
import { FreshnessDetector } from '../components/features/scanner/FreshnessDetector';
import { SkeletonLoader } from '../components/ui/SkeletonLoader';
import { Button } from '../components/ui/Button';
import { useScanner } from '../hooks/useScanner';
import { useLogMeal } from '../hooks/useFoodLog';

// History Cleared SVG Icon requested by user
export const HistoryIcon = ({ className = 'w-8 h-8', fill = '#0a0a0a' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    height="32px"
    viewBox="0 -960 960 960"
    width="32px"
    fill={fill}
    className={className}
  >
    <path d="M574.5-774.5Q560-789 560-810t14.5-35.5Q589-860 610-860t35.5 14.5Q660-831 660-810t-14.5 35.5Q631-760 610-760t-35.5-14.5Zm0 660Q560-129 560-150t14.5-35.5Q589-200 610-200t35.5 14.5Q660-171 660-150t-14.5 35.5Q631-100 610-100t-35.5-14.5Zm160-520Q720-649 720-670t14.5-35.5Q749-720 770-720t35.5 14.5Q820-691 820-670t-14.5 35.5Q791-620 770-620t-35.5-14.5Zm0 380Q720-269 720-290t14.5-35.5Q749-340 770-340t35.5 14.5Q820-311 820-290t-14.5 35.5Q791-240 770-240t-35.5-14.5Zm60-190Q780-459 780-480t14.5-35.5Q809-530 830-530t35.5 14.5Q880-501 880-480t-14.5 35.5Q851-430 830-430t-35.5-14.5ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880v80q-134 0-227 93t-93 227q0 134 93 227t227 93v80Zm132-212L440-464v-216h80v184l148 148-56 56Z" />
  </svg>
);

export const Scanner = () => {
  const [searchParams] = useSearchParams();
  const defaultSlot = searchParams.get('slot') || 'Breakfast';

  const [activeTab, setActiveTab] = useState('camera');
  const [detectedData, setDetectedData] = useState(null);

  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('nutrivedic_search_history');
    return saved ? JSON.parse(saved) : [];
  });

  const { scanImage, isScanningImage, scanBarcode } = useScanner();
  const logMealMutation = useLogMeal();
  const navigate = useNavigate();

  const addToHistory = (foodItem) => {
    setHistory((prev) => {
      const filtered = prev.filter((item) => item.name !== foodItem.name);
      const updated = [foodItem, ...filtered].slice(0, 5);
      localStorage.setItem('nutrivedic_search_history', JSON.stringify(updated));
      return updated;
    });
  };

  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem('nutrivedic_search_history');
  };

  const handleImageSelect = async (file) => {
    try {
      setDetectedData(null);
      const res = await scanImage(file);
      setDetectedData(res);
      addToHistory(res);
    } catch (err) {
      console.error('Scan error:', err);
    }
  };

  const handleBarcodeDetected = async (barcode) => {
    try {
      setDetectedData(null);
      const res = await scanBarcode(barcode);
      setDetectedData(res);
      addToHistory(res);
    } catch (err) {
      console.error('Barcode error:', err);
    }
  };

  const handleManualSelectFood = (foodItem) => {
    const item = {
      name: foodItem.name,
      confidence: 100,
      servingSizeGrams: 100,
      calories: foodItem.calories,
      protein: foodItem.protein,
      carbs: foodItem.carbs,
      fat: foodItem.fat,
      fiber: foodItem.fiber || 3,
      glycemicIndex: 'Low'
    };
    setDetectedData(item);
    addToHistory(item);
  };

  const handleAddLog = async ({ slot, item }) => {
    await logMealMutation.mutateAsync({
      slot,
      items: [item]
    });
    navigate('/dashboard');
  };

  return (
    <PageWrapper>
      <div className="mb-6">
        <span className="font-mono text-[11px] uppercase tracking-[1.5px] text-label block mb-1">
          AI RECOGNITION & DIET LOGGING
        </span>
        <h1 className="font-serif text-[32px] font-bold text-black">Food Scanner</h1>
      </div>

      <div className="border border-border rounded-card bg-white overflow-hidden grid grid-cols-1 md:grid-cols-2 min-h-[540px]">
        {/* Left Panel: Controls */}
        <div className="p-6 md:p-8 bg-surface border-b md:border-b-0 md:border-r border-border flex flex-col gap-6">
          {/* Pill Tab Bar */}
          <div className="flex items-center gap-1.5 p-1 bg-white border border-border rounded-pill overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab('camera')}
              className={`flex-1 py-1.5 px-3 rounded-pill font-mono text-[11px] uppercase tracking-wider transition-colors ${
                activeTab === 'camera' ? 'bg-black text-white' : 'text-muted hover:text-black'
              }`}
            >
              Camera
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('barcode')}
              className={`flex-1 py-1.5 px-3 rounded-pill font-mono text-[11px] uppercase tracking-wider transition-colors ${
                activeTab === 'barcode' ? 'bg-black text-white' : 'text-muted hover:text-black'
              }`}
            >
              Barcode
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('manual')}
              className={`flex-1 py-1.5 px-3 rounded-pill font-mono text-[11px] uppercase tracking-wider transition-colors ${
                activeTab === 'manual' ? 'bg-black text-white' : 'text-muted hover:text-black'
              }`}
            >
              Manual
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('freshness')}
              className={`flex-1 py-1.5 px-3 rounded-pill font-mono text-[11px] uppercase tracking-wider transition-colors ${
                activeTab === 'freshness' ? 'bg-black text-white' : 'text-muted hover:text-black'
              }`}
            >
              Freshness
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 flex items-center justify-center">
            {activeTab === 'camera' && (
              <FoodScanner onImageSelect={handleImageSelect} isLoading={isScanningImage} />
            )}
            {activeTab === 'barcode' && (
              <BarcodeScanner onDetected={handleBarcodeDetected} />
            )}
            {activeTab === 'manual' && (
              <ManualSearch onSelectFood={handleManualSelectFood} />
            )}
            {activeTab === 'freshness' && (
              <FreshnessDetector onAddToInventory={() => navigate('/settings')} />
            )}
          </div>
        </div>

        {/* Right Panel: Scan Results OR Last 5 Search History */}
        <div className="p-6 md:p-8 bg-white flex flex-col justify-center">
          {isScanningImage ? (
            <SkeletonLoader variant="card" />
          ) : detectedData ? (
            <ResultPanel
              foodData={detectedData}
              onAddLog={handleAddLog}
              defaultSlot={defaultSlot}
            />
          ) : (
            <div className="flex flex-col gap-4 w-full h-full justify-between">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <span className="font-mono text-[11px] uppercase tracking-[1.5px] text-label">
                  LAST 5 SEARCH HISTORY
                </span>
                {history.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearHistory}
                    className="font-mono text-[11px] text-muted hover:text-negative transition-colors"
                  >
                    Clear History
                  </button>
                )}
              </div>

              {history.length > 0 ? (
                <div className="flex flex-col gap-2.5 flex-1 mt-2">
                  {history.slice(0, 5).map((item) => (
                    <div
                      key={item.id || item.name}
                      onClick={() => setDetectedData(item)}
                      className="p-3 border border-border rounded-lg bg-white hover:bg-surface cursor-pointer flex items-center justify-between transition-colors group"
                    >
                      <div>
                        <span className="font-sans font-medium text-sm text-black block group-hover:underline">
                          {item.name}
                        </span>
                        <span className="font-mono text-[11px] text-muted">
                          {item.servingSizeGrams || 100}g • P: {item.protein}g | C: {item.carbs}g
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-semibold text-black">{item.calories} kcal</span>
                        <span className="font-mono text-xs text-muted">→</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center p-8 border border-dashed border-border rounded-card my-auto">
                  <HistoryIcon className="w-10 h-10 mb-3 text-black" fill="#0a0a0a" />
                  <h3 className="font-serif text-[20px] font-bold text-black mb-1">No Search History</h3>
                  <p className="font-sans text-xs text-muted max-w-xs">
                    Your recent real-time food scans and manual search queries will appear here.
                  </p>
                </div>
              )}

              <span className="font-mono text-[10px] text-label uppercase tracking-widest text-center">
                TAP ANY ITEM TO QUICK LOG
              </span>
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
};
