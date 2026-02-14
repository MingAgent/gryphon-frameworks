import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { stepIndicatorVariants } from '../../../animations/variants';

export interface Step {
  id: number;
  title: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (step: number) => void;
}

export function StepIndicator({ steps, currentStep, onStepClick }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center mb-8 px-4">
      {steps.map((step, index) => {
        const isActive = currentStep === step.id;
        const isCompleted = currentStep > step.id;
        const isClickable = onStepClick && (isCompleted || step.id === currentStep);

        return (
          <div key={step.id} className="flex items-center">
            {/* Step Circle */}
            <motion.button
              variants={stepIndicatorVariants}
              initial="inactive"
              animate={isActive ? 'active' : isCompleted ? 'completed' : 'inactive'}
              onClick={() => isClickable && onStepClick?.(step.id)}
              disabled={!isClickable}
              className={`
                relative flex items-center justify-center
                w-11 h-11 rounded-full
                text-sm font-bold
                transition-all duration-300
                ${isClickable ? 'cursor-pointer' : 'cursor-default'}
                ${isActive
                  ? 'bg-gradient-to-br from-[#FF6A00] to-[#FF8533] text-white shadow-lg shadow-[#FF6A00]/30'
                  : isCompleted
                    ? 'bg-[#22C55E] text-white'
                    : 'bg-[#1A1A1A] text-white/70 border border-white/10'
                }
                focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/50 focus:ring-offset-2 focus:ring-offset-[#0A0A0A]
              `}
            >
              {/* Active glow ring */}
              {isActive && (
                <motion.div
                  className="absolute inset-0 rounded-full"
                  animate={{
                    boxShadow: [
                      '0 0 0 0 rgba(255, 106, 0, 0.4)',
                      '0 0 0 8px rgba(255, 106, 0, 0)',
                    ],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: 'easeOut',
                  }}
                />
              )}

              {isCompleted ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                >
                  <Check className="w-5 h-5" strokeWidth={3} />
                </motion.div>
              ) : (
                step.id
              )}
            </motion.button>

            {/* Step Title (visible on larger screens) */}
            <motion.span
              className="hidden lg:block ml-3 text-sm font-medium"
              animate={{
                color: isActive ? '#FF6A00' : isCompleted ? '#22C55E' : '#666666'
              }}
            >
              {step.title}
            </motion.span>

            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div className="relative mx-3 md:mx-4 w-8 md:w-16 lg:w-20">
                {/* Background Line */}
                <div className="absolute top-1/2 -translate-y-1/2 w-full h-0.5 bg-white/10 rounded-full" />
                {/* Progress Line */}
                <motion.div
                  className="absolute top-1/2 -translate-y-1/2 h-0.5 rounded-full"
                  style={{
                    background: isCompleted
                      ? '#22C55E'
                      : 'linear-gradient(90deg, #FF6A00 0%, rgba(255,106,0,0.3) 100%)'
                  }}
                  initial={{ width: 0 }}
                  animate={{
                    width: isCompleted ? '100%' : isActive ? '50%' : '0%'
                  }}
                  transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default StepIndicator;
