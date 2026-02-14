import { Check, Lock } from 'lucide-react';
import { CONTRACT_SECTIONS } from '../../constants/contractTerms';

interface ContractProgressProps {
  currentSection: number;
  completedSections: Set<string>;
  onSectionClick: (index: number) => void;
}

export function ContractProgress({
  currentSection,
  completedSections,
  onSectionClick
}: ContractProgressProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 sticky top-4 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">
        Contract Progress
      </h3>

      <div className="space-y-1">
        {CONTRACT_SECTIONS.map((section, index) => {
          const isComplete = completedSections.has(section.id);
          const isCurrent = currentSection === index;
          const canNavigate = index <= currentSection || completedSections.has(CONTRACT_SECTIONS[index - 1]?.id);

          return (
            <button
              key={section.id}
              onClick={() => canNavigate && onSectionClick(index)}
              disabled={!canNavigate}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all
                ${isCurrent
                  ? 'bg-[#14B8A6]/10 border border-[#14B8A6]/30'
                  : canNavigate
                    ? 'hover:bg-gray-100 border border-transparent'
                    : 'opacity-50 cursor-not-allowed border border-transparent'
                }
              `}
            >
              {/* Status Icon */}
              <div className={`
                flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center
                ${isComplete
                  ? 'bg-[#14B8A6] text-white'
                  : isCurrent
                    ? 'border-2 border-[#14B8A6] text-[#14B8A6]'
                    : 'border-2 border-gray-300 text-gray-400'
                }
              `}>
                {isComplete ? (
                  <Check className="w-3.5 h-3.5" />
                ) : !canNavigate ? (
                  <Lock className="w-3 h-3" />
                ) : (
                  <span className="text-xs font-medium">{index + 1}</span>
                )}
              </div>

              {/* Section Title */}
              <div className="flex-1 min-w-0">
                <span className={`
                  block text-sm truncate
                  ${isCurrent
                    ? 'text-gray-900 font-medium'
                    : isComplete
                      ? 'text-[#14B8A6]'
                      : 'text-gray-500'
                  }
                `}>
                  {section.title}
                </span>
                {section.requiresAck && (
                  <span className="text-xs text-gray-400">
                    {isComplete ? 'Acknowledged' : 'Requires acknowledgment'}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Progress Bar */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
          <span>Progress</span>
          <span>{completedSections.size} of {CONTRACT_SECTIONS.length} sections</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#14B8A6] to-[#14B8A6]/70 transition-all duration-500"
            style={{ width: `${(completedSections.size / CONTRACT_SECTIONS.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export default ContractProgress;
