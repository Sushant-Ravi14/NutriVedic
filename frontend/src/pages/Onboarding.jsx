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

export const Onboarding = () => {
  const [step, setStep] = useState(1);
  const [profileData, setProfileData] = useState({
    age: 28,
    weight: 72,
    height: 175,
    sex: 'male',
    activityLevel: 'moderate',
    goal: 'manage_disease',
    conditions: ['Type 2 Diabetes', 'Hypertension']
  });

  const { saveProfile } = useAuth();
  const navigate = useNavigate();

  const updateFields = (fields) => {
    setProfileData((prev) => ({ ...prev, ...fields }));
  };

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
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

        {/* Footer Navigation Action Controls */}
        <div className="flex items-center justify-between pt-6 mt-6 border-t border-border">
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
