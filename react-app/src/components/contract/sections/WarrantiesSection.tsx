import { motion } from 'framer-motion';
import { ContractSection, TermSection } from '../ContractSection';
import { CONTRACT_TERMS } from '../../../constants/contractTerms';
import { itemVariants } from '../../../animations/variants';

interface WarrantiesSectionProps {
  isChecked: boolean;
  isInitialed: boolean;
  initialsData: string | null;
  onCheckChange: (checked: boolean) => void;
  onInitialsChange: (hasInitials: boolean, dataUrl: string | null) => void;
}

export function WarrantiesSection({
  isChecked,
  isInitialed,
  initialsData,
  onCheckChange,
  onInitialsChange
}: WarrantiesSectionProps) {
  const terms = CONTRACT_TERMS.warranties;

  return (
    <motion.div variants={itemVariants} className="space-y-6">
      {/* Section Header */}
      <div className="border-b border-white/10 pb-4">
        <h2 className="text-2xl font-bold text-white">5. {terms.title}</h2>
        <p className="text-[#A3A3A3] mt-1">
          Understand our warranty coverage and insurance requirements
        </p>
      </div>

      {/* Warranty Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#111111] rounded-xl border border-white/10 p-4 text-center">
          <div className="text-3xl font-bold text-[#14B8A6]">1 Year</div>
          <p className="text-sm text-[#A3A3A3] mt-1">Workmanship Warranty</p>
        </div>
        <div className="bg-[#111111] rounded-xl border border-white/10 p-4 text-center">
          <div className="text-3xl font-bold text-[#14B8A6]">40 Years</div>
          <p className="text-sm text-[#A3A3A3] mt-1">Roof Panel Warranty*</p>
        </div>
        <div className="bg-[#111111] rounded-xl border border-white/10 p-4 text-center">
          <div className="text-3xl font-bold text-[#14B8A6]">40 Years</div>
          <p className="text-sm text-[#A3A3A3] mt-1">Paint Finish Warranty*</p>
        </div>
      </div>
      <p className="text-xs text-[#A3A3A3] text-center">*Manufacturer warranty - see terms below for details</p>

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

export default WarrantiesSection;
