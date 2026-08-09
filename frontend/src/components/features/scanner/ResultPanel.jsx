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

export const ResultPanel = ({ foodData, onAddLog, defaultSlot = 'Breakfast' }) => {
  const [weight, setWeight] = useState(foodData?.servingSizeGrams || 100);
  const [selectedSlot, setSelectedSlot] = useState(defaultSlot);

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
      <div>
        <span className="font-mono text-[11px] uppercase tracking-[1.5px] text-label">
          DETECTED ITEM
        </span>
        <h2 className="font-serif text-[32px] text-black font-bold leading-tight mt-1">
          {foodData.name}
        </h2>
        {foodData.confidence && (
          <div className="flex items-center gap-3 mt-2">
            <ProgressBar value={foodData.confidence} max={100} className="w-32" />
            <span className="font-mono text-[12px] text-muted">{foodData.confidence}% AI Confidence</span>
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
      </div>

      <Button variant="primary" fullWidth onClick={handleAdd}>
        Add to Log
      </Button>
    </motion.div>
  );
};
