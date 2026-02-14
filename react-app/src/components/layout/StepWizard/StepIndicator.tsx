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
    <div className="flex items-start justify-between mb-8 px-1">
      {steps.map((step, index) => {
        const isActive = currentStep === step.id;
        const isCompleted = currentStep > step.id;
        const isClickable = onStepClick && (isCompleted || step.id === currentStep);

        return (
          <div key={step.id} className="flex items-start flex-1">
            {/* Step Circle + Title Column */}
            <div className="flex flex-col items-center min-w-0">
              <motion.button
                variants={stepIndicatorVariants}
                initial="inactive"
                animate={isActive ? 'active' : isCompleted ? 'completed' : 'inactive'}
                onClick={() => isClickable && onStepClick?.(step.id)}
                disabled={!isClickable}
                className={`
                  relative flex items-center justify-center
                  w-10 h-10 md:w-11 md:h-11 rounded-full
                  text-sm font-bold
                  transition-all duration-300 flex-shrink-0
                  ${isClickable ? 'cursor-pointer' : 'cursor-default'}
                  ${isCompleted
                    ? 'bg-[#22C55E] text-white'
                    : isActive
                      ? 'bg-gradient-to-br from-[#FF6A00] to-[#FF8533] text-white shadow-lg shadow-[#FF6A00]/30'
                      : 'bg-[#1e2a45] text-white border border-white/20'
                  }
                  focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/50 focus:ring-offset-2 focus:ring-offset-[#141d31]
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

              {/* Step Title - always visible, below the circle */}
              <motion.span
                className="mt-2 text-[10px] md:text-xs font-medium text-center leading-tight max-w-[60px] md:max-w-[80px]"
                animate={{
                  color: isCompleted
                    ? '#22C55E'
                    : isActive
                      ? '#FF6A00'
                      : '#1e3a5f'
                }}
              >
                {step.title}
              </motion.span>
            </div>

            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div className="relative flex-1 mx-1 md:mx-2 mt-5 md:mt-[22px]">
                {/* Background Line */}
                <div className="absolute top-0 w-full h-0.5 bg-white/10 rounded-full" />
                {/* Progress Line */}
                <motion.div
                  className="absolute top-0 h-0.5 rounded-full"
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
