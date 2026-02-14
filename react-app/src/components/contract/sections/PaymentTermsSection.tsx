import { motion } from 'framer-motion';
import { ContractSection, TermSection } from '../ContractSection';
import { CONTRACT_TERMS } from '../../../constants/contractTerms';
import { useEstimatorStore } from '../../../store/estimatorStore';
import { itemVariants } from '../../../animations/variants';

interface PaymentTermsSectionProps {
  isChecked: boolean;
  isInitialed: boolean;
  initialsData: string | null;
  onCheckChange: (checked: boolean) => void;
  onInitialsChange: (hasInitials: boolean, dataUrl: string | null) => void;
}

export function PaymentTermsSection({
  isChecked,
  isInitialed,
  initialsData,
  onCheckChange,
  onInitialsChange
}: PaymentTermsSectionProps) {
  const { pricing } = useEstimatorStore();
  const terms = CONTRACT_TERMS.paymentTerms;

  // Calculate draw amounts based on actual pricing
  const draw1 = pricing.grandTotal * 0.30;
  const draw2 = pricing.grandTotal * 0.30;
  const draw3 = pricing.grandTotal * 0.30;
  const finalDraw = pricing.grandTotal * 0.10;

  return (
    <motion.div variants={itemVariants} className="space-y-6">
      {/* Section Header */}
      <div className="border-b border-white/10 pb-4">
        <h2 className="text-2xl font-bold text-white">2. {terms.title}</h2>
        <p className="text-[#A3A3A3] mt-1">
          Review the payment schedule and terms for your project
        </p>
      </div>

      {/* Payment Summary Card */}
      <div className="bg-gradient-to-br from-[#14B8A6]/20 to-[#14B8A6]/5 rounded-xl border border-[#14B8A6]/20 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Your Payment Schedule</h3>

        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-white/10">
            <div>
              <span className="text-white font-medium">Draw 1 (30%)</span>
              <p className="text-xs text-[#A3A3A3]">Due upon contract signing</p>
            </div>
            <span className="text-[#14B8A6] font-bold text-lg">${draw1.toLocaleString()}</span>
          </div>

          <div className="flex justify-between items-center py-2 border-b border-white/10">
            <div>
              <span className="text-white font-medium">Draw 2 (30%)</span>
              <p className="text-xs text-[#A3A3A3]">Due upon delivery of materials</p>
            </div>
            <span className="text-white font-bold text-lg">${draw2.toLocaleString()}</span>
          </div>

          <div className="flex justify-between items-center py-2 border-b border-white/10">
            <div>
              <span className="text-white font-medium">Draw 3 (30%)</span>
              <p className="text-xs text-[#A3A3A3]">Due upon completion of framing</p>
            </div>
            <span className="text-white font-bold text-lg">${draw3.toLocaleString()}</span>
          </div>

          <div className="flex justify-between items-center py-2">
            <div>
              <span className="text-white font-medium">Final Draw (10%)</span>
              <p className="text-xs text-[#A3A3A3]">Due upon Substantial Completion</p>
            </div>
            <span className="text-white font-bold text-lg">${finalDraw.toLocaleString()}</span>
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-[#14B8A6]/30">
            <span className="text-white font-bold">Total Contract Sum</span>
            <span className="text-[#14B8A6] font-bold text-2xl">${pricing.grandTotal.toLocaleString()}</span>
          </div>
        </div>
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

export default PaymentTermsSection;
