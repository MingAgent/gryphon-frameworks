import { useMemo } from 'react';
import type { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { pageVariants } from '../../../animations/variants';
import { StepIndicator } from './StepIndicator';
import type { Step } from './StepIndicator';
import { StepNavigation } from './StepNavigation';

interface StepWizardProps {
  steps: Array<{
    id: number;
    title: string;
    component: ReactNode;
  }>;
  currentStep: number;
  onNext: () => void;
  onPrev: () => void;
  onStepClick?: (step: number) => void;
  isNextDisabled?: boolean;
  isPrevDisabled?: boolean;
  nextLabel?: string;
  prevLabel?: string;
  showNavigation?: boolean;
}

export function StepWizard({
  steps,
  currentStep,
  onNext,
  onPrev,
  onStepClick,
  isNextDisabled = false,
  isPrevDisabled = false,
  nextLabel,
  prevLabel,
  showNavigation = true
}: StepWizardProps) {
  const stepIndicators: Step[] = useMemo(
    () => steps.map(({ id, title }) => ({ id, title })),
    [steps]
  );

  const currentStepData = steps.find(s => s.id === currentStep);

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Step Indicator */}
      <StepIndicator
        steps={stepIndicators}
        currentStep={currentStep}
        onStepClick={onStepClick}
      />

      {/* Step Content with Animation - Glassmorphism Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="relative rounded-2xl overflow-hidden border-2 border-[#FF6A00] shadow-2xl shadow-orange-500/10"
          style={{
            background: 'rgba(255, 255, 255, 0.65)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }}
        >
          {/* Glassmorphism overlay effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent pointer-events-none" />

          {/* Step Header */}
          <div className="relative bg-gradient-to-r from-orange-600 to-orange-500 px-8 py-6">
            <motion.h2
              className="text-2xl font-bold text-white"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Step {currentStep}: {currentStepData?.title}
            </motion.h2>
          </div>

          {/* Step Body */}
          <div className="relative p-8">
            {currentStepData?.component}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      {showNavigation && (
        <StepNavigation
          currentStep={currentStep}
          totalSteps={steps.length}
          onNext={onNext}
          onPrev={onPrev}
          isNextDisabled={isNextDisabled}
          isPrevDisabled={isPrevDisabled || currentStep === 1}
          nextLabel={nextLabel || (currentStep === steps.length ? 'Finish' : 'Next')}
          prevLabel={prevLabel || 'Back'}
        />
      )}
    </div>
  );
}

export default StepWizard;
