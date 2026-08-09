import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../../ui/Button';
import { NutritionTable } from '../../ui/NutritionTable';
import { Dropdown } from '../../ui/Dropdown';
import { ProgressBar } from '../../ui/ProgressBar';

const resultVariants = {
  initial: { y: 10, opacity: 0 },
  animate: { y: 0, opacity: 1, transition: { duration: 0.3, ease: 'easeOut' } }
};

export const ResultPanel = ({ foodData, onAddLog, defaultSlot = 'Breakfast', imagePreview = null }) => {
  const [weight, setWeight] = useState(foodData?.servingSizeGrams || 100);
  const [selectedSlot, setSelectedSlot] = useState(defaultSlot);
  const [showMicros, setShowMicros] = useState(false);

  useEffect(() => {
    if (foodData?.servingSizeGrams) {
      setWeight(foodData.servingSizeGrams);
    }
  }, [foodData]);

  if (!foodData) return null;

  const multiplier = weight / (foodData.servingSizeGrams || 100);

  const scaledNutrition = {
    calories: Math.round((foodData.calories || 0) * multiplier),
    protein: Math.round((foodData.protein || 0) * multiplier),
    carbs: Math.round((foodData.carbs || 0) * multiplier),
    fat: Math.round((foodData.fat || 0) * multiplier),
    fiber: Math.round((foodData.fiber || 0) * multiplier),
    sodium: Math.round((foodData.sodium || 0) * multiplier),
    calcium: Math.round((foodData.calcium || 0) * multiplier),
    iron: Number(((foodData.iron || 0) * multiplier).toFixed(1)),
    vitaminC: Number(((foodData.vitaminC || 0) * multiplier).toFixed(1)),
    glycemicIndex: foodData.glycemicIndex || 'Low'
  };

  const handleAdd = () => {
    if (onAddLog) {
      onAddLog({
        slot: selectedSlot,
        item: {
          name: foodData.name,
          calories: scaledNutrition.calories,
          protein: scaledNutrition.protein,
          carbs: scaledNutrition.carbs,
          fat: scaledNutrition.fat,
          fiber: scaledNutrition.fiber,
          sodium: scaledNutrition.sodium,
          calcium: scaledNutrition.calcium,
          iron: scaledNutrition.iron,
          vitaminC: scaledNutrition.vitaminC,
          grams: Number(weight)
        }
      });
    }
  };

  return (
    <motion.div
      variants={resultVariants}
      initial="initial"
      animate="animate"
      className="flex flex-col gap-6 w-full"
    >
      {imagePreview && (
        <div className="w-full rounded-card overflow-hidden border border-border bg-black" style={{ maxHeight: '180px' }}>
          <img src={imagePreview} alt="Scanned food" className="w-full h-full object-cover" style={{ maxHeight: '180px' }} />
        </div>
      )}

      <div>
        <span className="font-mono text-[11px] uppercase tracking-[1.5px] text-label">
          DETECTED ITEM
        </span>
        <h2 className="font-serif text-[32px] text-black font-bold leading-tight mt-1">
          {foodData.name}
        </h2>

        {foodData.scoreVerdict && (
          <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-surface border border-border rounded-full font-mono text-xs text-black">
            <span>{foodData.scoreVerdict.emoji || '✅'}</span>
            <span className="font-semibold">{foodData.scoreVerdict.label || 'Safe to consume'}</span>
            {foodData.consumeScore && <span className="text-muted">({foodData.consumeScore}/100)</span>}
          </div>
        )}

        {foodData.confidence && (
          <div className="flex items-center gap-3 mt-2">
            <ProgressBar value={foodData.confidence} max={100} className="w-32" />
            <span className="font-mono text-[12px] text-muted">{foodData.confidence}% AI Confidence</span>
          </div>
        )}

        {foodData.healthFeedback && (
          <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg flex gap-2">
            <span className="text-amber-600 text-base shrink-0">💡</span>
            <p className="font-sans text-xs text-amber-800 leading-relaxed">{foodData.healthFeedback}</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="portion-weight" className="font-mono text-[11px] uppercase tracking-[1.5px] text-label block mb-1">
            PORTION WEIGHT (G)
          </label>
          <input
            id="portion-weight"
            type="number"
            value={weight}
            onChange={(e) => setWeight(Math.max(1, Number(e.target.value)))}
            className="h-[42px] w-full px-3.5 bg-white border border-border rounded-lg font-mono text-[16px] text-black focus:outline-none focus:border-black"
          />
        </div>

        <Dropdown
          label="MEAL SLOT"
          options={['Breakfast', 'Lunch', 'Snacks', 'Dinner']}
          value={selectedSlot}
          onChange={setSelectedSlot}
        />
      </div>

      <div className="flex flex-col gap-2">
        <span className="font-mono text-[11px] uppercase tracking-[1.5px] text-label">
          NUTRITION BREAKDOWN
        </span>
        <NutritionTable data={scaledNutrition} />

        {/* Expandable Micronutrients Drawer */}
        <div className="border border-border rounded-lg bg-surface/30 overflow-hidden font-sans text-xs mt-1.5">
          <button
            type="button"
            onClick={() => setShowMicros(!showMicros)}
            className="w-full px-4 py-3 flex items-center justify-between font-mono uppercase text-[10px] tracking-wider text-label hover:bg-surface/50 transition-colors"
          >
            <span>Vitamins & Minerals</span>
            <span className="font-semibold text-black">{showMicros ? 'Hide [-]' : 'Show [+]'}</span>
          </button>
          {showMicros && (
            <div className="px-4 pb-3 pt-1 border-t border-border grid grid-cols-2 gap-y-2 gap-x-6 bg-white">
              <div className="flex justify-between py-1.5 border-b border-[#f9f9f9]">
                <span className="text-muted">Sodium:</span>
                <span className="font-mono text-black font-semibold">{scaledNutrition.sodium || 0} mg</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#f9f9f9]">
                <span className="text-muted">Calcium:</span>
                <span className="font-mono text-black font-semibold">{scaledNutrition.calcium || 0} mg</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#f9f9f9]">
                <span className="text-muted">Iron:</span>
                <span className="font-mono text-black font-semibold">{scaledNutrition.iron || 0} mg</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#f9f9f9]">
                <span className="text-muted">Vitamin C:</span>
                <span className="font-mono text-black font-semibold">{scaledNutrition.vitaminC || 0} mg</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <Button variant="primary" fullWidth onClick={handleAdd}>
        Add to Log
      </Button>
    </motion.div>
  );
};
