import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { InitialsPad } from './InitialsPad';

interface ContractSectionProps {
  title?: string;
  children: React.ReactNode;
  requiresAck?: boolean;
  isChecked?: boolean;
  isInitialed?: boolean;
  initialsData?: string | null;
  onCheckChange?: (checked: boolean) => void;
  onInitialsChange?: (hasInitials: boolean, dataUrl: string | null) => void;
  className?: string;
}

export function ContractSection({
  children,
  requiresAck = false,
  isChecked = false,
  isInitialed = false,
  initialsData,
  onCheckChange,
  onInitialsChange,
  className = ''
}: ContractSectionProps) {
  const isComplete = !requiresAck || (isChecked && isInitialed);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={`bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm ${className}`}
    >
      {/* Content */}
      <div className="p-6 space-y-6">
        {children}
      </div>

      {/* Acknowledgment Section */}
      {requiresAck && (
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <div className="flex flex-col gap-4">
            {/* Checkbox */}
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="relative mt-0.5">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={(e) => onCheckChange?.(e.target.checked)}
                  className="sr-only peer"
                />
                <div className={`
                  w-6 h-6 rounded-lg border-2 transition-all duration-200 flex items-center justify-center
                  ${isChecked
                    ? 'border-[#14B8A6] bg-[#14B8A6]'
                    : 'border-gray-300 bg-transparent group-hover:border-gray-400'
                  }
                `}>
                  {isChecked && <Check className="w-4 h-4 text-white" />}
                </div>
              </div>
              <span className="text-sm text-gray-500 group-hover:text-gray-900 transition-colors">
                I have read and understand the terms in this section and agree to be bound by them.
              </span>
            </label>

            {/* Initials - 3x larger for easier signing */}
            <div className="flex items-start gap-3">
              <InitialsPad
                label="Initials"
                required
                initialValue={initialsData}
                onInitialsChange={onInitialsChange}
                width={240}
                height={150}
              />
            </div>
          </div>

          {/* Completion status */}
          {isComplete && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 flex items-center gap-2 text-[#14B8A6] text-sm"
            >
              <Check className="w-4 h-4" />
              <span>Section acknowledged</span>
            </motion.div>
          )}
        </div>
      )}
    </motion.div>
  );
}

// Sub-component for contract term sections
interface TermSectionProps {
  heading: string;
  content: readonly string[];
}

export function TermSection({ heading, content }: TermSectionProps) {
  return (
    <div className="space-y-2">
      <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
        {heading}
      </h4>
      <div className="text-sm text-gray-500 space-y-2 pl-1">
        {content.map((paragraph, idx) => (
          <p key={idx} className={paragraph.startsWith('•') ? 'pl-4' : ''}>
            {paragraph}
          </p>
        ))}
      </div>
    </div>
  );
}

export default ContractSection;
