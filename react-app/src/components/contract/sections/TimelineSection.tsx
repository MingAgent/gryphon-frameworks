import { motion } from 'framer-motion';
import { ContractSection, TermSection } from '../ContractSection';
import { CONTRACT_TERMS } from '../../../constants/contractTerms';
import { itemVariants } from '../../../animations/variants';

interface TimelineSectionProps {
  isChecked: boolean;
  isInitialed: boolean;
  initialsData: string | null;
  onCheckChange: (checked: boolean) => void;
  onInitialsChange: (hasInitials: boolean, dataUrl: string | null) => void;
}

export function TimelineSection({
  isChecked,
  isInitialed,
  initialsData,
  onCheckChange,
  onInitialsChange
}: TimelineSectionProps) {
  const terms = CONTRACT_TERMS.timeline;

  return (
    <motion.div variants={itemVariants} className="space-y-6">
      {/* Section Header */}
      <div className="border-b border-white/10 pb-4">
        <h2 className="text-2xl font-bold text-white">3. {terms.title}</h2>
        <p className="text-[#A3A3A3] mt-1">
          Understand how timeline changes and force majeure events are handled
        </p>
      </div>

      {/* Contract Terms */}
      <ContractSection
        title={terms.title}
        requiresAck={true}
        isChecked={isChecked}
        isInitialed={isInitialed}
        initialsData={initialsData}
        onCheckChange={onCheckChange}
        onInitialsChange={onInitialsChange}
      >
        <div className="space-y-6">
          {terms.sections.map((section, idx) => (
            <TermSection
              key={idx}
              heading={section.heading}
              content={section.content}
            />
          ))}
        </div>
      </ContractSection>
    </motion.div>
  );
}

export default TimelineSection;
