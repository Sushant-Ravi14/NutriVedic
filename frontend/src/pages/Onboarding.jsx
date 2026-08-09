import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ProgressDots } from '../components/features/onboarding/ProgressDots';
import { StepPersonal } from '../components/features/onboarding/StepPersonal';
import { StepActivity } from '../components/features/onboarding/StepActivity';
import { StepGoal } from '../components/features/onboarding/StepGoal';
import { StepSummary } from '../components/features/onboarding/StepSummary';
import { Button } from '../components/ui/Button';
import { useAuth } from '../hooks/useAuth';
import { calculateTDEE, calculateTargetCalories } from '../utils/calculations';

const stepVariants = {
  initial: { x: 20, opacity: 0 },
  animate: { x: 0, opacity: 1, transition: { duration: 0.25, ease: 'easeOut' } },
  exit: { x: -20, opacity: 0, transition: { duration: 0.2 } }
};

const validate = (step, data) => {
  switch (step) {
    case 1:
      if (!data.age || Number(data.age) < 10 || Number(data.age) > 100)
        return 'Please enter a valid age (10–100).';
      if (!data.weight || Number(data.weight) < 20 || Number(data.weight) > 300)
        return 'Please enter a valid weight (20–300 kg).';
      if (!data.height || Number(data.height) < 100 || Number(data.height) > 250)
        return 'Please enter a valid height (100–250 cm).';
      if (!data.sex)
        return 'Please select your biological sex.';
      return null;
    case 2:
      if (!data.activityLevel)
        return 'Please select your activity level.';
      return null;
    case 3:
      if (!data.goal)
        return 'Please select a primary objective.';
      return null;
    default:
      return null;
  }
};

export const Onboarding = () => {
  const [step, setStep] = useState(1);
  const [profileData, setProfileData] = useState({
    age: '',
    weight: '',
    height: '',
    sex: 'male',
    activityLevel: 'moderate',
    goal: '',
    conditions: []
  });
  const [error, setError] = useState(null);

  const { saveProfile } = useAuth();
  const navigate = useNavigate();

  const updateFields = (fields) => {
    setProfileData((prev) => ({ ...prev, ...fields }));
    setError(null); // clear error when user makes changes
  };

  const handleNext = () => {
    const validationError = validate(step, profileData);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    if (step < 4) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    setError(null);
    if (step > 1) setStep(step - 1);
  };

  const handleComplete = async () => {
    const tdee = calculateTDEE(profileData);
    const targetCalories = calculateTargetCalories({ tdee, goal: profileData.goal });

    const finalProfile = {
      ...profileData,
      tdee,
      targetCalories
    };

    await saveProfile(finalProfile);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-4">
      {/* Brand Header */}
      <div className="mb-6 text-center">
        <h1 className="font-serif text-2xl font-bold tracking-tight text-black">
          Nutri<span className="italic text-muted font-normal">Vedic</span>
        </h1>
        <span className="font-mono text-[10px] uppercase text-label tracking-widest block mt-1">
          PROFILE SETUP • STEP {step} OF 4
        </span>
      </div>

      {/* Single Centered Card 580px */}
      <div className="w-full max-w-[580px] bg-white border border-border rounded-card p-6 md:p-8 shadow-none flex flex-col justify-between min-h-[480px]">
        <div>
          <ProgressDots currentStep={step} totalSteps={4} />

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              variants={stepVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full"
            >
              {step === 1 && <StepPersonal data={profileData} onChange={updateFields} />}
              {step === 2 && <StepActivity data={profileData} onChange={updateFields} />}
              {step === 3 && <StepGoal data={profileData} onChange={updateFields} />}
              {step === 4 && <StepSummary data={profileData} />}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Validation Error Banner */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-lg"
          >
            <span className="text-red-500 text-base shrink-0">⚠️</span>
            <p className="font-sans text-xs text-red-700">{error}</p>
          </motion.div>
        )}

        {/* Footer Navigation Action Controls */}
        <div className="flex items-center justify-between pt-6 mt-4 border-t border-border">
          {step > 1 ? (
            <Button variant="secondary" onClick={handleBack}>
              ← Back
            </Button>
          ) : (
            <div />
          )}

          <Button variant="primary" onClick={handleNext}>
            {step === 4 ? 'Complete Setup →' : 'Continue →'}
          </Button>
        </div>
      </div>
    </div>
  );
};
