import { motion } from 'framer-motion';
import { ContractSection, TermSection } from '../ContractSection';
import { CONTRACT_TERMS } from '../../../constants/contractTerms';
import { itemVariants } from '../../../animations/variants';

interface LegalProvisionsSectionProps {
  isChecked: boolean;
  isInitialed: boolean;
  initialsData: string | null;
  onCheckChange: (checked: boolean) => void;
  onInitialsChange: (hasInitials: boolean, dataUrl: string | null) => void;
}

export function LegalProvisionsSection({
  isChecked,
  isInitialed,
  initialsData,
  onCheckChange,
  onInitialsChange
}: LegalProvisionsSectionProps) {
  const terms = CONTRACT_TERMS.legalProvisions;

  return (
    <motion.div variants={itemVariants} className="space-y-6">
      {/* Section Header */}
      <div className="border-b border-white/10 pb-4">
        <h2 className="text-2xl font-bold text-white">6. {terms.title}</h2>
        <p className="text-[#A3A3A3] mt-1">
          Review the legal terms governing this contract
        </p>
      </div>

      {/* Important Notice */}
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
        <p className="text-sm text-amber-400">
          <strong>Important:</strong> This section contains legally binding provisions including
          dispute resolution, limitation of liability, termination rights, and governing law.
          Please read carefully and consult with legal counsel if you have questions.
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

export default LegalProvisionsSection;
