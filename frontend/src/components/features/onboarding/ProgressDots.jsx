import React from 'react';

export const ProgressDots = ({ currentStep = 1, totalSteps = 4 }) => {
  const steps = Array.from({ length: totalSteps }, (_, i) => i + 1);

  return (
    <div className="w-full flex items-center gap-2 mb-6">
      {steps.map((step) => {
        const isCompleted = step <= currentStep;
        return (
          <div
            key={step}
            className={`h-[3px] flex-1 rounded-full transition-all duration-300 ${
              isCompleted ? 'bg-black' : 'bg-border'
            }`}
          />
        );
      })}
    </div>
  );
};
