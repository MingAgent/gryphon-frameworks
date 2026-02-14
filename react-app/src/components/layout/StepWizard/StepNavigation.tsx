import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, FileText } from 'lucide-react';
import Button from '../../common/Button/Button';

interface StepNavigationProps {
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onPrev: () => void;
  isNextDisabled?: boolean;
  isPrevDisabled?: boolean;
  nextLabel?: string;
  prevLabel?: string;
}

export function StepNavigation({
  currentStep,
  totalSteps,
  onNext,
  onPrev,
  isNextDisabled = false,
  isPrevDisabled = false,
  nextLabel = 'Next',
  prevLabel = 'Back'
}: StepNavigationProps) {
  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === totalSteps;

  const handleNextClick = () => {
    if (isLastStep) {
      // On the last step, proceed directly to the contract
      window.dispatchEvent(new Event('showContract'));
    } else {
      onNext();
    }
  };

  return (
    <motion.div
      className="flex justify-between items-center mt-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      {/* Previous Button */}
      <Button
        variant="secondary"
        onClick={onPrev}
        disabled={isPrevDisabled || isFirstStep}
        leftIcon={<ArrowLeft className="w-5 h-5" />}
        className={isFirstStep ? 'invisible' : ''}
      >
        {prevLabel}
      </Button>

      {/* Step Counter */}
      <motion.div
        className="text-sm text-gray-500"
        key={currentStep}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        Step {currentStep} of {totalSteps}
      </motion.div>

      {/* Next / Proceed to Contract Button */}
      <Button
        variant="primary"
        onClick={handleNextClick}
        disabled={isNextDisabled}
        rightIcon={isLastStep ? <FileText className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
      >
        {isLastStep ? 'Proceed to Contract' : nextLabel}
      </Button>
    </motion.div>
  );
}

export default StepNavigation;
